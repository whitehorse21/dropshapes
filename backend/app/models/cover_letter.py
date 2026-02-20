from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cover_letter_title = Column(String, nullable=False)
    cover_letter_type = Column(String, nullable=True)
    cover_template_category = Column(String, nullable=True)
    
    # Cover letter sections as JSON
    profile = Column(JSON, nullable=True)
    recipient = Column(JSON, nullable=True)
    introduction = Column(JSON, nullable=True)
    body = Column(Text, nullable=True)
    closing = Column(JSON, nullable=True)
    
    # Cover letter style settings
    cover_style = Column(JSON, nullable=True)
    
    # PDF output url
    pdf_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cover_letters")
