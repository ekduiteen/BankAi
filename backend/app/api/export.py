from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel

from ..api.deps import get_current_user
from ..models.user import User
from ..services.export_service import export, GENERATORS
from ..core.limiter import limiter

router = APIRouter()


class ExportRequest(BaseModel):
    content: str
    fmt: str        # pdf, docx, xlsx, pptx, txt
    title: str = "BankAi Export"


@router.post("")
@limiter.limit("30/minute")
def export_content(
    request: Request,
    body: ExportRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    if body.fmt.lower() not in GENERATORS:
        raise HTTPException(status_code=400, detail=f"Format must be one of: {', '.join(GENERATORS)}")

    try:
        data, mime, filename = export(body.content, body.fmt, body.title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {e}")

    return Response(
        content=data,
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
