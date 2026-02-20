"""
Subscription limit validation service.
Handles checking user subscription limits for resumes and cover letters.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.resume import Resume
from app.models.cover_letter import CoverLetter
from app.models.subscription import Subscription
from typing import Dict, Optional


class SubscriptionLimitError(Exception):
    """Custom exception for subscription limit violations."""
    pass


class SubscriptionService:
    """Service for handling subscription limit validation and enforcement."""
    @staticmethod
    def get_user_subscription(db: Session, user_id: int) -> Optional[Subscription]:
        """Get the current active subscription for a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Get all active subscriptions
        active_subscriptions = [sub for sub in user.subscriptions if sub.is_active]
        if active_subscriptions:
            # If user has multiple active subscriptions, prioritize by:
            # 1. Highest AI credit limit (premium plans first)
            # 2. Most recently created
            return max(active_subscriptions, key=lambda x: (x.ai_credits_limit or 0, x.created_at))
        
        return None
    
    @staticmethod
    def get_current_usage(db: Session, user_id: int) -> Dict[str, int]:
        """Get current usage counts for resumes and cover letters within the current subscription period."""
        subscription = SubscriptionService.get_user_subscription(db, user_id)
        
        if subscription and subscription.current_period_start:
            # Count items created within the current subscription period
            resume_count = db.query(Resume).filter(
                Resume.user_id == user_id,
                Resume.created_at >= subscription.current_period_start
            ).count()
            cover_letter_count = db.query(CoverLetter).filter(
                CoverLetter.user_id == user_id,
                CoverLetter.created_at >= subscription.current_period_start
            ).count()
        else:
            # For free tier users or subscriptions without period tracking, count all items
            resume_count = db.query(Resume).filter(Resume.user_id == user_id).count()
            cover_letter_count = db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count()
        
        return {
            "resume_count": resume_count,
            "cover_letter_count": cover_letter_count
        }
    
    @staticmethod
    def get_total_usage(db: Session, user_id: int) -> Dict[str, int]:
        """Get total usage counts for resumes and cover letters (all time)."""
        resume_count = db.query(Resume).filter(Resume.user_id == user_id).count()
        cover_letter_count = db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count()
        
        return {
            "resume_count": resume_count,
            "cover_letter_count": cover_letter_count
        }
    
    @staticmethod
    def get_subscription_limits(db: Session, user_id: int) -> Dict[str, Optional[int]]:
        """Get subscription limits for a user. Returns None for unlimited (-1)."""
        subscription = SubscriptionService.get_user_subscription(db, user_id)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not subscription:
            # Check if user has already used their free limits before subscribing
            if user and user.has_used_free_limits:
                # User has already used free limits, so no free tier access
                return {
                    "resume_limit": 0,
                    "cover_letter_limit": 0,
                    "ai_credits_limit": 0
                }
            else:
                # Default free tier limits for new users
                return {
                    "resume_limit": 20,
                    "cover_letter_limit": 20,
                    "ai_credits_limit": 0
                }
        
        return {
            "resume_limit": None if subscription.resume_limit == -1 else subscription.resume_limit,
            "cover_letter_limit": None if subscription.cover_letter_limit == -1 else subscription.cover_letter_limit,
            "ai_credits_limit": subscription.ai_credits_limit
        }
    
    @staticmethod
    def check_and_mark_free_limits_used(db: Session, user_id: int) -> None:
        """Check if user has used their free limits and mark the flag accordingly."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.has_used_free_limits:
            return  # Already marked or user not found
        
        # Check if user has no active subscription (meaning they're on free tier)
        subscription = SubscriptionService.get_user_subscription(db, user_id)
        if subscription:
            return  # User has subscription, no need to check free limits
        
        usage = SubscriptionService.get_total_usage(db, user_id)
        
        # Check if user has used any of their free limits
        # We consider them as having "used" free limits if they've created any resumes or cover letters
        if usage["resume_count"] > 0 or usage["cover_letter_count"] > 0:
            user.has_used_free_limits = True
            db.commit()
    
    @staticmethod
    def mark_free_limits_as_used_on_subscription(db: Session, user_id: int) -> None:
        """Mark that user has used free limits when they subscribe."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            usage = SubscriptionService.get_total_usage(db, user_id)
            # If user has created any resumes or cover letters before subscribing, mark free limits as used
            if usage["resume_count"] > 0 or usage["cover_letter_count"] > 0:
                user.has_used_free_limits = True
                db.commit()
    
    @staticmethod
    def check_resume_limit(db: Session, user_id: int) -> bool:
        """Check if user can create a new resume."""
        limits = SubscriptionService.get_subscription_limits(db, user_id)
        usage = SubscriptionService.get_current_usage(db, user_id)
        
        resume_limit = limits["resume_limit"]
        
        # Unlimited access
        if resume_limit is None:
            return True
        
        # Check if current usage is below subscription limit
        if usage["resume_count"] < resume_limit:
            return True
        
        # If subscription limit exceeded, check if user has AI credits
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.ai_credits > 0:
            return True
            
        # Check if user has remaining subscription tokens
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        subscription_tokens_used = user.subscription_tokens_used if user and user.subscription_tokens_used is not None else 0
        subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used) if ai_credits_limit > 0 else 0
        
        if subscription_tokens_remaining > 0:
            return True
        
        return False
    
    @staticmethod
    def check_cover_letter_limit(db: Session, user_id: int) -> bool:
        """Check if user can create a new cover letter."""
        limits = SubscriptionService.get_subscription_limits(db, user_id)
        usage = SubscriptionService.get_current_usage(db, user_id)
        
        cover_letter_limit = limits["cover_letter_limit"]
        
        # Unlimited access
        if cover_letter_limit is None:
            return True
        
        # Check if current usage is below subscription limit
        if usage["cover_letter_count"] < cover_letter_limit:
            return True
        
        # If subscription limit exceeded, check if user has AI credits
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.ai_credits > 0:
            return True
            
        # Check if user has remaining subscription tokens
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        subscription_tokens_used = user.subscription_tokens_used if user and user.subscription_tokens_used is not None else 0
        subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used) if ai_credits_limit > 0 else 0
        
        if subscription_tokens_remaining > 0:
            return True
        
        return False
    
    @staticmethod
    def validate_resume_creation(db: Session, user_id: int) -> None:
        """Validate that user can create a new resume. Raises exception if not allowed."""
        # First check and mark free limits usage if applicable
        SubscriptionService.check_and_mark_free_limits_used(db, user_id)
        
        if not SubscriptionService.check_resume_limit(db, user_id):
            # Get detailed info for error message
            user = db.query(User).filter(User.id == user_id).first()
            limits = SubscriptionService.get_subscription_limits(db, user_id)
            usage = SubscriptionService.get_current_usage(db, user_id)
            
            resume_limit = limits.get('resume_limit', 0)
            current_count = usage.get('resume_count', 0)
            ai_credits = user.ai_credits if user else 0
            
            ai_credits_limit = limits.get("ai_credits_limit", 0)
            subscription_tokens_used = user.subscription_tokens_used if user and user.subscription_tokens_used is not None else 0
            subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used) if ai_credits_limit > 0 else 0
            
            if resume_limit is None:
                error_msg = f"Resume creation failed. You have unlimited resumes but no available credits."
            else:
                error_msg = f"Resume creation limit reached. Your plan allows {resume_limit} resume(s), you have created {current_count}."
            
            if ai_credits > 0:
                error_msg += f" You have {ai_credits} bonus AI credits available."
            elif subscription_tokens_remaining > 0:
                error_msg += f" You have {subscription_tokens_remaining} subscription credits remaining."
            else:
                error_msg += f" You have no AI credits remaining. Please upgrade your subscription or purchase credits."
            
            raise SubscriptionLimitError(error_msg)
    
    @staticmethod
    def validate_cover_letter_creation(db: Session, user_id: int) -> None:
        """Validate that user can create a new cover letter. Raises exception if not allowed."""
        # First check and mark free limits usage if applicable
        SubscriptionService.check_and_mark_free_limits_used(db, user_id)
        
        if not SubscriptionService.check_cover_letter_limit(db, user_id):
            # Get detailed info for error message
            user = db.query(User).filter(User.id == user_id).first()
            limits = SubscriptionService.get_subscription_limits(db, user_id)
            usage = SubscriptionService.get_current_usage(db, user_id)
            
            cover_letter_limit = limits.get('cover_letter_limit', 0)
            current_count = usage.get('cover_letter_count', 0)
            ai_credits = user.ai_credits if user else 0
            
            ai_credits_limit = limits.get("ai_credits_limit", 0)
            subscription_tokens_used = user.subscription_tokens_used if user and user.subscription_tokens_used is not None else 0
            subscription_tokens_remaining = max(0, ai_credits_limit - subscription_tokens_used) if ai_credits_limit > 0 else 0
            
            if cover_letter_limit is None:
                error_msg = f"Cover letter creation failed. You have unlimited cover letters but no available credits."
            else:
                error_msg = f"Cover letter creation limit reached. Your plan allows {cover_letter_limit} cover letter(s), you have created {current_count}."
            
            if ai_credits > 0:
                error_msg += f" You have {ai_credits} bonus AI credits available."
            elif subscription_tokens_remaining > 0:
                error_msg += f" You have {subscription_tokens_remaining} subscription credits remaining."
            else:
                error_msg += f" You have no AI credits remaining. Please upgrade your subscription or purchase credits."
            
            raise SubscriptionLimitError(error_msg)
    
    @staticmethod
    def reset_subscription_credits(db: Session, user_id: int) -> None:
        """Reset user's subscription token usage when they get a new subscription."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.subscription_tokens_used = 0
            db.commit()
    
    @staticmethod
    def handle_subscription_renewal_or_upgrade(db: Session, user_id: int, new_subscription: 'Subscription') -> None:
        """Handle subscription renewal or upgrade - ensures usage tracking starts fresh."""
        
        # If the subscription doesn't have period dates set, set them now
        if not new_subscription.current_period_start:
            now = datetime.now()
            period_end = now + timedelta(days=30 if new_subscription.interval == "monthly" else 365)
            new_subscription.current_period_start = now
            new_subscription.current_period_end = period_end
            db.commit()
        
        # Reset subscription token usage for fresh start
        SubscriptionService.reset_subscription_credits(db, user_id)
        
        # Mark free limits as used if user has created content before
        SubscriptionService.mark_free_limits_as_used_on_subscription(db, user_id)
    
    @staticmethod
    def get_usage_summary(db: Session, user_id: int) -> Dict:
        """Get a complete usage summary for the user."""
        usage = SubscriptionService.get_current_usage(db, user_id)
        limits = SubscriptionService.get_subscription_limits(db, user_id)
        subscription = SubscriptionService.get_user_subscription(db, user_id)
        
        # Get user for AI credits
        user = db.query(User).filter(User.id == user_id).first()
        
        # Calculate token usage and remaining
        current_ai_credits = user.ai_credits if user else 0
        subscription_tokens_used = user.subscription_tokens_used if user and user.subscription_tokens_used is not None else 0
        ai_credits_limit = limits.get("ai_credits_limit", 0)
        ai_credits_remaining = max(0, ai_credits_limit - subscription_tokens_used) if ai_credits_limit > 0 else 0
        
        return {
            "usage": usage,
            "limits": limits,
            "subscription_plan": subscription.name if subscription else "Free",
            "can_create_resume": SubscriptionService.check_resume_limit(db, user_id),
            "can_create_cover_letter": SubscriptionService.check_cover_letter_limit(db, user_id),
            "ai_credits": current_ai_credits,  # Bonus/trial credits
            "ai_credits_limit": ai_credits_limit,  # Total subscription allowance
            "ai_credits_used": subscription_tokens_used,  # Tokens used from subscription
            "ai_credits_remaining": ai_credits_remaining,  # Tokens remaining in subscription
            "has_ai_credits": current_ai_credits > 0,  # Has bonus credits
            "has_subscription_tokens": ai_credits_remaining > 0,  # Has subscription tokens remaining
            "has_used_free_limits": user.has_used_free_limits if user else False,  # Has used free limits before
            "is_free_tier": subscription is None  # Is currently on free tier
        }
