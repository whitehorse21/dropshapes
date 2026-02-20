from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base Subscription schema
class SubscriptionBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    interval: str  # monthly, yearly
    is_active: bool = True
    features: Optional[str] = None
    resume_limit: int = -1  # -1 means unlimited
    cover_letter_limit: int = -1
    ai_credits_limit: int = 0

class SubscriptionCreate(SubscriptionBase):
    payment_provider: Optional[str] = None
    subscription_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    interval: Optional[str] = None
    is_active: Optional[bool] = None
    features: Optional[str] = None
    resume_limit: Optional[int] = None    
    cover_letter_limit: Optional[int] = None
    ai_credits_limit: Optional[int] = None
    payment_provider: Optional[str] = None
    subscription_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None

class SubscriptionInDBBase(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    payment_provider: Optional[str] = None
    subscription_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubscriptionResponse(SubscriptionInDBBase):
    pass

# Admin schemas for user subscription management
class AdminUserSubscriptionRecord(BaseModel):
    subscription_id: Optional[str] = None
    user_id: int
    user_name: str
    email: str
    subscription_plan: str
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    payment_status: str
    amount: float
    currency: str = "USD"
    resumes_limit: int
    cover_letters_limit: int
    ai_credits_limit: int
    has_used_free_limits: bool
    subscription_tokens_used: int

    class Config:
        from_attributes = True

class PaginationInfo(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int

class AdminUserSubscriptionsResponse(BaseModel):
    success: bool = True
    data: List[AdminUserSubscriptionRecord]
    pagination: PaginationInfo
