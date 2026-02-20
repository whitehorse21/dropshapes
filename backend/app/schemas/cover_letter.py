from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union, Generic, TypeVar
from datetime import datetime

# Generic type for response data
T = TypeVar('T')

# Standard API response wrapper
class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: T
    message: Optional[str] = None

# Profile schema
class ProfileSchema(BaseModel):
    full_name: str
    email: str
    phone_number: str
    location: str
    linkedin_profile: str
    portfolio_website: str

# Recipient schema
class RecipientSchema(BaseModel):
    company_name: str
    hiring_manager_name: str
    job_title: str
    company_address: str

# Introduction schema
class IntroductionSchema(BaseModel):
    greet_text: str
    intro_para: str

# Closing schema
class ClosingSchema(BaseModel):
    text: str

# Cover style schema
class CoverStyleSchema(BaseModel):
    font: str
    color: str

# Base CoverLetter schema
class CoverLetterBase(BaseModel):
    cover_letter_title: str
    cover_letter_type: Optional[str] = None
    cover_template_category: Optional[str] = None

class CoverLetterCreate(CoverLetterBase):
    cover_letter_type: str  # Override to make required
    cover_template_category: str  # Override to make required
    profile: ProfileSchema
    recipient: RecipientSchema
    introduction: IntroductionSchema
    body: str
    closing: ClosingSchema
    cover_style: CoverStyleSchema

class CoverLetterUpdate(BaseModel):
    cover_letter_title: Optional[str] = None
    cover_letter_type: Optional[str] = None
    cover_template_category: Optional[str] = None
    profile: Optional[ProfileSchema] = None
    recipient: Optional[RecipientSchema] = None
    introduction: Optional[IntroductionSchema] = None
    body: Optional[str] = None
    closing: Optional[ClosingSchema] = None
    cover_style: Optional[CoverStyleSchema] = None

class CoverLetterInDBBase(CoverLetterBase):
    id: int
    user_id: int
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CoverLetterResponse(CoverLetterInDBBase):
    # Use Union to allow both the new schema types and the old Dict format for backward compatibility
    profile: Optional[Union[ProfileSchema, Dict[str, Any]]] = None
    recipient: Optional[Union[RecipientSchema, Dict[str, Any]]] = None
    introduction: Optional[Union[IntroductionSchema, Dict[str, Any]]] = None
    body: Optional[str] = None
    closing: Optional[Union[ClosingSchema, Dict[str, Any]]] = None
    cover_style: Optional[Union[CoverStyleSchema, Dict[str, Any]]] = None

# Specific response types
class CoverLetterSingleResponse(APIResponse[CoverLetterResponse]):
    pass

class CoverLetterListResponse(APIResponse[List[CoverLetterResponse]]):
    pass

class CoverLetterDeleteResponse(APIResponse[Dict[str, str]]):
    pass

class CoverLetterMigrationResponse(APIResponse[Dict[str, int]]):
    pass

class CoverLetterPDFGenerationRequest(BaseModel):
    prompt: str = Field(..., description="AI prompt for generating PDF content")
    template_name: Optional[str] = Field(default="classic", description="Template name for PDF generation")

class CoverLetterPDFGenerationResponse(BaseModel):
    pdf_url: str
    message: str

class CoverLetterAIEnhanceRequest(BaseModel):
    profession: str = Field(..., description="The profession/job title for the cover letter")
    jobDescription: str = Field(..., description="The job description to tailor the content to")
    sections: List[str] = Field(..., description="List of sections to enhance (e.g., ['introduction', 'body', 'closing'])")

class CoverLetterAIEnhanceResponse(BaseModel):
    introduction: Optional[str] = None
    body: Optional[str] = None
    closing: Optional[str] = None
