from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)  # For ordering modules
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
