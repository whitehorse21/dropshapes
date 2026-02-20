from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class CourseUnit(Base):
    __tablename__ = "course_units"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points = Column(String, default="0")
    module = Column(String, default="1")  # Store module as string to match schema
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
