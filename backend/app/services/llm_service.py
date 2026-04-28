import httpx
from ..core.config import settings

def call_llm(prompt: str) -> str:
    """
    Calls the configured LLM.
    For MVP, we support Ollama.
    """
    if settings.LLM_PROVIDER == "ollama":
        return call_ollama(prompt)
    elif settings.LLM_PROVIDER == "openai":
        return call_openai(prompt)
    else:
        return "Unsupported LLM provider"

def call_ollama(prompt: str) -> str:
    url = f"{settings.LLM_API_BASE}/api/generate"
    payload = {
        "model": settings.LLM_MODEL,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = httpx.post(url, json=payload, timeout=300.0)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return "I'm sorry, I am currently unable to process your request."
def call_vision_llm(prompt: str, image_b64: str) -> str:
    """
    Analyzes an image using the vision-capable model in Ollama.
    """
    url = f"{settings.LLM_API_BASE}/api/generate"
    payload = {
        "model": settings.LLM_MODEL,
        "prompt": prompt,
        "images": [image_b64],
        "stream": False
    }
    try:
        response = httpx.post(url, json=payload, timeout=300.0)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Error calling Vision LLM: {e}")
        return "Failed to analyze image."

def call_openai(prompt: str) -> str:
    # Placeholder for OpenAI or vLLM compatible API
    url = f"{settings.LLM_API_BASE}/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}"
    }
    payload = {
        "model": settings.LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=60.0)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "I'm sorry, I am currently unable to process your request."
