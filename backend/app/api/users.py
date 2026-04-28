from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db.session import get_session
from ..core import security
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, UserUpdate
from .deps import get_current_user, get_current_bank_admin

router = APIRouter()

@router.post("", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_session),
    user_in: UserCreate,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Create new user. Bank admin can only create users for their bank.
    Super admin can create users for any bank.
    """
    if current_user.role == "bank_admin" and user_in.bank_id != current_user.bank_id:
        raise HTTPException(status_code=403, detail="Cannot create user for another bank")

    user = db.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        department=user_in.department,
        bank_id=user_in.bank_id,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Retrieve users. Bank admin only sees their bank's users.
    """
    query = select(User)
    if current_user.role != "super_admin":
        query = query.where(User.bank_id == current_user.bank_id)
        
    users = db.exec(query.offset(skip).limit(limit)).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    *,
    db: Session = Depends(get_session),
    user_id: int,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Get user by ID.
    """
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.role != "super_admin" and user.bank_id != current_user.bank_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return user

@router.patch("/{user_id}/disable")
def disable_user(
    *,
    db: Session = Depends(get_session),
    user_id: int,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Disable a user.
    """
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.role != "super_admin" and user.bank_id != current_user.bank_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    user.is_active = False
    db.add(user)
    db.commit()
    return {"message": "User disabled"}
