from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlmodel import Session, select
from sqlalchemy import or_, and_
import os
import shutil

from ..db.session import get_session
from ..core.config import settings
from ..models.user import User
from ..models.document import Document
from ..schemas.document import DocumentResponse
from .deps import get_current_user, get_current_bank_admin
from ..services.ingestion_service import process_document
from ..services.audit_service import log_audit_event
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR


def ensure_upload_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    document_type: str = Form(...),
    department: Optional[str] = Form(None),
    access_level: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    if current_user.bank_id is None:
        from ..models.bank import Bank
        default_bank = db.exec(select(Bank).where(Bank.code == "DEFAULT")).first()
        if default_bank:
            current_user.bank_id = default_bank.id
        else:
            raise HTTPException(status_code=500, detail="User has no bank assigned and no default bank exists")

    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Supported files: PDF, DOCX, TXT, JPG, PNG, XLSX, PPTX")

    ensure_upload_dir()
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.bank_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    doc = Document(
        bank_id=current_user.bank_id,
        uploaded_by=current_user.id,
        title=title,
        file_name=file.filename,
        file_type=file.filename.split('.')[-1],
        file_path=file_path,
        document_type=document_type,
        department=department,
        access_level=access_level,
        status="uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    log_audit_event(
        db=db,
        action="upload",
        resource_type="document",
        resource_id=str(doc.id),
        bank_id=current_user.bank_id,
        user_id=current_user.id,
        metadata={"file_name": doc.file_name, "title": doc.title}
    )
    
    background_tasks.add_task(process_document, doc.id, db)
    
    return doc

@router.get("", response_model=List[DocumentResponse])
def read_documents(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve documents. Users can only see documents from their bank.
    Further filtering by department/access_level can be added here.
    """
    query = select(Document).where(Document.bank_id == current_user.bank_id)
    
    if current_user.role == "staff_user":
        # Staff can see approved library docs plus their own chat-session uploads
        # so active document cards can be restored after refresh.
        query = query.where(
            or_(
                Document.status == "approved",
                and_(
                    Document.document_scope == "session_upload",
                    Document.uploaded_by == current_user.id,
                    Document.status != "disabled",
                ),
            )
        )
        
    docs = db.exec(query.offset(skip).limit(limit)).all()
    return docs

@router.get("/{document_id}/status/stream")
async def stream_document_status(
    document_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Stream real-time document processing status.
    """
    doc = db.get(Document, document_id)
    if not doc or doc.bank_id != current_user.bank_id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    async def event_generator():
        last_progress = -1
        last_status = None
        
        while True:
            # Refresh doc state
            db.refresh(doc)
            
            if doc.processing_progress != last_progress or doc.status != last_status:
                last_progress = doc.processing_progress
                last_status = doc.status
                
                payload = {
                    "document_id": doc.id,
                    "status": doc.status,
                    "progress": doc.processing_progress,
                    "message": doc.processing_message or ""
                }
                yield f"data: {json.dumps(payload)}\n\n"
                
            if doc.status in ["ready", "failed", "approved", "indexed"]:
                # Force final push
                payload = {
                    "document_id": doc.id,
                    "status": doc.status,
                    "progress": doc.processing_progress,
                    "message": doc.processing_message or ""
                }
                yield f"data: {json.dumps(payload)}\n\n"
                break
                
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.patch("/{document_id}/approve", response_model=DocumentResponse)
def approve_document(
    *,
    db: Session = Depends(get_session),
    document_id: int,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    """
    Approve a document to make it searchable.
    """
    doc = db.get(Document, document_id)
    if not doc or doc.bank_id != current_user.bank_id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.status = "approved"
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    log_audit_event(
        db=db,
        action="approve",
        resource_type="document",
        resource_id=str(doc.id),
        bank_id=current_user.bank_id,
        user_id=current_user.id
    )
    
    return doc

@router.delete("/{document_id}")
def delete_document(
    *,
    db: Session = Depends(get_session),
    document_id: int,
    current_user: User = Depends(get_current_bank_admin),
) -> Any:
    doc = db.get(Document, document_id)
    if not doc or doc.bank_id != current_user.bank_id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    db.delete(doc)
    db.commit()
    
    log_audit_event(
        db=db,
        action="delete",
        resource_type="document",
        resource_id=str(doc.id),
        bank_id=current_user.bank_id,
        user_id=current_user.id,
        metadata={"file_name": doc.file_name}
    )
    
    return {"message": "Document deleted"}
