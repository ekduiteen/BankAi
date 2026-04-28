from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .bank import Bank

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bank_id: Optional[int] = Field(default=None, foreign_key="bank.id")
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str # super_admin, bank_admin, staff_user, compliance_user
    department: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    bank: Optional["Bank"] = Relationship(back_populates="users")
