import hashlib
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class RevokedToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token_hash: str = Field(unique=True, index=True)  # SHA-256 of raw JWT
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @staticmethod
    def hash(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode()).hexdigest()
