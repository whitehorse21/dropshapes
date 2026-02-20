from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Token schema for JWT authentication
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str
    name: Optional[str] = None
    is_admin: bool = False

class UserCreate(UserBase):
    password: str
    agree_to_terms: bool = Field(..., description="User must agree to terms")
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None

class UserInDB(UserBase):
    id: int
    profile_image: Optional[str] = None
    ai_credits: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserResponse(UserInDB):
    pass
