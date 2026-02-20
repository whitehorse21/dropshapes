from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Basic task fields
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="medium")  # low, medium, high, urgent
    status = Column(String(20), nullable=False, default="pending")  # pending, in_progress, completed, cancelled
    category = Column(String(100), nullable=False, default="general")
    
    # Date fields
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # AI-related fields
    tags = Column(JSON, nullable=True)  # Store as JSON array
    ai_generated = Column(Boolean, default=False, nullable=False)
    ai_metadata = Column(JSON, nullable=True)  # Store AI parsing results, confidence scores, etc.
    
    # Additional fields for advanced features
    estimated_hours = Column(Integer, nullable=True)
    complexity_rating = Column(String(20), nullable=True)  # low, medium, high
    automation_potential = Column(String(20), nullable=True)  # low, medium, high
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', user_id={self.user_id})>"
