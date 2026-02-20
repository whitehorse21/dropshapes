from sqlalchemy import Boolean, Column, Integer, String, Float, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

# Define the models using SQLAlchemy for PostgreSQL
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    agree_to_terms = Column(Boolean, default=False, nullable=False)
    
    # Resume builder specific fields
    profile_image = Column(String, nullable=True)
    ai_credits = Column(Integer, default=0)  # Credits for AI features (bonus/trial credits)
    subscription_tokens_used = Column(Integer, default=0)  # Tokens used from subscription plan
    has_used_free_limits = Column(Boolean, default=False)  # Track if user has used free limits before subscribing
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
      # Relationships
    resumes = relationship("Resume", back_populates="user")
    cover_letters = relationship("CoverLetter", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    signatures = relationship("Signature", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    interview_sessions = relationship("InterviewSession", back_populates="user")
    performance_records = relationship("UserPerformance", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
