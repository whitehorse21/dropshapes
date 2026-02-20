from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_title = Column(String, nullable=False)
    resume_type = Column(String, nullable=True)
    template_category = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    
    # Resume sections as JSON
    profile = Column(JSON, nullable=True)
    work_history = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)
    summary = Column(JSON, nullable=True)
    hobbies = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    languages = Column(JSON, nullable=True)
    achievements = Column(JSON, nullable=True)
    references = Column(JSON, nullable=True)
    publications = Column(JSON, nullable=True)
    custom_section = Column(JSON, nullable=True)
    
    # Resume style settings
    resume_style = Column(JSON, nullable=True)
    
    # PDF output url
    pdf_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
