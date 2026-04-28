from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from ..db.session import get_session
from ..core import security
from ..core.config import settings
from ..models.user import User
from ..schemas.auth import Token
from .deps import get_current_user
from ..services.audit_service import log_audit_event, log_security_event

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        log_security_event(
            db=db,
            event_type="failed_login",
            severity="medium",
            description=f"Failed login attempt for email: {form_data.username}",
            metadata={"email": form_data.username}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        log_security_event(
            db=db,
            event_type="failed_login_inactive",
            severity="medium",
            description=f"Login attempt by inactive user: {user.email}",
            user_id=user.id,
            bank_id=user.bank_id
        )
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store minimal info in JWT token for security
    token_sub = {
        "user_id": user.id,
        "email": user.email
    }
    
    log_audit_event(
        db=db,
        action="login",
        resource_type="user",
        resource_id=str(user.id),
        bank_id=user.bank_id,
        user_id=user.id
    )
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=dict)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "bank_id": current_user.bank_id,
        "department": current_user.department,
    }

@router.post("/logout")
def logout() -> Any:
    """
    Logout (in JWT stateless auth, just client-side token deletion, but here we can return success)
    """
    return {"message": "Successfully logged out"}
