from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base Signature schema
class SignatureBase(BaseModel):
    name: str
    signature_data: str  # Base64 encoded signature image

class SignatureCreate(SignatureBase):
    pass

class SignatureUpdate(BaseModel):
    name: Optional[str] = None
    signature_data: Optional[str] = None

class SignatureInDBBase(SignatureBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SignatureResponse(SignatureInDBBase):
    pass
