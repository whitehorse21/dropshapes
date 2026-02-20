from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Base Resume schema
class ResumeBase(BaseModel):
    resume_title: str
    resume_type: Optional[str] = None
    template_category: Optional[str] = None
    profile_image: Optional[str] = None

class ResumeCreate(ResumeBase):
    profile: Optional[Dict[str, Any]] = None
    work_history: Optional[Dict[str, Any]] = None
    education: Optional[Dict[str, Any]] = None
    skills: Optional[Dict[str, Any]] = None
    summary: Optional[Dict[str, Any]] = None
    hobbies: Optional[Dict[str, Any]] = None
    certifications: Optional[Dict[str, Any]] = None
    languages: Optional[Dict[str, Any]] = None
    achievements: Optional[Dict[str, Any]] = None
    references: Optional[Dict[str, Any]] = None
    publications: Optional[Dict[str, Any]] = None
    custom_section: Optional[Dict[str, Any]] = None
    resume_style: Optional[Dict[str, Any]] = None

class ResumeUpdate(BaseModel):
    resume_title: Optional[str] = None
    resume_type: Optional[str] = None
    template_category: Optional[str] = None
    profile_image: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    work_history: Optional[Dict[str, Any]] = None
    education: Optional[Dict[str, Any]] = None
    skills: Optional[Dict[str, Any]] = None
    summary: Optional[Dict[str, Any]] = None
    hobbies: Optional[Dict[str, Any]] = None
    certifications: Optional[Dict[str, Any]] = None
    languages: Optional[Dict[str, Any]] = None
    achievements: Optional[Dict[str, Any]] = None
    references: Optional[Dict[str, Any]] = None
    publications: Optional[Dict[str, Any]] = None
    custom_section: Optional[Dict[str, Any]] = None
    resume_style: Optional[Dict[str, Any]] = None

class ResumeInDBBase(ResumeBase):
    id: int
    user_id: int
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResumeResponse(ResumeInDBBase):
    profile: Optional[Dict[str, Any]] = None
    work_history: Optional[Dict[str, Any]] = None
    education: Optional[Dict[str, Any]] = None
    skills: Optional[Dict[str, Any]] = None
    summary: Optional[Dict[str, Any]] = None
    hobbies: Optional[Dict[str, Any]] = None
    certifications: Optional[Dict[str, Any]] = None
    languages: Optional[Dict[str, Any]] = None
    achievements: Optional[Dict[str, Any]] = None
    references: Optional[Dict[str, Any]] = None
    publications: Optional[Dict[str, Any]] = None
    custom_section: Optional[Dict[str, Any]] = None
    resume_style: Optional[Dict[str, Any]] = None

# Structured schemas for frontend data format
class PersonalInfo(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None

class Experience(BaseModel):
    id: Optional[int] = None
    company: str
    role: str  # Changed from position to role
    startDate: str
    endDate: Optional[str] = None
    current: bool = False
    location: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = []

class Education(BaseModel):
    id: Optional[int] = None
    institution: str  # Changed from school to institution
    degree: str
    field: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    current: bool = False
    location: Optional[str] = None

class Skill(BaseModel):
    name: str
    level: str  # e.g., "Expert", "Advanced", "Intermediate", "Beginner"

class Language(BaseModel):
    name: str
    level: str  # e.g., "Native", "Fluent", "Conversational", "Basic"

class Certification(BaseModel):
    id: Optional[int] = None
    name: str
    organization: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    certificateLink: Optional[str] = None

class CustomSectionItem(BaseModel):
    name: str
    description: Optional[str] = None

class CustomSection(BaseModel):
    title: str
    items: List[CustomSectionItem]

class ResumeDataCreate(BaseModel):
    personalInfo: PersonalInfo
    profession: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[Experience]] = []
    education: Optional[List[Education]] = []
    skills: Optional[List[Skill]] = []
    languages: Optional[List[Language]] = []
    hobbies: Optional[List[str]] = []
    certifications: Optional[List[Certification]] = []
    custom_section: Optional[List[CustomSection]] = []
    resume_title: Optional[str] = None  # Optional, will be generated from personalInfo if not provided
    resume_type: Optional[str] = "TemplateAcademicProfessional"  # Default resume type
    template_category: Optional[str] = "Classic"
    profile_image: Optional[str] = None  # URL to uploaded profile image

class PDFGenerationRequest(BaseModel):
    prompt: str = Field(..., description="AI prompt for generating PDF content")
    template_name: Optional[str] = Field(default="classic", description="Template name for PDF generation")

class PDFGenerationResponse(BaseModel):
    pdf_url: str
    message: str

class AIEnhanceRequest(BaseModel):
    profession: str = Field(..., description="The profession/job title for the resume")
    jobDescription: str = Field(..., description="The job description to tailor the content to")
    sections: List[str] = Field(..., description="List of sections to enhance (e.g., ['summary', 'skills', 'experience'])")

class AIEnhanceResponse(BaseModel):
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[str]] = None
