from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Module schemas
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class ModuleResponse(ModuleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
