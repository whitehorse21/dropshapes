from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.services.grammar_check_service import GrammarCheckService
from app.services.ai_credits_service import AICreditService
from app.core.auth import get_current_active_user
from app.models.user import User
from app.db.session import get_db
from app.schemas.grammar_check import (
    GrammarCheckRequest, 
    GrammarCheckResponse, 
    GrammarCheckError
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=GrammarCheckResponse)
async def grammar_check(
    request: GrammarCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check text for grammar and spelling errors
    
    - **text**: Text to check for grammar and spelling errors (max 5000 characters)
    - **language**: Language code (default: en)
    - **context**: Check settings including maxSuggestions, checkSpelling, checkGrammar, highlightOffsets
    
    Returns detailed corrections with character positions, suggestions, and error types.
    """
    try:
        # Check and deduct AI credits (1 credit per grammar check request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        grammar_service = GrammarCheckService()
        
        result = grammar_service.check_grammar(
            text=request.text,
            language=request.language,
            context=request.context.model_dump()
        )
        
        return GrammarCheckResponse(**result)
        
    except ValueError as ve:
        logger.warning(f"Validation error in grammar check: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Grammar check service error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Grammar check service temporarily unavailable"
        )
