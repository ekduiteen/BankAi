from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BankBase(BaseModel):
    name: str
    code: str
    status: Optional[str] = "active"

class BankCreate(BankBase):
    pass

class BankUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    status: Optional[str] = None

class BankResponse(BankBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
