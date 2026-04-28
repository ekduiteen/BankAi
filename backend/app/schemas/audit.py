from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    bank_id: Optional[int]
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[str]
    metadata_json: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True
