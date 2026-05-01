from sqlmodel import Session
from ..models.audit import AuditLog, SecurityEvent
from ..core.context import request_ip
import json
from typing import Any

def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    bank_id: int | None = None,
    user_id: int | None = None,
    resource_id: str | None = None,
    metadata: dict[str, Any] | None = None,
    ip_address: str | None = None
):
    try:
        resolved_ip = ip_address or request_ip.get() or None
        log = AuditLog(
            bank_id=bank_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=json.dumps(metadata) if metadata else None,
            ip_address=resolved_ip
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to write audit log: {e}")

def log_security_event(
    db: Session,
    event_type: str,
    severity: str,
    description: str,
    bank_id: int | None = None,
    user_id: int | None = None,
    metadata: dict[str, Any] | None = None
):
    try:
        event = SecurityEvent(
            bank_id=bank_id,
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            description=description,
            metadata_json=json.dumps(metadata) if metadata else None
        )
        db.add(event)
        db.commit()
    except Exception as e:
        print(f"Failed to write security event log: {e}")
