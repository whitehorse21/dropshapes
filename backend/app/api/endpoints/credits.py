from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/")
async def get_credits_overview(
    current_user: User = Depends(get_current_user)
):
    """Get credits overview and available endpoints"""
    return {
        "success": True,
        "data": {
            "current_balance": current_user.ai_credits,
            
        }
    }

@router.get("/history")
async def get_credits_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's credits history and current balance"""
    return {
        "success": True,
        "data": {
            "current_balance": current_user.ai_credits,
            "history": [
                {
                    "id": 1,
                    "type": "earned",
                    "amount": current_user.ai_credits,
                    "description": "Initial credits",
                    "created_at": current_user.created_at.isoformat() if current_user.created_at else datetime.utcnow().isoformat()
                }
            ]
        }
    }

@router.get("/balance")
async def get_credits_balance(
    current_user: User = Depends(get_current_user)
):
    """Get user's current credits balance"""
    return {
        "success": True,
        "data": {
            "balance": current_user.ai_credits
        }
    }

@router.post("/purchase")
async def purchase_credits(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase credits (placeholder endpoint)"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # This would integrate with Stripe for actual payment processing
    # For now, this is a placeholder
    return {
        "success": True,
        "message": "Credits purchase initiated",
        "data": {
            "amount": amount,
            "status": "pending"
        }
    }

@router.post("/add")
async def add_credits(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add credits to user's account"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    try:
        # Add credits to user's current balance
        current_user.ai_credits += amount
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": f"Successfully added {amount} credits",
            "data": {
                "credits_added": amount,
                "new_balance": current_user.ai_credits
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add credits")

@router.get("/buy")
async def get_credit_packages_buy():
    """Get available credit packages for purchase (alias for /packages)"""
    return {
        "success": True,
        "data": [
            {
                "id": 1,
                "name": "Starter Pack",
                "credits": 10,
                "price": 9.99,
                "description": "Perfect for getting started"
            },
            {
                "id": 2,
                "name": "Professional Pack",
                "credits": 50,
                "price": 39.99,
                "description": "Best value for professionals"
            },
            {
                "id": 3,
                "name": "Enterprise Pack",
                "credits": 100,
                "price": 69.99,
                "description": "For heavy users"
            }
        ]
    }

@router.get("/packages")
async def get_credit_packages():
    """Get available credit packages"""
    return {
        "success": True,
        "data": [
            {
                "id": 1,
                "name": "Starter Pack",
                "credits": 10,
                "price": 9.99,
                "description": "Perfect for getting started"
            },
            {
                "id": 2,
                "name": "Professional Pack",
                "credits": 50,
                "price": 39.99,
                "description": "Best value for professionals"
            },
            {
                "id": 3,
                "name": "Enterprise Pack",
                "credits": 100,
                "price": 69.99,
                "description": "For heavy users"
            }
        ]
    }
