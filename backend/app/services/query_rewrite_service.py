import json
import re
from typing import Iterable

from ..models.chat import ChatMessage
from .llm_service import call_llm


FOLLOW_UP_HINTS = {
    "it",
    "its",
    "this",
    "that",
    "they",
    "them",
    "those",
    "above",
    "same",
    "previous",
    "what about",
    "how about",
    "explain more",
    "compare",
}


def _recent_history_text(history: Iterable[ChatMessage], limit: int = 6) -> str:
    lines = []
    for msg in list(history)[-limit:]:
        role = "Assistant" if msg.role == "assistant" else "User"
        content = (msg.content or "").strip().replace("\n", " ")
        if content:
            lines.append(f"{role}: {content[:700]}")
    return "\n".join(lines)


def looks_like_follow_up(question: str) -> bool:
    q = question.strip().lower()
    if len(q.split()) <= 7:
        return True
    return any(hint in q for hint in FOLLOW_UP_HINTS)


def rewrite_query_for_retrieval(question: str, history: list[ChatMessage] | None) -> str:
    """
    Convert short follow-up questions into standalone retrieval queries.
    Falls back to the original question if rewriting fails or is unnecessary.
    """
    if not history or not looks_like_follow_up(question):
        return question

    history_text = _recent_history_text(history)
    if not history_text:
        return question

    prompt = f"""Rewrite the user's latest question as one standalone search query for banking document retrieval.
Keep the user's intent. Include relevant subjects from the conversation history. Do not answer the question.
Return JSON only in this shape: {{"query":"..."}}

Conversation:
{history_text}

Latest question: {question}
"""

    try:
        raw = call_llm(prompt)
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0) if match else raw)
        rewritten = str(payload.get("query", "")).strip()
        return rewritten or question
    except Exception as exc:
        print(f"Query rewrite failed: {exc}")
        return question
