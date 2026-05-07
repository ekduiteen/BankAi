"""
LLM service — two vLLM endpoints (OpenAI-compatible /v1/chat/completions).

LLM A: primary — RAG answers, complex reasoning, long-form generation
LLM B: secondary — fast tasks: summarize, translate, draft, classify

Both are called via the same OpenAI-compatible interface so swapping models
requires only .env changes.
"""
import httpx
from ..core.config import settings
from .llm_gateway import reserve_model


# ── Shared HTTP helper ────────────────────────────────────────────────────────

def _vllm_payload(model: str, prompt: str, system: str | None = None) -> dict:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return {"model": model, "messages": messages}


def _parse_response(data: dict) -> str:
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return ""


# ── Sync (background tasks / ingestion pipeline) ─────────────────────────────

def call_llm_a(prompt: str, system: str | None = None) -> str:
    """Primary LLM — used for RAG, chat, complex reasoning."""
    url = f"{settings.LLM_A_API_BASE}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.LLM_A_API_KEY}"}
    try:
        r = httpx.post(url, json=_vllm_payload(settings.LLM_A_MODEL, prompt, system),
                       headers=headers, timeout=300.0)
        r.raise_for_status()
        return _parse_response(r.json())
    except Exception as e:
        return f"LLM-A unavailable. ({e})"


def call_llm_b(prompt: str, system: str | None = None) -> str:
    """Secondary LLM — used for summarize, translate, draft, format."""
    url = f"{settings.LLM_B_API_BASE}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.LLM_B_API_KEY}"}
    try:
        r = httpx.post(url, json=_vllm_payload(settings.LLM_B_MODEL, prompt, system),
                       headers=headers, timeout=300.0)
        r.raise_for_status()
        return _parse_response(r.json())
    except Exception as e:
        return f"LLM-B unavailable. ({e})"


def call_llm(prompt: str, system: str | None = None) -> str:
    """Default — routes to LLM A. Kept for backward compat."""
    return call_llm_a(prompt, system)


def call_vision_llm(prompt: str, image_b64: str) -> str:
    """Vision call via LLM A (expects a vision-capable model)."""
    url = f"{settings.LLM_A_API_BASE}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.LLM_A_API_KEY}"}
    messages = [{"role": "user", "content": [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
    ]}]
    try:
        r = httpx.post(url, json={"model": settings.LLM_A_MODEL, "messages": messages},
                       headers=headers, timeout=300.0)
        r.raise_for_status()
        return _parse_response(r.json())
    except Exception as e:
        return f"Failed to analyze image. ({e})"


# ── Async (request-path handlers) ────────────────────────────────────────────

async def async_call_llm_a(
    prompt: str,
    system: str | None = None,
    user_id: int | None = None,
    role: str | None = None,
) -> str:
    try:
        async with reserve_model(user_id=user_id or 0, role=role, model_name=settings.LLM_A_MODEL) as lease:
            profile = lease.profile
            url = f"{profile.api_base}/v1/chat/completions"
            headers = {"Authorization": f"Bearer {profile.api_key}"}
            payload = _vllm_payload(profile.model, prompt, system)
            payload["max_tokens"] = profile.max_tokens
            async with httpx.AsyncClient() as client:
                r = await client.post(url, json=payload, headers=headers, timeout=profile.timeout_seconds)
                r.raise_for_status()
                return _parse_response(r.json())
    except Exception as e:
        return f"LLM-A unavailable. ({e})"


async def async_call_llm_b(
    prompt: str,
    system: str | None = None,
    user_id: int | None = None,
    role: str | None = None,
) -> str:
    try:
        async with reserve_model(user_id=user_id or 0, role=role, model_name=settings.LLM_B_MODEL) as lease:
            profile = lease.profile
            url = f"{profile.api_base}/v1/chat/completions"
            headers = {"Authorization": f"Bearer {profile.api_key}"}
            payload = _vllm_payload(profile.model, prompt, system)
            payload["max_tokens"] = profile.max_tokens
            async with httpx.AsyncClient() as client:
                r = await client.post(url, json=payload, headers=headers, timeout=profile.timeout_seconds)
                r.raise_for_status()
                return _parse_response(r.json())
    except Exception as e:
        return f"LLM-B unavailable. ({e})"


async def async_call_llm(
    prompt: str,
    system: str | None = None,
    user_id: int | None = None,
    role: str | None = None,
) -> str:
    """Default async — routes to LLM A. Kept for backward compat."""
    return await async_call_llm_a(prompt, system, user_id=user_id, role=role)


async def async_call_vision_llm(prompt: str, image_b64: str) -> str:
    url = f"{settings.LLM_A_API_BASE}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.LLM_A_API_KEY}"}
    messages = [{"role": "user", "content": [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
    ]}]
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json={"model": settings.LLM_A_MODEL, "messages": messages},
                                  headers=headers, timeout=300.0)
            r.raise_for_status()
            return _parse_response(r.json())
    except Exception as e:
        return f"Failed to analyze image. ({e})"
