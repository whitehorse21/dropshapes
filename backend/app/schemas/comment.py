from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Comment schemas
class CommentBase(BaseModel):
    name: str
    comment: str
    discussion_id: int

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    name: Optional[str] = None
    comment: Optional[str] = None

class CommentResponse(CommentBase):
    id: int
    date_time: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
