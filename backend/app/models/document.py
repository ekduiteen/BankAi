from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .bank import Bank

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: int = Field(foreign_key="bank.id")
    uploaded_by: int = Field(foreign_key="user.id")
    title: str
    file_name: str
    file_type: str
    file_path: str
    document_type: str # policy, procedure, manual, etc.
    department: Optional[str] = None
    access_level: int = Field(default=0) # 0: general, 1: restricted, 2: confidential
    status: str = Field(default="uploaded") # uploaded, processing, extracting_text, chunking, embedding, indexed, approved, disabled, failed
    version: str = Field(default="1.0")
    
    # New fields for chat-bound documents
    session_id: Optional[int] = Field(default=None, foreign_key="chatsession.id")
    document_scope: str = Field(default="global_knowledge") # session_upload, global_knowledge
    processing_progress: int = Field(default=0)
    processing_message: Optional[str] = None
    summary: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    bank: Optional["Bank"] = Relationship(back_populates="documents")
    chunks: List["DocumentChunk"] = Relationship(back_populates="document")

class DocumentChunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: int = Field(foreign_key="bank.id")
    document_id: int = Field(foreign_key="document.id")
    chunk_index: int
    chunk_text: str
    page_number: Optional[int] = None
    qdrant_point_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    document: Optional["Document"] = Relationship(back_populates="chunks")
