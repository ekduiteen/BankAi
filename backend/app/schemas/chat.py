from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str
    content: str
    sources_json: Optional[str] = None
    suggestions_json: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionResponse(ChatSessionBase):
    id: int
    bank_id: int
    user_id: int
    active_document_ids_json: str = "[]"
    session_summary: Optional[str] = None
    created_at: datetime
    messages: List[ChatMessageResponse] = []
    
    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None
    language: Optional[str] = "en"
    active_document_ids: Optional[List[int]] = None
