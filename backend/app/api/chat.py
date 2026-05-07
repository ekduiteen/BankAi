from typing import Any, List, Optional
from pathlib import Path
import os
import uuid
import logging
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
import json
import httpx
from ..core.limiter import limiter

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.pptx', '.ppt'}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


def _safe_filename(session_id: int, original: str) -> str:
    ext = Path(original).suffix.lower()
    return f"{session_id}_{uuid.uuid4().hex}{ext}"

from ..db.session import get_session
from ..models.user import User
from ..models.chat import ChatSession, ChatMessage
from ..schemas.chat import ChatSessionCreate, ChatSessionResponse, ChatRequest, ChatMessageResponse
from .deps import get_current_user
from ..services.rag_service import generate_rag_response, async_generate_rag_response, get_system_identity, RAG_PROMPT_TEMPLATE, GENERAL_PROMPT_TEMPLATE
from ..services.audit_service import log_audit_event
from ..services.guardrail_service import detect_prompt_injection, detect_and_mask_pii
from ..services.query_rewrite_service import rewrite_query_for_retrieval
from ..services.llm_gateway import model_status, reserve_model, resolve_model_profile
from ..core.config import settings


def _resolve_model_endpoint(model_name: Optional[str]) -> tuple[str, str, str]:
    """
    Map model name to (API_BASE, MODEL, API_KEY).
    Returns default (LLM_A) if model_name is None or unknown.
    """
    model_map = {
        'gemma-4': (settings.LLM_A_API_BASE, settings.LLM_A_MODEL, settings.LLM_A_API_KEY),
        'gemma-4-26b-4bit': (settings.LLM_C_API_BASE, settings.LLM_C_MODEL, settings.LLM_C_API_KEY),
    }
    if model_name in model_map:
        return model_map[model_name]
    # Default to LLM_A if not found
    return (settings.LLM_A_API_BASE, settings.LLM_A_MODEL, settings.LLM_A_API_KEY)


def _model_supports_vision(model_name: Optional[str]) -> bool:
    """
    Check if a model supports vision/image analysis.
    For now, none of the vLLM text models support vision — fallback to general prompt.
    """
    # All current models are text-only; would need multimodal models to support vision
    return False

router = APIRouter()

CHAT_UPLOAD_DIR = settings.CHAT_UPLOAD_DIR


def ensure_chat_upload_dir() -> None:
    import os
    os.makedirs(CHAT_UPLOAD_DIR, exist_ok=True)


@router.get("/models/status")
async def read_model_status(current_user: User = Depends(get_current_user)) -> dict:
    return await model_status()


def _session_active_document_ids(session: ChatSession, requested_ids: Optional[List[int]] = None) -> list[int]:
    try:
        stored_ids = json.loads(session.active_document_ids_json or "[]")
    except Exception:
        stored_ids = []

    merged: list[int] = []
    for doc_id in [*stored_ids, *(requested_ids or [])]:
        try:
            doc_id = int(doc_id)
        except (TypeError, ValueError):
            continue
        if doc_id not in merged:
            merged.append(doc_id)
    return merged


def _track_session_document(session: ChatSession, document_id: int, db: Session) -> None:
    active_docs = _session_active_document_ids(session)
    if document_id not in active_docs:
        active_docs.append(document_id)
        session.active_document_ids_json = json.dumps(active_docs)
        db.add(session)
        db.commit()


def _maybe_update_session_title(session: ChatSession, message: str, db: Session) -> None:
    if session.title and session.title not in ("New Conversation", "New Analysis"):
        return
    title = " ".join(message.strip().split())[:60]
    if len(message.strip()) > 60:
        title = title.rstrip() + "..."
    if title:
        session.title = title
        db.add(session)
        db.commit()


def _update_session_summary(session: ChatSession, user_message: str, assistant_message: str, db: Session) -> None:
    summary = f"User asked: {user_message[:220]}"
    if assistant_message:
        summary += f"\nBankAi answered: {assistant_message[:320]}"
    session.session_summary = summary
    db.add(session)
    db.commit()

@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(
    *,
    db: Session = Depends(get_session),
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.bank_id is None:
        from ..models.bank import Bank
        default_bank = db.exec(select(Bank).where(Bank.code == "DEFAULT")).first()
        if default_bank:
            current_user.bank_id = default_bank.id
        else:
            raise HTTPException(status_code=500, detail="User has no bank assigned and no default bank exists")
            
    session = ChatSession(
        bank_id=current_user.bank_id,
        user_id=current_user.id,
        title=session_in.title
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions", response_model=List[ChatSessionResponse])
def read_chat_sessions(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve chat sessions for current user.
    """
    sessions = db.exec(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .offset(skip).limit(limit)
    ).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def read_chat_session(
    *,
    db: Session = Depends(get_session),
    session_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def read_chat_messages(
    *,
    db: Session = Depends(get_session),
    session_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all messages for a chat session.
    """
    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()
    return messages

@router.post("/sessions/{session_id}/messages")
@limiter.limit("30/minute")
async def create_chat_message(
    request: Request,
    *,
    db: Session = Depends(get_session),
    session_id: int,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Guardrail checks
    if detect_prompt_injection(chat_request.message, db, current_user.id, current_user.bank_id):
        raise HTTPException(status_code=400, detail="Query rejected due to security policy.")

    safe_message = detect_and_mask_pii(chat_request.message)

    # 2. Save user message
    user_msg = ChatMessage(
        bank_id=current_user.bank_id,
        session_id=session_id,
        user_id=current_user.id,
        role="user",
        content=safe_message
    )
    db.add(user_msg)
    db.commit()
    _maybe_update_session_title(session, safe_message, db)

    from sqlalchemy import asc
    history = db.exec(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.created_at)).limit(20)
    ).all()
    retrieval_query = rewrite_query_for_retrieval(safe_message, history[:-1])

    # 3. Build prompt and call LLM async
    sys_identity = get_system_identity(chat_request.language)
    if chat_request.image:
        from ..services.llm_service import async_call_vision_llm
        answer = await async_call_vision_llm(f"{sys_identity}\n\n{chat_request.message}", chat_request.image)
        sources = []
    else:
        active_doc_ids = _session_active_document_ids(session, chat_request.active_document_ids)
        answer, sources = await async_generate_rag_response(
            retrieval_query,
            current_user.bank_id,
            current_user.role,
            db,
            chat_request.language,
            active_document_ids=active_doc_ids,
            session_id=session_id,
            user_id=current_user.id,
        )
    
    # 4. Save AI message
    ai_msg = ChatMessage(
        bank_id=current_user.bank_id,
        session_id=session_id,
        user_id=current_user.id,
        role="assistant",
        content=answer,
        sources_json=json.dumps(sources)
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    _update_session_summary(session, safe_message, answer, db)
    
    log_audit_event(
        db=db,
        action="chat_query",
        resource_type="chat",
        resource_id=str(session_id),
        bank_id=current_user.bank_id,
        user_id=current_user.id,
        metadata={
            "query": safe_message,
            "pii_detected": safe_message != chat_request.message,
            "masking_mode": "redact",
            "llm_received_masked_input": True,
            "sources_count": len(sources),
            "rewritten_query": retrieval_query if retrieval_query != safe_message else None,
        }
    )
    
    return ai_msg

@router.post("/sessions/{session_id}/stream")
@limiter.limit("30/minute")
async def stream_chat_message(
    request: Request,
    *,
    db: Session = Depends(get_session),
    session_id: int,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Stream a chat response using Server-Sent Events.
    """
    logger.info(f"[STREAM] Route handler called for session {session_id}")
    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    if detect_prompt_injection(chat_request.message, db, current_user.id, current_user.bank_id):
        raise HTTPException(status_code=400, detail="Query rejected due to security policy.")

    safe_message = detect_and_mask_pii(chat_request.message)

    # Save user message
    user_msg = ChatMessage(
        bank_id=current_user.bank_id,
        session_id=session_id,
        user_id=current_user.id,
        role="user",
        content=safe_message
    )
    db.add(user_msg)
    db.commit()
    _maybe_update_session_title(session, safe_message, db)

    from sqlalchemy import asc
    history = db.exec(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.created_at)).limit(20)
    ).all()
    retrieval_query = rewrite_query_for_retrieval(safe_message, history[:-1])

    active_doc_ids = _session_active_document_ids(session, chat_request.active_document_ids)
    has_image = bool(chat_request.image)

    async def event_stream():
        logger.info("[STREAM] Starting event_stream")

        # Check if user selected a model and uploaded an image
        selected_model = chat_request.model_override
        if has_image and selected_model and not _model_supports_vision(selected_model):
            yield f"data: {json.dumps({'type': 'status', 'message': '⚠️ Warning: The selected model does not support image analysis. Using text-based analysis instead.'})}\n\n"

        yield f"data: {json.dumps({'type': 'status', 'message': 'Searching your uploaded documents...'})}\n\n"

        sources_list = []
        sys_identity = get_system_identity(chat_request.language)
        logger.info("[STREAM] Got system identity")

        if not has_image:
            try:
                logger.info("[STREAM] Starting RAG search")
                from ..services.embedding_service import generate_embeddings
                from ..services.qdrant_service import search_points
                from ..models.document import Document

                logger.info(f"[STREAM] Generating embeddings for query: {retrieval_query[:50]}")
                embeddings = await asyncio.to_thread(generate_embeddings, [retrieval_query])
                query_vector = embeddings[0]
                logger.info("[STREAM] Embeddings generated")

                session_results = []
                if active_doc_ids:
                    session_results = search_points(
                        query_vector,
                        current_user.bank_id,
                        limit=5,
                        document_ids=active_doc_ids,
                        session_id=session_id,
                        document_scope="session_upload",
                    )

                global_limit = max(0, 5 - len(session_results))
                global_results = []
                if global_limit > 0:
                    global_results = search_points(
                        query_vector,
                        current_user.bank_id,
                        limit=global_limit,
                        document_scope="global_knowledge",
                    )
                    seen = {r.payload.get("document_id") for r in session_results if r.payload}
                    global_results = [r for r in global_results if r.payload and r.payload.get("document_id") not in seen]

                results = session_results + global_results

                if results:
                    doc_ids = list(set(r.payload.get("document_id") for r in results if r.payload))
                    allowed_docs = set()
                    for doc_id in doc_ids:
                        doc = db.get(Document, doc_id)
                        if doc and doc.status in ("approved", "indexed", "ready"):
                            if doc.document_scope == "session_upload" and doc.session_id != session_id:
                                continue
                            if current_user.role == "staff_user" and doc.access_level and doc.access_level > 0:
                                continue
                            allowed_docs.add(doc_id)

                    filtered = [r for r in results if r.payload and r.payload.get("document_id") in allowed_docs]

                    if filtered:
                        context = "\n\n---\n\n".join(r.payload.get("text", "") for r in filtered)
                        sys_identity += (
                            f"\n\n--- DOCUMENT CONTEXT ---\n"
                            f"Use the following context from approved documents to answer the user's question.\n\n"
                            f"{context}\n--- END DOCUMENT CONTEXT ---"
                        )
                        seen_src: set[int] = set()
                        for r in filtered:
                            doc_id = r.payload.get("document_id")
                            if doc_id and doc_id not in seen_src:
                                doc = db.get(Document, doc_id)
                                sources_list.append({
                                    "document_id":    doc_id,
                                    "document_title": (doc.title or doc.file_name) if doc else "Database Source",
                                    "title":          (doc.title or doc.file_name) if doc else "Database Source",
                                    "snippet":        r.payload.get("text", "")[:120] + "...",
                                    "page_number":    r.payload.get("page_number"),
                                })
                                seen_src.add(doc_id)
            except Exception as e:
                logger.error(f"RAG failed in stream: {e}")

        logger.info("[STREAM] About to yield prepare status")
        yield f"data: {json.dumps({'type': 'status', 'message': 'Preparing source-based answer...'})}\n\n"

        vllm_messages = [{"role": "system", "content": sys_identity}]
        for msg in history[-10:]:
            vllm_messages.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content,
            })

        selected_profile = resolve_model_profile(chat_request.model_override)
        status = await model_status()
        selected_status = status.get(selected_profile.key, {})
        if selected_status.get("active", 0) >= selected_status.get("limit", 1):
            yield f"data: {json.dumps({'type': 'status', 'message': 'All model workers are busy. Your request is queued.'})}\n\n"

        full_response = ""
        try:
            async with reserve_model(
                user_id=current_user.id,
                role=current_user.role,
                model_name=chat_request.model_override,
            ) as lease:
                profile = lease.profile
                if lease.queued_ahead > 0:
                    yield f"data: {json.dumps({'type': 'status', 'message': f'Queued behind {lease.queued_ahead} request(s).'})}\n\n"

                url = f"{profile.api_base}/v1/chat/completions"
                headers = {"Authorization": f"Bearer {profile.api_key}"}
                payload = {
                    "model": profile.model,
                    "messages": vllm_messages,
                    "stream": True,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": profile.max_tokens,
                }

                logger.info(f"[STREAM] About to call vLLM at {url} with model={profile.model}")
                logger.info("[STREAM] Creating httpx client")
                async with httpx.AsyncClient(timeout=profile.timeout_seconds) as client:
                    logger.info("[STREAM] Streaming from vLLM...")
                    async with client.stream("POST", url, json=payload, headers=headers) as response:
                        logger.info(f"[STREAM] Got vLLM response: {response.status_code}")
                        if response.status_code != 200:
                            body = await response.aread()
                            logger.error(f"[STREAM] vLLM error body: {body[:500]}")
                            yield f"data: {json.dumps({'token': f'AI engine returned error {response.status_code}.', 'done': True})}\n\n"
                            return
                        logger.info("[STREAM] Starting to read vLLM lines")
                        token_count = 0
                        async for line in response.aiter_lines():
                            if not line.startswith("data: "):
                                continue
                            chunk = line[6:]
                            if chunk == "[DONE]":
                                logger.info("[STREAM] Got [DONE]")
                                break
                            try:
                                data = json.loads(chunk)
                                if data.get("choices"):
                                    delta = data["choices"][0].get("delta", {})
                                    token = delta.get("content", "")
                                    if token:
                                        token_count += 1
                                        full_response += token
                                        logger.debug(f"[STREAM] Token {token_count}: {token[:20]}")
                                        yield f"data: {json.dumps({'token': token})}\n\n"
                            except json.JSONDecodeError:
                                continue
        except asyncio.TimeoutError:
            logger.error("[STREAM] Timed out waiting for model capacity")
            yield f"data: {json.dumps({'token': 'AI engine is busy. Please retry shortly.', 'done': True})}\n\n"
            return
        except Exception as e:
            logger.error(f"[STREAM] Streaming error: {e}")
            yield f"data: {json.dumps({'token': 'Error connecting to AI engine.', 'done': True})}\n\n"
            return

        logger.info(f"[STREAM] Done. tokens={len(full_response)}")

        # Skip suggestions during streaming (would block the async generator)
        # Could generate async in background if needed
        suggestions = []

        try:
            ai_msg = ChatMessage(
                bank_id=current_user.bank_id,
                session_id=session_id,
                user_id=current_user.id,
                role="assistant",
                content=full_response,
                sources_json=json.dumps(sources_list),
                suggestions_json=json.dumps(suggestions),
            )
            db.add(ai_msg)
            db.commit()
            _update_session_summary(session, safe_message, full_response, db)
            log_audit_event(
                db=db,
                action="chat_query",
                resource_type="chat",
                resource_id=str(session_id),
                bank_id=current_user.bank_id,
                user_id=current_user.id,
                metadata={
                    "query": safe_message,
                    "pii_detected": safe_message != chat_request.message,
                    "masking_mode": "redact",
                    "llm_received_masked_input": True,
                    "sources_count": len(sources_list),
                    "rewritten_query": retrieval_query if retrieval_query != safe_message else None,
                    "streamed": True,
                },
            )
        except Exception as e:
            logger.error(f"[STREAM] Error saving message: {e}")

        yield f"data: {json.dumps({'done': True, 'sources': sources_list, 'suggestions': suggestions})}\n\n"

    logger.info("[STREAM] About to return StreamingResponse with event_stream generator")
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.post("/sessions/{session_id}/files")
async def upload_session_file(
    *,
    db: Session = Depends(get_session),
    session_id: int,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """
    Upload a file to a specific chat session for background processing.
    """
    from ..models.document import Document
    import shutil

    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported")

    ensure_chat_upload_dir()
    safe_name = _safe_filename(session_id, file.filename)
    file_path = os.path.join(CHAT_UPLOAD_DIR, safe_name)

    # Read file content asynchronously
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    # Write to disk
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    file_ext = ext.lstrip(".")
    doc = Document(
        bank_id=current_user.bank_id,
        uploaded_by=current_user.id,
        title=file.filename,
        file_name=file.filename,
        file_type=file_ext,
        file_path=file_path,
        document_type="chat_upload",
        status="uploaded",
        session_id=session_id,
        document_scope="session_upload"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    _track_session_document(session, doc.id, db)

    from ..services.ingestion_service import process_document
    background_tasks.add_task(process_document, doc.id)
    
    return {
        "id": doc.id,
        "document_id": doc.id,
        "session_id": session_id,
        "file_name": file.filename,
        "name": file.filename,
        "status": "uploaded"
    }

@router.post("/sessions/{session_id}/stream-file")
async def stream_chat_with_file(
    *,
    db: Session = Depends(get_session),
    session_id: int,
    message: str = Form(...),
    language: str = Form("en"),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """
    Upload a file and stream AI analysis of its contents.
    Supports PDF, DOCX, XLSX, PPTX, TXT, and images.
    """
    import shutil, base64
    from ..models.document import Document

    session = db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported")

    ensure_chat_upload_dir()
    safe_name = _safe_filename(session_id, file.filename)
    file_path = os.path.join(CHAT_UPLOAD_DIR, safe_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.getsize(file_path) > MAX_UPLOAD_BYTES:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    file_ext = ext.lstrip(".")
    doc = Document(
        bank_id=current_user.bank_id,
        uploaded_by=current_user.id,
        title=file.filename,
        file_name=file.filename,
        file_type=file_ext,
        file_path=file_path,
        document_type="chat_upload",
        status="uploaded",
        session_id=session_id,
        document_scope="session_upload",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    _track_session_document(session, doc.id, db)

    # Save user message
    user_msg = ChatMessage(
        bank_id=current_user.bank_id,
        session_id=session_id,
        user_id=current_user.id,
        role="user",
        content=f"[File: {file.filename}] {message}"
    )
    db.add(user_msg)
    db.commit()
    _maybe_update_session_title(session, message, db)
    
    from sqlalchemy import asc
    history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(asc(ChatMessage.created_at)).all()
    
    sys_identity = get_system_identity(language)
    vllm_messages = [{"role": "system", "content": sys_identity}]
    for msg in history[-10:]:
        vllm_messages.append({
            "role": "assistant" if msg.role == "assistant" else "user",
            "content": msg.content
        })

    is_image = file_ext in ['jpg', 'jpeg', 'png']

    if is_image:
        with open(file_path, 'rb') as f:
            image_b64 = base64.b64encode(f.read()).decode('utf-8')
        vllm_messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": f"I uploaded \"{file.filename}\". {message}"},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
            ]
        })
    else:
        from ..services.ingestion_service import extract_text
        extracted = extract_text(file_path, file_ext)
        if not extracted.strip():
            extracted = "(No text could be extracted from this file)"
        if len(extracted) > 8000:
            extracted = extracted[:8000] + "\n\n... (truncated)"
        vllm_messages.append({
            "role": "user",
            "content": f"I have uploaded \"{file.filename}\".\n\n--- FILE CONTENT ---\n{extracted}\n--- END FILE CONTENT ---\n\nMy request: {message}"
        })

    from ..services.ingestion_service import process_document
    background_tasks.add_task(process_document, doc.id)

    async def event_stream():
        full_response = ""

        yield f"data: {json.dumps({'type': 'status', 'message': 'Analyzing uploaded file...'})}\n\n"

        try:
            async with reserve_model(
                user_id=current_user.id,
                role=current_user.role,
                model_name=None,
            ) as lease:
                profile = lease.profile
                if lease.queued_ahead > 0:
                    yield f"data: {json.dumps({'type': 'status', 'message': f'Queued behind {lease.queued_ahead} request(s).'})}\n\n"

                url = f"{profile.api_base}/v1/chat/completions"
                headers = {"Authorization": f"Bearer {profile.api_key}"}
                payload = {
                    "model": profile.model,
                    "messages": vllm_messages,
                    "stream": True,
                    "temperature": 0.7,
                    "max_tokens": profile.max_tokens,
                }

                async with httpx.AsyncClient(timeout=profile.timeout_seconds) as client:
                    async with client.stream("POST", url, json=payload, headers=headers) as response:
                        if response.status_code != 200:
                            body = await response.aread()
                            logger.error(f"[STREAM-FILE] vLLM error {response.status_code}: {body[:300]}")
                            yield f"data: {json.dumps({'token': 'Error connecting to AI engine.'})}\n\n"
                        else:
                            async for line in response.aiter_lines():
                                if not line.startswith("data: "):
                                    continue
                                chunk = line[6:]
                                if chunk == "[DONE]":
                                    break
                                try:
                                    data = json.loads(chunk)
                                    if data.get("choices"):
                                        token = data["choices"][0].get("delta", {}).get("content", "")
                                        if token:
                                            full_response += token
                                            yield f"data: {json.dumps({'token': token})}\n\n"
                                except json.JSONDecodeError:
                                    continue
        except asyncio.TimeoutError:
            logger.error("[STREAM-FILE] Timed out waiting for model capacity")
            yield f"data: {json.dumps({'token': 'AI engine is busy. Please retry shortly.'})}\n\n"
        except Exception as e:
            logger.error(f"[STREAM-FILE] Error: {e}")
            yield f"data: {json.dumps({'token': 'Error connecting to AI engine.'})}\n\n"

        try:
            ai_msg = ChatMessage(
                bank_id=current_user.bank_id,
                session_id=session_id,
                user_id=current_user.id,
                role="assistant",
                content=full_response,
                sources_json=json.dumps([{
                    "document_id": doc.id,
                    "document_title": doc.title or doc.file_name,
                    "title": doc.title or doc.file_name,
                    "file_name": doc.file_name,
                }])
            )
            db.add(ai_msg)
            db.commit()
            _update_session_summary(session, message, full_response, db)
        except Exception as e:
            logger.error(f"[STREAM-FILE] Error saving message: {e}")

        yield f"data: {json.dumps({'done': True, 'id': doc.id, 'document_id': doc.id})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
