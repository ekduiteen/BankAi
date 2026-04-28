import os
import tempfile
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bank's Own LLM"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-for-development-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/bankai")
    
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "admin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "password")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "bank-documents")

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "bankai_uploads"))
    CHAT_UPLOAD_DIR: str = os.getenv("CHAT_UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "bankai_chat_uploads"))
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3")
    LLM_API_BASE: str = os.getenv("LLM_API_BASE", "http://localhost:11434")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "384"))
    
    SUPER_ADMIN_EMAIL: str = os.getenv("SUPER_ADMIN_EMAIL", "admin@bankai.io")
    SUPER_ADMIN_PASSWORD: str = os.getenv("SUPER_ADMIN_PASSWORD", "admin123")

settings = Settings()
