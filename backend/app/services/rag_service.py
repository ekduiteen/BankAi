from sqlmodel import Session
from .embedding_service import generate_embeddings
from .qdrant_service import search_points
from .llm_service import call_llm
from ..models.document import Document

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

Answer the user's question using the provided context from approved bank documents.
If the context is relevant, use it. If not, provide a general helpful answer.

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


def _build_source(doc: Document, score: float) -> dict:
    return {
        "document_id":    doc.id,
        "document_title": doc.title or doc.file_name,
        "title":          doc.title or doc.file_name,
        "file_name":      doc.file_name,
        "relevance_score": score,
    }


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
    except Exception as e:
        print(f"Embedding failed: {e}")
        sys_identity = get_system_identity(language)
        return call_llm(GENERAL_PROMPT_TEMPLATE.format(system=sys_identity, question=question)), []

    sys_identity = get_system_identity(language)

    # Priority 1 — session-scoped documents (if any active docs supplied)
    session_results = []
    if active_document_ids:
        try:
            session_results = search_points(
                query_vector,
                bank_id,
                limit=5,
                document_ids=active_document_ids,
                session_id=session_id,
                document_scope="session_upload",
            )
        except Exception as e:
            print(f"Session RAG search failed: {e}")

    # Priority 2 — global bank knowledge (always searched; top-up to limit)
    global_limit = max(0, 5 - len(session_results))
    global_results = []
    if global_limit > 0:
        try:
            global_results = search_points(
                query_vector,
                bank_id,
                limit=global_limit,
                document_scope="global_knowledge",
            )
            # Remove any doc already returned in session results to avoid duplication
            seen_ids = {r.payload.get("document_id") for r in session_results if r.payload}
            global_results = [r for r in global_results if r.payload and r.payload.get("document_id") not in seen_ids]
        except Exception as e:
            print(f"Global RAG search failed: {e}")

    results = session_results + global_results

    if not results:
        return call_llm(GENERAL_PROMPT_TEMPLATE.format(system=sys_identity, question=question)), []

    # Filter by access level
    doc_ids = list(set(res.payload.get("document_id") for res in results if res.payload))
    allowed_docs = set()
    for doc_id in doc_ids:
        doc = db.get(Document, doc_id)
        if doc and doc.status in ("approved", "indexed", "ready"):
            if doc.document_scope == "session_upload" and doc.session_id != session_id:
                continue
            if user_role == "staff_user" and doc.access_level and doc.access_level > 0:
                continue
            allowed_docs.add(doc_id)

    filtered_results = [r for r in results if r.payload and r.payload.get("document_id") in allowed_docs]

    if not filtered_results:
        return call_llm(GENERAL_PROMPT_TEMPLATE.format(system=sys_identity, question=question)), []

    context = "\n\n---\n\n".join(r.payload.get("text", "") for r in filtered_results)

    sources = []
    seen_doc_ids: set[int] = set()
    for res in filtered_results:
        doc_id = res.payload.get("document_id")
        if doc_id and doc_id not in seen_doc_ids:
            doc = db.get(Document, doc_id)
            if doc:
                sources.append(_build_source(doc, res.score))
                seen_doc_ids.add(doc_id)

    prompt = RAG_PROMPT_TEMPLATE.format(system=sys_identity, context=context, question=question)
    answer = call_llm(prompt)
    return answer, sources
