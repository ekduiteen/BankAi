from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str
    bank_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    bank_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
