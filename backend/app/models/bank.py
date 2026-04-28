from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship

class Bank(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    code: str = Field(unique=True, index=True)
    status: str = Field(default="active")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    users: List["User"] = Relationship(back_populates="bank")
    documents: List["Document"] = Relationship(back_populates="bank")
