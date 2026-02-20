from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.pdf_service import pdf_service
from app.services.ai_credits_service import AICreditService
from app.core.auth import get_current_active_user
from app.models.user import User
from app.db.session import get_db
from typing import Optional

router = APIRouter()

@router.post("/analyze")
async def analyze_pdf(
    file: UploadFile = File(...),
    do_summary: Optional[bool] = True,
    do_keywords: Optional[bool] = True,
    do_sentiment: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze a PDF: extract text, and optionally run AI for summary, keywords, sentiment."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        # Check and deduct AI credits (1 credit per PDF analysis with AI)
        if do_summary or do_keywords or do_sentiment:
            AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        file_bytes = await file.read()
        result = await pdf_service.analyze_pdf(
            file_bytes,
            do_summary=do_summary,
            do_keywords=do_keywords,
            do_sentiment=do_sentiment
        )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 