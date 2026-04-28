import os
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/bankai")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    # Import all models to ensure they are registered with SQLModel
    from ..models.bank import Bank
    from ..models.user import User
    from ..models.document import Document, DocumentChunk
    from ..models.chat import ChatSession, ChatMessage
    from ..models.audit import AuditLog, SecurityEvent
    
    SQLModel.metadata.create_all(engine)
