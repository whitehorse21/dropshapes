from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Contact schemas
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    phone: Optional[str] = None

class ContactResponse(ContactCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
