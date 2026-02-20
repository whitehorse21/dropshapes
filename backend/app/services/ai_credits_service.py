"""
AI Credits Service for managing user AI credits and validation.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.services.subscription_service import SubscriptionService
from app.core.config import settings
from typing import Optional


class AICreditError(Exception):
    """Custom exception for AI credit related errors."""
    pass


class AICreditService:
    """Service for handling AI credit validation and management."""
    
    @staticmethod
    def check_and_deduct_credits(db: Session, user: User, credits_required: int = 1) -> bool:
        """
        Check if user has enough credits and deduct them if available.
        First tries to use bonus AI credits, then subscription tokens.
        
        Args:
            db: Database session
            user: User object
            credits_required: Number of credits to deduct (default: 1)
            
        Returns:
            bool: True if credits were deducted successfully
            
        Raises:
            HTTPException: If user doesn't have enough credits
        """
        # Get subscription limits
        limits = SubscriptionService.get_subscription_limits(db, user.id)
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        subscription_tokens_used = user.subscription_tokens_used if user.subscription_tokens_used is not None else 0
        subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used)
        
        # Calculate total available credits (bonus + subscription)
        total_available = user.ai_credits + subscription_tokens_remaining
        
        if total_available < credits_required:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Not enough AI credits. You need {credits_required} credit(s) but have {total_available} available (Bonus: {user.ai_credits}, Subscription: {subscription_tokens_remaining}). Please upgrade your subscription."
            )
        
        # Deduct from bonus credits first, then subscription tokens
        remaining_to_deduct = credits_required
        
        if user.ai_credits > 0:
            bonus_to_deduct = min(user.ai_credits, remaining_to_deduct)
            user.ai_credits -= bonus_to_deduct
            remaining_to_deduct -= bonus_to_deduct
        
        if remaining_to_deduct > 0:
            # Deduct from subscription tokens
            current_tokens_used = user.subscription_tokens_used if user.subscription_tokens_used is not None else 0
            user.subscription_tokens_used = current_tokens_used + remaining_to_deduct
        
        db.commit()
        db.refresh(user)
        
        return True
    
    @staticmethod
    def add_credits(db: Session, user: User, credits_to_add: int) -> int:
        """
        Add credits to user account.
        
        Args:
            db: Database session
            user: User object
            credits_to_add: Number of credits to add
            
        Returns:
            int: New credit balance
        """
        user.ai_credits += credits_to_add
        db.commit()
        db.refresh(user)
        
        return user.ai_credits
    
    @staticmethod
    def get_credit_balance(user: User) -> int:
        """
        Get current credit balance for user.
        
        Args:
            user: User object
            
        Returns:
            int: Current credit balance
        """
        return user.ai_credits
    
    @staticmethod
    def give_trial_credits(db: Session, user: User) -> int:
        """
        Give trial credits to a new user.
        
        Args:
            db: Database session
            user: User object
            
        Returns:
            int: New credit balance
        """
        return AICreditService.add_credits(db, user, settings.TRIAL_AI_CREDITS)
    
    @staticmethod
    def has_sufficient_credits(db: Session, user: User, credits_required: int = 1) -> bool:
        """
        Check if user has sufficient credits without deducting them.
        
        Args:
            db: Database session
            user: User object
            credits_required: Number of credits required (default: 1)
            
        Returns:
            bool: True if user has sufficient credits
        """
        # Get subscription limits
        limits = SubscriptionService.get_subscription_limits(db, user.id)
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        subscription_tokens_used = user.subscription_tokens_used if user.subscription_tokens_used is not None else 0
        subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used)
        
        # Calculate total available credits
        total_available = user.ai_credits + subscription_tokens_remaining
        return total_available >= credits_required
    
    @staticmethod
    def get_detailed_credit_info(db: Session, user: User) -> dict:
        """
        Get detailed information about user's credit status.
        
        Args:
            db: Database session
            user: User object
            
        Returns:
            dict: Detailed credit information
        """
        # Get subscription limits
        limits = SubscriptionService.get_subscription_limits(db, user.id)
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        subscription_tokens_used = user.subscription_tokens_used if user.subscription_tokens_used is not None else 0
        subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used)
        
        return {
            "bonus_credits": user.ai_credits,
            "subscription_limit": ai_credits_limit,
            "subscription_used": subscription_tokens_used,
            "subscription_remaining": subscription_tokens_remaining,
            "total_available": user.ai_credits + subscription_tokens_remaining,
            "has_bonus_credits": user.ai_credits > 0,
            "has_subscription_credits": subscription_tokens_remaining > 0
        }
    
    @staticmethod
    def get_credit_summary(user: User) -> dict:
        """
        Get a summary of user's credit status.
        
        Args:
            user: User object
            
        Returns:
            dict: Credit summary information
        """
        return {
            "current_credits": user.ai_credits,
            "trial_credits_given": settings.TRIAL_AI_CREDITS,
            "has_credits": user.ai_credits > 0,
            "is_trial_user": user.ai_credits <= settings.TRIAL_AI_CREDITS
        }
