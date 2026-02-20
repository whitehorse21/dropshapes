from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    interval = Column(String, nullable=False)  # monthly, yearly
    is_active = Column(Boolean, default=True)
    features = Column(String, nullable=True)  # Comma-separated list of features
    
    # Limits
    resume_limit = Column(Integer, default=-1)  # -1 means unlimited
    cover_letter_limit = Column(Integer, default=-1)
    ai_credits_limit = Column(Integer, default=0)  # AI credits/tokens included in plan
    
    # Payment details
    payment_provider = Column(String, nullable=True)  # stripe, paypal
    subscription_id = Column(String, nullable=True)  # ID from payment provider
    stripe_price_id = Column(String, nullable=True)  # Stripe Price ID for this plan
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription")
