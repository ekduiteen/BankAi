from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .bank import Bank

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: int = Field(foreign_key="bank.id")
    uploaded_by: int = Field(foreign_key="user.id")
    file_name: str
    file_type: str
    file_path: str

    # Auto-cataloging (filled by LLM in background)
    document_type: Optional[str] = None  # policy, procedure, manual, compliance, report, circular, directive, other
    department: Optional[str] = None     # Credit, Treasury, Operations, HR, Compliance, Audit, IT, Risk, General
    summary: Optional[str] = None

    # Status and progress
    status: str = Field(default="uploaded")  # uploaded, processing, extracting_text, chunking, embedding, indexed, approved, disabled, failed
    processing_progress: int = Field(default=0)
    processing_message: Optional[str] = None

    # Approval tracking (multi-approval workflow)
    approved_by: Optional[int] = Field(default=None, foreign_key="user.id")  # Which admin approved it
    approved_at: Optional[datetime] = None

    # Chat session uploads
    session_id: Optional[int] = Field(default=None, foreign_key="chatsession.id")
    document_scope: str = Field(default="global_knowledge")  # session_upload, global_knowledge

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
