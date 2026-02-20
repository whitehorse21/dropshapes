from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.assignment import AssignmentStatus

# Assignment schemas
class AssignmentBase(BaseModel):    
    title: str
    due_date: datetime
    unit: Optional[int] = None  
    summary: Optional[str] = None
    status: AssignmentStatus = AssignmentStatus.PENDING

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    unit: Optional[int] = None
    summary: Optional[str] = None
    status: Optional[AssignmentStatus] = None

class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
