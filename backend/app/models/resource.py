from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    videoUrl = Column(String, nullable=True)
    type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
