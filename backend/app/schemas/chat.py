from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=50000)
    conversation_id: Optional[int] = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str  # Text or, for user voice: S3 audio URL
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSendResponse(BaseModel):
    conversation_id: int
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: str = "New Chat"
