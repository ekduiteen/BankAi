from typing import Any, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..models.audit import AuditLog
from ..schemas.audit import AuditLogResponse
from .deps import get_current_bank_admin

router = APIRouter()

@router.get("", response_model=List[AuditLogResponse])
def read_audit_logs(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Retrieve audit logs.
    Bank admin can see logs for their bank.
    Super admin can see all logs.
    """
    query = select(AuditLog)
    if current_user.role != "super_admin":
        query = query.where(AuditLog.bank_id == current_user.bank_id)
        
    # Order by newest first
    query = query.order_by(AuditLog.created_at.desc())
    
    logs = db.exec(query.offset(skip).limit(limit)).all()
    return logs
