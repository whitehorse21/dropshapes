from fastapi import APIRouter, HTTPException, Query, Body, Depends
from sqlalchemy.orm import Session
from app.services.professional_networking_service import ProfessionalNetworkingService
from app.services.ai_credits_service import AICreditService
from app.core.auth import get_current_active_user
from app.models.user import User
from app.db.session import get_db
from app.schemas.professional_networking import (
    ProfessionalNetworkingResponse, 
    NetworkingMessageRequest, 
    NetworkingMessageResponse
)

router = APIRouter()

@router.get("/", response_model=ProfessionalNetworkingResponse)
async def professional_networking(
    profession: str = Query(..., description="The profession to get networking suggestions for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get professional networking suggestions for a specific profession.
    Returns structured suggestions including key professionals, industries, platforms, and tips.
    """
    try:
        # Check and deduct AI credits (1 credit per networking suggestion request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        networking_service = ProfessionalNetworkingService()
        suggestions = networking_service.suggest_connections(profession)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message", response_model=NetworkingMessageResponse)
async def generate_networking_message(
    request: NetworkingMessageRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a professional networking message based on target profession, user profession, and context.
    """
    try:
        # Check and deduct AI credits (1 credit per networking message generation)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        networking_service = ProfessionalNetworkingService()
        message_data = networking_service.generate_networking_message(
            request.target_profession, 
            request.user_profession, 
            request.context
        )
        return message_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
