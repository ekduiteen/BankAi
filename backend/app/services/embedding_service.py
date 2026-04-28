from sentence_transformers import SentenceTransformer
from ..core.config import settings

# Load model lazily
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    embeddings = model.encode(texts)
    return embeddings.tolist()
