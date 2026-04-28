from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.bank import Bank
from ..models.user import User
from ..schemas.bank import BankCreate, BankResponse, BankUpdate
from .deps import get_current_active_superuser

router = APIRouter()

@router.post("", response_model=BankResponse)
def create_bank(
    *,
    db: Session = Depends(get_session),
    bank_in: BankCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Create new bank. Only super_admin can do this.
    """
    bank = db.exec(select(Bank).where(Bank.code == bank_in.code)).first()
    if bank:
        raise HTTPException(
            status_code=400,
            detail="The bank with this code already exists in the system.",
        )
    bank = Bank.from_orm(bank_in)
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank

@router.get("", response_model=List[BankResponse])
def read_banks(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve banks. Only super_admin can view all banks.
    """
    banks = db.exec(select(Bank).offset(skip).limit(limit)).all()
    return banks

@router.get("/{bank_id}", response_model=BankResponse)
def read_bank(
    *,
    db: Session = Depends(get_session),
    bank_id: int,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Get bank by ID.
    """
    bank = db.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    return bank

@router.patch("/{bank_id}", response_model=BankResponse)
def update_bank(
    *,
    db: Session = Depends(get_session),
    bank_id: int,
    bank_in: BankUpdate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a bank.
    """
    bank = db.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    update_data = bank_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bank, field, value)
        
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank
