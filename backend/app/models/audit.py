from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: Optional[int] = Field(default=None, foreign_key="bank.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str # login, upload_doc, query_ai, etc.
    resource_type: str # document, user, bank, chat
    resource_id: Optional[str] = None
    metadata_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SecurityEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: Optional[int] = Field(default=None, foreign_key="bank.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    event_type: str # failed_login, unauthorized_access, prompt_injection_attempt
    severity: str # low, medium, high, critical
    description: str
    metadata_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
