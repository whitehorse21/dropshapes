from sqlalchemy import Boolean, Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base

class DifficultyLevelEnum(enum.Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    EXPERT = "expert"

class AnswerTypeEnum(enum.Enum):
    TEXT = "text"
    VIDEO = "video"
    AUDIO = "audio"

class InterviewSession(Base):
    """Database model for interview sessions"""
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, index=True)  # UUID as string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional user association
    topic = Column(String, nullable=False)
    difficulty_level = Column(Enum(DifficultyLevelEnum), nullable=False)
    session_type = Column(String, default="standard")  # standard, mock, bulk
    total_questions = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    overall_feedback = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)  # Array of recommendations
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    answers = relationship("InterviewAnswer", back_populates="session", cascade="all, delete-orphan")

class InterviewQuestion(Base):
    """Database model for interview questions"""
    __tablename__ = "interview_questions"

    id = Column(String, primary_key=True, index=True)  # question_id as string
    session_id = Column(String, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_order = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")

class InterviewAnswer(Base):
    """Database model for interview answers"""
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(String, ForeignKey("interview_questions.id"), nullable=False)
    user_answer = Column(Text, nullable=False)
    answer_type = Column(Enum(AnswerTypeEnum), default=AnswerTypeEnum.TEXT)
    
    # Evaluation results
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)  # Array of strengths
    areas_for_improvement = Column(JSON, nullable=True)  # Array of improvement areas
    criteria_scores = Column(JSON, nullable=True)  # Dict of criteria scores
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    session = relationship("InterviewSession", back_populates="answers")
    question = relationship("InterviewQuestion", back_populates="answers")

class UserPerformance(Base):
    """Database model for user performance tracking"""
    __tablename__ = "user_performance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    
    # Performance metrics
    interviews_taken = Column(Integer, default=0)
    total_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)
    best_score = Column(Float, default=0.0)
    latest_score = Column(Float, default=0.0)
    
    # Trend analysis
    strengths = Column(JSON, nullable=True)  # Array of strength areas
    weaknesses = Column(JSON, nullable=True)  # Array of weakness areas
    improvement_suggestions = Column(JSON, nullable=True)  # Array of suggestions
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="performance_records")

# Add the relationship to User model (this will be added in a migration or user.py update)
# User.interview_sessions = relationship("InterviewSession", back_populates="user")
# User.performance_records = relationship("UserPerformance", back_populates="user")
