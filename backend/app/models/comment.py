from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class Comment(Base):
    __tablename__ = "comments"    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    comment = Column(Text, nullable=False)
    date_time = Column(DateTime(timezone=True), server_default=func.now())    
    discussion_id = Column(Integer, ForeignKey("discussions.id"))  # Reference to discussion
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    discussion = relationship("Discussion", back_populates="comments")
