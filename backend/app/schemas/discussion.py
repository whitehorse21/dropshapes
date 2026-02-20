from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

# Discussion schemas
class DiscussionBase(BaseModel):
    title: str
    content: str
    author_name: Optional[str] = None  # Optional author name for anonymous posts

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    author_name: Optional[str] = None

class DiscussionResponse(DiscussionBase):
    id: int
    date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DiscussionDetailResponse(DiscussionResponse):
    comment_count: int

    class Config:
        from_attributes = True
