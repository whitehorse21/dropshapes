from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func
import enum

from app.db.session import Base

class AssignmentStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)    
    unit = Column(Integer, nullable=True)  
    summary = Column(Text, nullable=True)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
