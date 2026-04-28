from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, JSON

class ChatSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: int = Field(foreign_key="bank.id")
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(default="New Conversation")
    active_document_ids_json: str = Field(default="[]")
    session_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["ChatMessage"] = Relationship(back_populates="session")

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: int = Field(foreign_key="bank.id")
    session_id: int = Field(foreign_key="chatsession.id")
    user_id: int = Field(foreign_key="user.id")
    role: str # user, assistant
    content: str
    status: str = Field(default="completed") # received_user_message, preparing_answer, streaming, completed, stopped, failed
    sources_json: Optional[str] = Field(default=None) # Store sources as JSON string or list
    suggestions_json: Optional[str] = Field(default=None) # Store follow-up suggestions
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Optional["ChatSession"] = Relationship(back_populates="messages")
