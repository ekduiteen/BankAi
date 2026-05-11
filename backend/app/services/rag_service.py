import re

from sqlmodel import Session
from .embedding_service import generate_embeddings
from .qdrant_service import search_points
from .llm_service import call_llm, async_call_llm
from ..models.document import Document

NOT_FOUND_RESPONSE = (
    "I could not find this in the approved documents. "
    "Please consult the relevant policy or contact your supervisor."
)


def get_system_identity(language: str = "en") -> str:
    lang_instruction = (
        "You must ONLY reply in English. Greet users with 'Namaste' (never Namaskar)."
        if language == "en"
        else "You must ONLY reply in Nepali language (Devenagari script). Greet users with 'नमस्ते' (never नमस्कार)."
    )
    return f"""You are BankAi, a secure and intelligent banking assistant.
Never refer to yourself as Gemma, Google, or any other AI model name. You are BankAi.
Always be professional, helpful, and concise. {lang_instruction}
You may use markdown formatting such as **bold**, bullet points, and numbered lists for clarity."""


RAG_PROMPT_TEMPLATE = """{system}

Answer the user's question using ONLY the provided context from approved bank documents.
If the context does not contain enough information to answer, respond with exactly:
"I could not find this in the approved documents. Please consult the relevant policy or contact your supervisor."
Do NOT use your general knowledge to answer banking, compliance, or policy questions.
When the answer comes from a policy, directive, circular, or procedure, mention the source document and any available section/page reference.

Context:
{context}

Question: {question}

Answer:"""

GENERAL_PROMPT_TEMPLATE = """{system}

You can answer general questions about banking, finance, compliance, and business.
Be professional, accurate, and concise.
If you are unsure, say so honestly.

Question: {question}

Answer:"""


SECTION_RE = re.compile(
    r"\b(?:section|sec\.?|clause|article|chapter|part)\s+([0-9]+(?:\.[0-9]+)*)\b|"
    r"\b(?:दफा|परिच्छेद|बुँदा)\s*([०-९0-9]+(?:[.\-][०-९0-9]+)*)",
    re.IGNORECASE,
)


def _extract_section_label(text: str | None) -> str | None:
    if not text:
        return None
    match = SECTION_RE.search(text[:1200])
    if not match:
        return None
    number = next((group for group in match.groups() if group), None)
    if not number:
        return None
    label = match.group(0).strip()
    return " ".join(label.split())[:80]


def _build_source(doc: Document, score: float, result=None) -> dict:
    payload = getattr(result, "payload", {}) or {}
    section_label = payload.get("section_label") or payload.get("section_number") or _extract_section_label(payload.get("text"))
    return {
        "document_id":     doc.id,
        "document_title":  doc.title or doc.file_name,
        "title":           doc.title or doc.file_name,
        "file_name":       doc.file_name,
        "document_type":   doc.document_type,
        "department":      doc.department,
        "page_number":     payload.get("page_number"),
        "section_label":   section_label,
        "section_number":  section_label,
        "chunk_index":     payload.get("chunk_index"),
        "snippet":         (payload.get("text") or "")[:180],
        "relevance_score": score,
    }


def _filter_results(results, db, session_id, user_role):
    doc_ids = list(set(r.payload.get("document_id") for r in results if r.payload))
    allowed_docs = set()
    for doc_id in doc_ids:
        doc = db.get(Document, doc_id)
        if doc and doc.status in ("approved", "indexed", "ready"):
            if doc.document_scope == "session_upload" and doc.session_id != session_id:
                continue
            if user_role == "staff_user" and doc.access_level and doc.access_level > 0:
                continue
            allowed_docs.add(doc_id)
    return [r for r in results if r.payload and r.payload.get("document_id") in allowed_docs]


def _build_sources(filtered_results, db, min_relevance_score=0.6):
    sources = []
    seen: set[int] = set()
    for res in filtered_results:
        if res.score < min_relevance_score:
            continue
        doc_id = res.payload.get("document_id")
        if doc_id and doc_id not in seen:
            doc = db.get(Document, doc_id)
            if doc:
                sources.append(_build_source(doc, res.score, res))
                seen.add(doc_id)
    return sources


def _should_mix_global_knowledge(message: str) -> bool:
    text = (message or "").lower()
    return any(term in text for term in (
        "global",
        "knowledge base",
        "policy library",
        "nrb",
        "regulation",
        "directive",
        "compare",
        "against",
        "across documents",
        "all documents",
        "other documents",
    ))


def _search(query_vector, bank_id, active_document_ids, session_id, query: str):
    session_results = []
    if active_document_ids:
        try:
            session_results = search_points(
                query_vector, bank_id, limit=5,
                document_ids=active_document_ids,
                session_id=session_id,
                document_scope="session_upload",
            )
        except Exception:
            pass

    allow_global_mix = not active_document_ids or not session_results or _should_mix_global_knowledge(query)
    global_limit = max(0, 5 - len(session_results)) if allow_global_mix else 0
    global_results = []
    if global_limit > 0:
        try:
            global_results = search_points(query_vector, bank_id, limit=global_limit, document_scope="global_knowledge")
            seen_ids = {r.payload.get("document_id") for r in session_results if r.payload}
            global_results = [r for r in global_results if r.payload and r.payload.get("document_id") not in seen_ids]
        except Exception:
            pass

    return session_results + global_results


# ── Sync variant (kept for background tasks) ──────────────────────────────────

def generate_rag_response(
    question: str,
    bank_id: int,
    user_role: str,
    db: Session,
    language: str = "en",
    active_document_ids: list[int] | None = None,
    session_id: int | None = None,
):
    try:
        query_vector = generate_embeddings([question])[0]
    except Exception:
        return NOT_FOUND_RESPONSE, []

    results = _search(query_vector, bank_id, active_document_ids, session_id, question)
    if not results:
        return NOT_FOUND_RESPONSE, []

    filtered = _filter_results(results, db, session_id, user_role)
    if not filtered:
        return NOT_FOUND_RESPONSE, []

    sys_identity = get_system_identity(language)
    context = "\n\n---\n\n".join(r.payload.get("text", "") for r in filtered)
    prompt = RAG_PROMPT_TEMPLATE.format(system=sys_identity, context=context, question=question)
    return call_llm(prompt), _build_sources(filtered, db)


# ── Async variant (used by request-path handlers) ─────────────────────────────

async def async_generate_rag_response(
    question: str,
    bank_id: int,
    user_role: str,
    db: Session,
    language: str = "en",
    active_document_ids: list[int] | None = None,
    session_id: int | None = None,
    user_id: int | None = None,
):
    try:
        query_vector = generate_embeddings([question])[0]
    except Exception:
        return NOT_FOUND_RESPONSE, []

    results = _search(query_vector, bank_id, active_document_ids, session_id, question)
    if not results:
        return NOT_FOUND_RESPONSE, []

    filtered = _filter_results(results, db, session_id, user_role)
    if not filtered:
        return NOT_FOUND_RESPONSE, []

    sys_identity = get_system_identity(language)
    context = "\n\n---\n\n".join(r.payload.get("text", "") for r in filtered)
    prompt = RAG_PROMPT_TEMPLATE.format(system=sys_identity, context=context, question=question)
    return await async_call_llm(prompt, user_id=user_id, role=user_role), _build_sources(filtered, db)
