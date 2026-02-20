from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Resource schemas
class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    videoUrl: Optional[str] = None
    type: str

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    videoUrl: Optional[str] = None
    type: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
