from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DriveItemCreate(BaseModel):
    content: Optional[str] = Field(None, description="Text content")


class DriveImportRequest(BaseModel):
    contents: List[str] = Field(..., description="List of note contents to import", max_length=100)


class DriveItemUpdate(BaseModel):
    content: Optional[str] = None


class DriveItemResponse(BaseModel):
    id: int
    user_id: int
    content: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
