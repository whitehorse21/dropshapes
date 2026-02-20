from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
import json
import uuid
from pathlib import Path

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse, ResumeDataCreate, PDFGenerationRequest, PDFGenerationResponse, AIEnhanceRequest
from app.utils.storage import get_storage
from app.utils.cache import cache, CacheKeys, clear_resume_cache
from app.services.pdf_service import pdf_service
from app.services.ai_service import ai_service
from app.services.ai_credits_service import AICreditService
from app.services.subscription_service import SubscriptionService, SubscriptionLimitError
from app.core.config import settings

router = APIRouter()
storage = get_storage()

def get_resume_cache_key(resume_id: int, user_id: int, nested: bool = False) -> str:
    """Generate cache key for resume data"""
    return f"{CacheKeys.RESUME}:{resume_id}:user:{user_id}:nested:{nested}"

def get_user_resumes_cache_key(user_id: int, skip: int, limit: int, nested: bool) -> str:
    """Generate cache key for user resumes list"""
    return f"{CacheKeys.RESUME}:user:{user_id}:list:skip:{skip}:limit:{limit}:nested:{nested}"

@router.get("/", response_model=List[Dict[str, Any]])
async def get_my_resumes(
    skip: int = 0,
    limit: int = 10,
    nested: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all user's resumes. Use ?nested=true for nested structure (default is flat)"""
    # Try to get from cache first
    cache_key = get_user_resumes_cache_key(current_user.id, skip, limit, nested)
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Get from database
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).offset(skip).limit(limit).all()
    
    if nested:
        result = resumes
    else:
        result = [format_structured_response(resume) for resume in resumes]
    
    # Cache the result
    cache.set(cache_key, result, settings.CACHE_RESUME_TTL)
    
    return result

@router.get("/{resume_id}")
async def get_resume(
    resume_id: int,
    nested: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific resume by ID. Use ?nested=true for nested structure (default is flat)"""
    # Try to get from cache first
    cache_key = get_resume_cache_key(resume_id, current_user.id, nested)
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Get from database
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if nested:
        result = resume
    else:
        result = format_structured_response(resume)
    
    # Cache the result
    cache.set(cache_key, result, settings.CACHE_RESUME_TTL)
    
    return result

@router.post("/", response_model=Dict[str, Any])
async def create_resume(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    # JSON body parameters (for application/json requests)
    resume_data_json: Optional[ResumeDataCreate] = Body(None),
    # Form data parameters (for multipart/form-data requests)
    resume_data: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None)
):
    """
    Create a new resume - supports both JSON body and form-data with file upload
    
    For JSON requests:
    - Use Content-Type: application/json
    - Send ResumeDataCreate object in request body
    - profile_image should be a URL string
    
    For form-data requests (with file upload):
    - Use Content-Type: multipart/form-data
    - Send JSON string in 'resume_data' form field
    - Send image file in 'profile_image' form field (optional)
    """
    # Check user subscription and limits
    try:
        SubscriptionService.validate_resume_creation(db, current_user.id)
    except SubscriptionLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    # Determine content type and parse data accordingly
    content_type = request.headers.get("content-type", "")
    resume_create = None
    
    if "application/json" in content_type:
        # Handle JSON request
        if not resume_data_json:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON body is required for application/json requests"
            )
        resume_create = resume_data_json
        
    elif "multipart/form-data" in content_type:
        # Handle form-data request
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_data form field is required for form-data requests"
            )
        
        # Parse JSON data from form field
        try:
            resume_json = json.loads(resume_data)
            resume_create = ResumeDataCreate(**resume_json)
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON data in resume_data field: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content-Type must be either application/json or multipart/form-data"
        )
    
    # Handle profile image upload if provided (only available in form-data requests)
    profile_image_url = None
    if profile_image and profile_image.filename:
        try:
            # Validate file type
            allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
            if profile_image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
                )
            
            # Validate file size (5MB max)
            content = await profile_image.read()
            if len(content) > 5 * 1024 * 1024:  # 5MB in bytes
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size too large. Maximum size is 5MB."
                )
            
            # Reset file position after reading
            await profile_image.seek(0)
            
            # Upload to storage using the correct method for UploadFile objects
            profile_image_url = await storage.upload_file(
                profile_image, 
                folder="profile_images"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading profile image: {str(e)}"
            )
    
    # Use uploaded file URL or profile_image from request data
    final_profile_image = profile_image_url or resume_create.profile_image
    
    # Generate resume title if not provided
    resume_title = resume_create.resume_title
    if not resume_title:
        resume_title = f"{resume_create.personalInfo.firstName} {resume_create.personalInfo.lastName} - {resume_create.profession or 'Resume'}"
    
    # Set default resume_type if not provided
    resume_type = resume_create.resume_type or 'TemplateProfessional'
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_create.personalInfo.dict(),
        "profession": resume_create.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_create.experience] if resume_create.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_create.education] if resume_create.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_create.skills] if resume_create.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_create.languages] if resume_create.languages else []
    }
    
    summary_data = {
        "summary": resume_create.summary if resume_create.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_create.hobbies if resume_create.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_create.certifications] if resume_create.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_create.custom_section] if resume_create.custom_section else []
    }
    
    # Create resume object
    db_resume = Resume(
        user_id=current_user.id,
        resume_title=resume_title,
        resume_type=resume_type,
        template_category=resume_create.template_category,
        profile_image=final_profile_image,
        profile=profile_data,
        work_history=work_history_data,
        education=education_data,
        skills=skills_data,
        summary=summary_data,
        hobbies=hobbies_data,
        certifications=certifications_data,
        languages=languages_data,
        custom_section=custom_section_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Clear user's resume list cache
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(db_resume)

@router.post("/json", response_model=Dict[str, Any])
async def create_resume_json(
    resume_data: ResumeDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new resume using JSON body only (alternative endpoint for JSON-only clients)"""
    # Check user subscription and limits
    try:
        SubscriptionService.validate_resume_creation(db, current_user.id)
    except SubscriptionLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    # Generate resume title if not provided
    resume_title = resume_data.resume_title
    if not resume_title:
        resume_title = f"{resume_data.personalInfo.firstName} {resume_data.personalInfo.lastName} - {resume_data.profession or 'Resume'}"
    
    # Set default resume_type if not provided
    resume_type = resume_data.resume_type or 'TemplateProfessional'
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_data.personalInfo.dict(),
        "profession": resume_data.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_data.experience] if resume_data.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_data.education] if resume_data.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_data.skills] if resume_data.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_data.languages] if resume_data.languages else []
    }
    
    summary_data = {
        "summary": resume_data.summary if resume_data.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_data.hobbies if resume_data.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_data.certifications] if resume_data.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_data.custom_section] if resume_data.custom_section else []
    }
    
    # Create resume object
    db_resume = Resume(
        user_id=current_user.id,
        resume_title=resume_title,
        resume_type=resume_type,
        template_category=resume_data.template_category,
        profile_image=resume_data.profile_image,
        profile=profile_data,
        work_history=work_history_data,
        education=education_data,
        skills=skills_data,
        summary=summary_data,
        hobbies=hobbies_data,
        certifications=certifications_data,
        languages=languages_data,
        custom_section=custom_section_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Clear user's resume list cache
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(db_resume)

@router.post("/upload", response_model=Dict[str, Any])
async def create_resume_with_upload(
    resume_data: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new resume with form-data for file upload support (alternative endpoint for form-data only clients)"""
    # Check user subscription and limits
    try:
        SubscriptionService.validate_resume_creation(db, current_user.id)
    except SubscriptionLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    # Parse JSON data from form field
    try:
        resume_json = json.loads(resume_data)
        resume_create = ResumeDataCreate(**resume_json)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON data in resume_data field: {str(e)}"
        )
    
    # Handle profile image upload if provided
    profile_image_url = None
    if profile_image and profile_image.filename:
        try:
            # Validate file type
            allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
            if profile_image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
                )
            
            # Validate file size (5MB max)
            content = await profile_image.read()
            if len(content) > 5 * 1024 * 1024:  # 5MB in bytes
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size too large. Maximum size is 5MB."
                )
            
            # Reset file position after reading
            await profile_image.seek(0)
            
            # Upload to storage using the correct method for UploadFile objects
            profile_image_url = await storage.upload_file(
                profile_image, 
                folder="profile_images"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading profile image: {str(e)}"
            )
    
    # Use uploaded file URL or profile_image from request data
    final_profile_image = profile_image_url or resume_create.profile_image
    
    # Generate resume title if not provided
    resume_title = resume_create.resume_title
    if not resume_title:
        resume_title = f"{resume_create.personalInfo.firstName} {resume_create.personalInfo.lastName} - {resume_create.profession or 'Resume'}"
    
    # Set default resume_type if not provided
    resume_type = resume_create.resume_type or 'TemplateProfessional'
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_create.personalInfo.dict(),
        "profession": resume_create.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_create.experience] if resume_create.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_create.education] if resume_create.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_create.skills] if resume_create.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_create.languages] if resume_create.languages else []
    }
    
    summary_data = {
        "summary": resume_create.summary if resume_create.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_create.hobbies if resume_create.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_create.certifications] if resume_create.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_create.custom_section] if resume_create.custom_section else []
    }
    
    # Create resume object
    db_resume = Resume(
        user_id=current_user.id,
        resume_title=resume_title,
        resume_type=resume_type,
        template_category=resume_create.template_category,
        profile_image=final_profile_image,
        profile=profile_data,
        work_history=work_history_data,
        education=education_data,
        skills=skills_data,
        summary=summary_data,
        hobbies=hobbies_data,
        certifications=certifications_data,
        languages=languages_data,
        custom_section=custom_section_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Clear user's resume list cache
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(db_resume)

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: int,
    resume_in: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Update resume fields
    for field, value in resume_in.dict(exclude_unset=True).items():
        setattr(resume, field, value)
    
    db.commit()
    db.refresh(resume)
    
    # Clear cache for this resume
    clear_resume_cache(resume_id)
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete PDF if exists
    if resume.pdf_url:
        storage.delete_file(resume.pdf_url)
    
    db.delete(resume)
    db.commit()
    
    # Clear cache for this resume and user's resume list
    clear_resume_cache(resume_id)
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return None


# Optionally, add a new endpoint for AI PDF generation:
@router.post("/{resume_id}/generate-ai-pdf", response_model=PDFGenerationResponse)
async def generate_resume_ai_pdf(
    resume_id: int,
    request: PDFGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a PDF from AI using a prompt"""
    # Check if resume exists and belongs to user
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check subscription limits and credits
    try:
        # Check if user has AI credits available
        if current_user.ai_credits < 1:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Not enough AI credits. You need 1 credit for PDF generation. Please upgrade your subscription."
            )
        
        # Deduct AI credits (1 credit per PDF generation)
        current_user.ai_credits -= 1
        db.commit()
        db.refresh(current_user)
        
        # Generate PDF using AI service
        pdf_url = await pdf_service.generate_pdf_from_ai(
            prompt=request.prompt, 
            template_name=request.template_name
        )
        
        # Update resume with new PDF URL
        resume.pdf_url = pdf_url
        db.commit()
        db.refresh(resume)
        
        # Clear cache for this resume
        clear_resume_cache(resume_id)
        
        return PDFGenerationResponse(
            pdf_url=pdf_url,
            message="PDF generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Error generating AI PDF for resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI PDF: {str(e)}"
        )

@router.post("/{resume_id}/ai-improve", response_model=Dict[str, Any])
async def improve_resume_with_ai(
    resume_id: int,
    section_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Improve a section of a resume with AI"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get section content from the nested JSON structures
    section_content = None
    
    # Map section names to their actual locations in the resume data
    if section_name == "profession":
        if resume.profile and isinstance(resume.profile, dict) and "profession" in resume.profile:
            section_content = resume.profile["profession"]
    elif section_name == "personalInfo":
        if resume.profile and isinstance(resume.profile, dict) and "personalInfo" in resume.profile:
            section_content = resume.profile["personalInfo"]
    elif section_name == "experience":
        if resume.work_history and isinstance(resume.work_history, dict) and "experience" in resume.work_history:
            section_content = resume.work_history["experience"]
    elif section_name == "education":
        if resume.education and isinstance(resume.education, dict) and "education" in resume.education:
            section_content = resume.education["education"]
    elif section_name == "skills":
        if resume.skills and isinstance(resume.skills, dict) and "skills" in resume.skills:
            section_content = resume.skills["skills"]
    elif section_name == "summary":
        if resume.summary and isinstance(resume.summary, dict) and "summary" in resume.summary:
            section_content = resume.summary["summary"]
    elif section_name == "hobbies":
        if resume.hobbies and isinstance(resume.hobbies, dict) and "hobbies" in resume.hobbies:
            section_content = resume.hobbies["hobbies"]
    elif section_name == "certifications":
        if resume.certifications and isinstance(resume.certifications, dict) and "certifications" in resume.certifications:
            section_content = resume.certifications["certifications"]
    elif section_name == "languages":
        if resume.languages and isinstance(resume.languages, dict) and "languages" in resume.languages:
            section_content = resume.languages["languages"]
    elif section_name == "achievements":
        if resume.achievements and isinstance(resume.achievements, dict) and "achievements" in resume.achievements:
            section_content = resume.achievements["achievements"]
    elif section_name == "references":
        if resume.references and isinstance(resume.references, dict) and "references" in resume.references:
            section_content = resume.references["references"]
    elif section_name == "publications":
        if resume.publications and isinstance(resume.publications, dict) and "publications" in resume.publications:
            section_content = resume.publications["publications"]
    else:
        # Try to get it directly as an attribute for backward compatibility
        if hasattr(resume, section_name) and getattr(resume, section_name) is not None:
            section_content = getattr(resume, section_name)
    
    # Check if section content is completely missing (None)
    if section_content is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Section '{section_name}' not found"
        )
    
    # For empty strings or lists, we'll provide context to AI to generate content
    is_empty_content = (
        (isinstance(section_content, str) and section_content.strip() == "") or
        (isinstance(section_content, list) and len(section_content) == 0) or
        (isinstance(section_content, dict) and len(section_content) == 0)
    )
    
    if is_empty_content:
        # For empty fields, provide context from other resume sections
        if section_name == "profession":
            # Get context from personal info and experience
            context_info = {
                "personalInfo": resume.profile.get("personalInfo", {}) if resume.profile else {},
                "experience": resume.work_history.get("experience", []) if resume.work_history else []
            }
            section_content = f"Empty profession field. Please suggest a profession title based on this context: {context_info}"
        elif section_name == "experience":
            # Get context from other sections
            context_info = {
                "personalInfo": resume.profile.get("personalInfo", {}) if resume.profile else {},
                "profession": resume.profile.get("profession", "") if resume.profile else "",
                "skills": resume.skills.get("skills", []) if resume.skills else []
            }
            section_content = f"Empty experience field. Please create work experience examples based on this context: {context_info}"
        elif section_name == "certifications":
            # Get context from other sections
            context_info = {
                "personalInfo": resume.profile.get("personalInfo", {}) if resume.profile else {},
                "profession": resume.profile.get("profession", "") if resume.profile else "",
                "experience": resume.work_history.get("experience", []) if resume.work_history else [],
                "skills": resume.skills.get("skills", []) if resume.skills else []
            }
            section_content = f"Empty certifications field. Please suggest relevant certifications based on this context: {context_info}"
        elif section_name == "skills":
            # Get context from other sections
            context_info = {
                "personalInfo": resume.profile.get("personalInfo", {}) if resume.profile else {},
                "profession": resume.profile.get("profession", "") if resume.profile else "",
                "experience": resume.work_history.get("experience", []) if resume.work_history else []
            }
            section_content = f"Empty skills field. Please suggest relevant skills based on this context: {context_info}"
        elif section_name == "summary":
            # Get context from other sections
            context_info = {
                "profession": resume.profile.get("profession", "") if resume.profile else "",
                "experience": resume.work_history.get("experience", []) if resume.work_history else [],
                "skills": resume.skills.get("skills", []) if resume.skills else []
            }
            section_content = f"Empty summary field. Please create a professional summary based on this context: {context_info}"
    
    try:
        # Check and deduct AI credits using the service
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        # Convert to string if it's a dict
        content_str = section_content
        if isinstance(section_content, dict):
            content_str = str(section_content)
        
        # Improve section with AI
        improved_content = await ai_service.improve_resume_section(section_name, content_str)
        
        # Try to parse the improved content as JSON for structured response
        try:
            parsed_response = json.loads(improved_content)
            return parsed_response
        except json.JSONDecodeError as e:
            # Log the parsing error for debugging
            print(f"JSON parsing failed for section {section_name}: {str(e)}")
            print(f"Raw AI response (first 500 chars): {improved_content[:500]}")
            
            # Try to clean the response again
            cleaned_response = ai_service._clean_ai_response(improved_content)
            try:
                parsed_response = json.loads(cleaned_response)
                return parsed_response
            except json.JSONDecodeError:
                # If still not valid JSON, return the cleaned response in expected format
                return {
                    section_name: {
                        "original": content_str,
                        "improved": cleaned_response,
                        "note": f"AI response required manual cleaning. Original error: {str(e)}"
                    }
                }
        
        # Check if the AI actually made improvements (for debugging)
        if section_name == "certifications" and isinstance(parsed_response, dict):
            print(f"DEBUG: Certifications AI response: {parsed_response}")
        
        return parsed_response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error improving resume with AI: {str(e)}"
        )

@router.post("/{resume_id}/ai-improve-all", response_model=Dict[str, Any])
async def improve_entire_resume_with_ai(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Improve all sections of a resume with AI"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    try:
        # Check and deduct AI credits (higher cost for full resume improvement)
        AICreditService.check_and_deduct_credits(db, current_user, 5)
        
        # Prepare resume data for improvement
        resume_dict = {}
        
        # Add non-null fields to the dictionary
        if resume.resume_title:
            resume_dict['resume_title'] = resume.resume_title
        if resume.profile:
            resume_dict['profile'] = resume.profile
        if resume.work_history:
            resume_dict['work_history'] = resume.work_history
        if resume.education:
            resume_dict['education'] = resume.education
        if resume.skills:
            resume_dict['skills'] = resume.skills
        if resume.summary:
            resume_dict['summary'] = resume.summary
        if resume.hobbies:
            resume_dict['hobbies'] = resume.hobbies
        if resume.certifications:
            resume_dict['certifications'] = resume.certifications
        if resume.languages:
            resume_dict['languages'] = resume.languages
        if resume.achievements:
            resume_dict['achievements'] = resume.achievements
        if resume.references:
            resume_dict['references'] = resume.references
        if resume.publications:
            resume_dict['publications'] = resume.publications
        
        # Log what we're sending for debugging
        print(f"Sending resume data with sections: {list(resume_dict.keys())}")
        for key, value in resume_dict.items():
            if isinstance(value, str):
                print(f"{key}: {value[:100]}...")
            elif isinstance(value, dict):
                print(f"{key}: {json.dumps(value, indent=2)[:200]}...")
            elif isinstance(value, list):
                print(f"{key}: {len(value)} items")
        
        if not resume_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resume content found to improve"
            )
        
        # Improve entire resume with AI
        try:
            improved_content = await ai_service.improve_entire_resume(resume_dict)
        except Exception as ai_error:
            print(f"AI Service Error: {str(ai_error)}")
            print(f"Resume sections being processed: {list(resume_dict.keys())}")
            # Return a structured error response instead of raising HTTPException
            error_response = {}
            for section_name, original_data in resume_dict.items():
                error_response[section_name] = {
                    'original': original_data,
                    'improved': original_data,
                    'ai_error': str(ai_error)
                }
            return error_response
        
        # Log the raw response for debugging
        print(f"Raw AI response length: {len(improved_content)}")
        print(f"Raw AI response (first 1000 chars): {improved_content[:1000]}")
        
        # Try to parse the improved content as JSON for structured response
        try:
            parsed_response = json.loads(improved_content)
            
            # Validate that we have the expected structure
            if not isinstance(parsed_response, dict):
                raise ValueError("Response is not a dictionary")
            
            # Check if this is an error response from the AI service
            if any('error' in str(value) for value in parsed_response.values() if isinstance(value, dict)):
                print("Detected error in AI response, returning as-is for debugging")
                return parsed_response
            
            # Special handling for incomplete AI responses - detect various incomplete patterns
            if ('experience' in parsed_response and len(parsed_response) == 1 and 
                'original' not in str(parsed_response)):
                print("Detected incomplete AI response - only experience returned, reconstructing full response")
                
                # Reconstruct the full response with all sections
                complete_response = {}
                
                for section_name, original_data in resume_dict.items():
                    if section_name == 'work_history':
                        # Use the improved experience data from AI
                        complete_response[section_name] = {
                            'original': original_data,
                            'improved': {
                                'experience': parsed_response['experience']
                            }
                        }
                    else:
                        # For other sections, return as-is since AI didn't improve them
                        complete_response[section_name] = {
                            'original': original_data,
                            'improved': original_data
                        }
                
                return complete_response
            
            # Another common pattern: AI returns just improved values without structure
            elif (len(parsed_response) <= len(resume_dict) and 
                  all(section in resume_dict for section in parsed_response.keys()) and
                  not any('original' in str(value) for value in parsed_response.values())):
                print("Detected direct improvement response without original/improved structure")
                
                restructured_response = {}
                for section_name, original_data in resume_dict.items():
                    if section_name in parsed_response:
                        # AI provided improvement for this section
                        restructured_response[section_name] = {
                            'original': original_data,
                            'improved': parsed_response[section_name]
                        }
                    else:
                        # No improvement provided, use original
                        restructured_response[section_name] = {
                            'original': original_data,
                            'improved': original_data
                        }
                
                return restructured_response
            
            # Check if we have the expected original/improved structure for each section
            valid_structure = True
            restructured_response = {}
            
            # Check if the response has the expected structure
            for section_key, section_data in parsed_response.items():
                if isinstance(section_data, dict):
                    if 'original' in section_data and 'improved' in section_data:
                        # This section has the correct structure
                        restructured_response[section_key] = section_data
                    else:
                        # This might be direct content that needs restructuring
                        print(f"Section {section_key} missing original/improved structure, attempting to restructure")
                        valid_structure = False
                        
                        # Try to find the original data for this section
                        original_data = resume_dict.get(section_key, section_data)
                        restructured_response[section_key] = {
                            'original': original_data,
                            'improved': section_data
                        }
                else:
                    # Handle direct arrays or other data types
                    print(f"Section {section_key} is not a dict, attempting to restructure")
                    valid_structure = False
                    
                    # Find the original data
                    original_data = resume_dict.get(section_key, section_data)
                    restructured_response[section_key] = {
                        'original': original_data,
                        'improved': section_data
                    }
            
            # Special case: If we detect the single experience format (AI returned only experience array)
            if 'experience' in parsed_response and 'original' not in parsed_response:
                print("Detected direct experience array response, restructuring to work_history format")
                experience_data = parsed_response['experience']
                
                # Get original work_history data
                original_work_history = resume_dict.get('work_history', {})
                
                restructured_response = {
                    'work_history': {
                        'original': original_work_history,
                        'improved': {
                            'experience': experience_data
                        }
                    }
                }
                
                # Add any other sections that were sent but not returned
                for section_name in resume_dict.keys():
                    if section_name != 'work_history' and section_name not in restructured_response:
                        restructured_response[section_name] = {
                            'original': resume_dict[section_name],
                            'improved': resume_dict[section_name]  # No improvement if not returned
                        }
                
                return restructured_response
            
            # If structure was invalid, return the restructured response
            if not valid_structure:
                print("Response structure was corrected")
                
                # Ensure all sent sections are represented
                for section_name in resume_dict.keys():
                    if section_name not in restructured_response:
                        restructured_response[section_name] = {
                            'original': resume_dict[section_name],
                            'improved': resume_dict[section_name]  # No improvement if not returned
                        }
                
                return restructured_response
            
            # Log sections that were sent vs received
            sent_sections = set(resume_dict.keys())
            received_sections = set(parsed_response.keys())
            missing_sections = sent_sections - received_sections
            
            if missing_sections:
                print(f"Warning: Missing sections in AI response: {missing_sections}")
                print(f"Sent sections: {sent_sections}")
                print(f"Received sections: {received_sections}")
                
                # Add missing sections with no improvements
                for missing_section in missing_sections:
                    parsed_response[missing_section] = {
                        'original': resume_dict[missing_section],
                        'improved': resume_dict[missing_section]
                    }
            
            return parsed_response
            
        except (json.JSONDecodeError, ValueError) as e:
            # Log the parsing error for debugging
            print(f"JSON parsing failed for entire resume: {str(e)}")
            print(f"Raw AI response (first 1000 chars): {improved_content[:1000]}")
            
            # Try to clean the response again
            cleaned_response = ai_service._clean_ai_response(improved_content)
            try:
                parsed_response = json.loads(cleaned_response)
                
                # Validate the cleaned response structure
                if isinstance(parsed_response, dict):
                    return parsed_response
                else:
                    raise ValueError("Cleaned response is not a dictionary")
                    
            except (json.JSONDecodeError, ValueError) as e2:
                print(f"Second parsing attempt failed: {str(e2)}")
                print(f"Cleaned response (first 1000 chars): {cleaned_response[:1000]}")
                
                # If parsing fails completely, return a structured error response
                return {
                    "error": "Failed to parse AI response",
                    "original_error": str(e),
                    "cleaning_error": str(e2),
                    "raw_response_preview": improved_content[:500],
                    "cleaned_response_preview": cleaned_response[:500],
                    "debug_info": {
                        "original_length": len(improved_content),
                        "cleaned_length": len(cleaned_response),
                        "resume_sections_sent": list(resume_dict.keys())
                    }
                }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error improving resume with AI: {str(e)}"
        )

@router.post("/with-upload", response_model=Dict[str, Any])
async def create_resume_with_upload(
    resume_data: str = Form(...),
    profile_image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new resume with form-data for file upload support"""
    # Check user subscription and limits
    try:
        SubscriptionService.validate_resume_creation(db, current_user.id)
    except SubscriptionLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    # Parse JSON data from form
    try:
        resume_json = json.loads(resume_data)
        resume_create = ResumeDataCreate(**resume_json)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON data: {str(e)}"
        )
    
    # Handle profile image upload if provided
    profile_image_url = None
    if profile_image and profile_image.filename:
        try:
            # Validate file type
            allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
            if profile_image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
                )
            
            # Validate file size (5MB max)
            content = await profile_image.read()
            if len(content) > 5 * 1024 * 1024:  # 5MB in bytes
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size too large. Maximum size is 5MB."
                )
            
            # Generate unique filename
            file_extension = Path(profile_image.filename).suffix
            unique_filename = f"profile_{current_user.id}_{uuid.uuid4()}{file_extension}"
            
            # Reset file position after reading
            await profile_image.seek(0)
            
            # Upload to storage using the correct method for UploadFile objects
            profile_image_url = await storage.upload_file(
                profile_image, 
                folder="profile_images"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading profile image: {str(e)}"
            )
    
    # Use profile_image from form data or uploaded file
    final_profile_image = profile_image_url or resume_create.profile_image
    
    # Generate resume title if not provided
    resume_title = resume_create.resume_title
    if not resume_title:
        resume_title = f"{resume_create.personalInfo.firstName} {resume_create.personalInfo.lastName} - {resume_create.profession or 'Resume'}"
    
    # Set default resume_type if not provided
    resume_type = resume_create.resume_type or 'TemplateProfessional'
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_create.personalInfo.dict(),
        "profession": resume_create.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_create.experience] if resume_create.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_create.education] if resume_create.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_create.skills] if resume_create.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_create.languages] if resume_create.languages else []
    }
    
    summary_data = {
        "summary": resume_create.summary if resume_create.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_create.hobbies if resume_create.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_create.certifications] if resume_create.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_create.custom_section] if resume_create.custom_section else []
    }
    
    # Create resume object
    db_resume = Resume(
        user_id=current_user.id,
        resume_title=resume_title,
        resume_type=resume_type,
        template_category=resume_create.template_category,
        profile_image=final_profile_image,
        profile=profile_data,
        work_history=work_history_data,
        education=education_data,
        skills=skills_data,
        summary=summary_data,
        hobbies=hobbies_data,
        certifications=certifications_data,
        languages=languages_data,
        custom_section=custom_section_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Clear user's resume list cache
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(db_resume)
async def create_resume_structured(
    resume_data: ResumeDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new resume using structured data format (JSON body)"""
    # Check user subscription and limits
    try:
        SubscriptionService.validate_resume_creation(db, current_user.id)
    except SubscriptionLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    # Generate resume title if not provided
    resume_title = resume_data.resume_title
    if not resume_title:
        resume_title = f"{resume_data.personalInfo.firstName} {resume_data.personalInfo.lastName} - {resume_data.profession or 'Resume'}"
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_data.personalInfo.dict(),
        "profession": resume_data.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_data.experience] if resume_data.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_data.education] if resume_data.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_data.skills] if resume_data.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_data.languages] if resume_data.languages else []
    }
    
    summary_data = {
        "summary": resume_data.summary if resume_data.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_data.hobbies if resume_data.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_data.certifications] if resume_data.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_data.custom_section] if resume_data.custom_section else []
    }
    
    # Create resume object
    db_resume = Resume(
        user_id=current_user.id,
        resume_title=resume_title,
        resume_type=resume_data.resume_type or "TemplateProfessional",
        template_category=resume_data.template_category,
        profile_image=resume_data.profile_image,
        profile=profile_data,
        work_history=work_history_data,
        education=education_data,
        skills=skills_data,
        summary=summary_data,
        hobbies=hobbies_data,
        certifications=certifications_data,
        languages=languages_data,
        custom_section=custom_section_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    # Clear user's resume list cache
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(db_resume)

@router.put("/{resume_id}/update-structured", response_model=Dict[str, Any])
async def update_resume_structured(
    resume_id: int,
    resume_data: ResumeDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a resume using structured data format"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Update resume title if provided
    if resume_data.resume_title:
        resume.resume_title = resume_data.resume_title
    else:
        resume.resume_title = f"{resume_data.personalInfo.firstName} {resume_data.personalInfo.lastName} - {resume_data.profession or 'Resume'}"
    
    # Transform structured data to the database format
    profile_data = {
        "personalInfo": resume_data.personalInfo.dict(),
        "profession": resume_data.profession
    }
    
    work_history_data = {
        "experience": [exp.dict() for exp in resume_data.experience] if resume_data.experience else []
    }
    
    education_data = {
        "education": [edu.dict() for edu in resume_data.education] if resume_data.education else []
    }
    
    # Transform skills from new format (name + level) to database format
    skills_data = {
        "skills": [skill.dict() for skill in resume_data.skills] if resume_data.skills else []
    }
    
    # Transform languages from new format (name + level) to database format
    languages_data = {
        "languages": [lang.dict() for lang in resume_data.languages] if resume_data.languages else []
    }
    
    summary_data = {
        "summary": resume_data.summary if resume_data.summary else ""
    }
    
    hobbies_data = {
        "hobbies": resume_data.hobbies if resume_data.hobbies else []
    }
    
    certifications_data = {
        "certifications": [cert.dict() for cert in resume_data.certifications] if resume_data.certifications else []
    }
    
    # Transform custom sections
    custom_section_data = {
        "custom_section": [section.dict() for section in resume_data.custom_section] if resume_data.custom_section else []
    }
    
    # Update resume fields
    resume.resume_type = resume_data.resume_type or "TemplateProfessional"
    resume.template_category = resume_data.template_category
    resume.profile_image = resume_data.profile_image or resume.profile_image  # Keep existing if not provided
    resume.profile = profile_data
    resume.work_history = work_history_data
    resume.education = education_data
    resume.skills = skills_data
    resume.summary = summary_data
    resume.hobbies = hobbies_data
    resume.certifications = certifications_data
    resume.languages = languages_data
    resume.custom_section = custom_section_data
    
    db.commit()
    db.refresh(resume)
    
    # Clear cache for this resume
    clear_resume_cache(resume_id)
    cache.delete_pattern(f"{CacheKeys.RESUME}:user:{current_user.id}:list:*")
    
    return format_structured_response(resume)

@router.get("/{resume_id}/structured", response_model=Dict[str, Any])
async def get_resume_structured(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific resume in structured format with flat structure"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return format_structured_response(resume)

@router.get("/{resume_id}/flat", response_model=Dict[str, Any])
async def get_resume_flat(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific resume in flat structure format"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return format_structured_response(resume)

@router.post("/ai-enhance", response_model=Dict[str, Any])
async def ai_enhance_resume_content(
    request: AIEnhanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI-enhanced resume content based on profession and job description without needing a stored resume"""
    try:
        # Extract request parameters
        profession = request.profession
        job_description = request.jobDescription
        sections = request.sections
        
        # Validate required parameters
        if not profession:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profession is required"
            )
        
        if not job_description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description is required"
            )
        
        if not sections or not isinstance(sections, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sections must be a non-empty list"
            )
        
        # Check and deduct AI credits
        AICreditService.check_and_deduct_credits(db, current_user, len(sections))
        
        # Generate AI-enhanced content for each requested section
        enhanced_content = {}
        
        for section in sections:
            section_lower = section.lower()
            
            if section_lower == "summary":
                prompt = f"""
                Create a professional resume summary for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Generate a compelling 2-3 sentence professional summary that:
                - Highlights relevant experience and skills for this role
                - Demonstrates value to potential employers
                - Uses industry-specific keywords from the job description
                - Shows enthusiasm and expertise
                
                Return only the summary text, no formatting, no markdown, no additional text.
                """
                summary_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_summary = summary_response.strip()
                
                # Remove any markdown formatting
                if cleaned_summary.startswith('```'):
                    lines = cleaned_summary.split('\n')
                    cleaned_summary = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_summary
                
                # Remove any remaining unwanted characters
                cleaned_summary = cleaned_summary.strip().strip('"').strip("'")
                
                enhanced_content["summary"] = cleaned_summary
                
            elif section_lower == "skills":
                prompt = f"""
                Generate a comprehensive list of relevant skills for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Create a list of 8-12 skills that include:
                - Technical skills mentioned in the job description
                - Industry-standard tools and technologies
                - Soft skills relevant to the role
                - Programming languages, frameworks, or software relevant to {profession}
                
                Return as a JSON array of strings, for example: ["React.js", "Node.js", "Python", "AWS", "REST APIs"]
                Return only the JSON array, no markdown, no code blocks, no additional text.
                """
                skills_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_skills_response = skills_response.strip()
                
                # Remove markdown code blocks if present
                if cleaned_skills_response.startswith('```json'):
                    cleaned_skills_response = cleaned_skills_response[7:]
                if cleaned_skills_response.startswith('```'):
                    cleaned_skills_response = cleaned_skills_response[3:]
                if cleaned_skills_response.endswith('```'):
                    cleaned_skills_response = cleaned_skills_response[:-3]
                
                cleaned_skills_response = cleaned_skills_response.strip()
                
                try:
                    # Try to parse as JSON array
                    skills_json = json.loads(cleaned_skills_response)
                    if isinstance(skills_json, list):
                        # Filter out any non-string items and clean up the skills
                        clean_skills = []
                        for skill in skills_json:
                            if isinstance(skill, str):
                                # Remove any remaining quotes or unwanted characters
                                clean_skill = skill.strip().strip('"').strip("'")
                                if clean_skill and not clean_skill.startswith('[') and not clean_skill.startswith(']'):
                                    clean_skills.append(clean_skill)
                        enhanced_content["skills"] = clean_skills
                    else:
                        # Fallback: split by commas or lines
                        fallback_skills = [s.strip().strip('"').strip("'") for s in cleaned_skills_response.replace('\n', ',').split(',') if s.strip() and not s.strip().startswith('[') and not s.strip().startswith(']')]
                        enhanced_content["skills"] = [skill for skill in fallback_skills if skill and not skill.startswith('```') and not skill.endswith('```')]
                except json.JSONDecodeError:
                    # Enhanced fallback: split by commas or lines and clean up
                    fallback_skills = []
                    
                    # Try to extract skills from various formats
                    lines = cleaned_skills_response.replace('[', '').replace(']', '').split('\n')
                    for line in lines:
                        if line.strip():
                            # Split by comma if multiple skills in one line
                            parts = line.split(',')
                            for part in parts:
                                clean_skill = part.strip().strip('"').strip("'").strip()
                                if clean_skill and not clean_skill.startswith('```') and not clean_skill.endswith('```'):
                                    fallback_skills.append(clean_skill)
                    
                    enhanced_content["skills"] = fallback_skills if fallback_skills else ["JavaScript", "Python", "React", "Node.js", "API Development", "Database Design", "Problem Solving", "Team Collaboration"]
                
            elif section_lower == "experience":
                prompt = f"""
                Generate 3-4 professional work experience bullet points for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Create realistic work experience examples that:
                - Show progression and growth in the field
                - Include quantifiable achievements and metrics
                - Use strong action verbs
                - Demonstrate skills mentioned in the job description
                - Are specific and measurable (include percentages, numbers, timeframes)
                
                Return as a JSON array of strings, for example: ["Achievement 1 with 30% improvement", "Led team of 5 developers", "Implemented system that reduced costs by $50K"]
                Return only the JSON array, no markdown, no code blocks, no additional text.
                """
                experience_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_experience_response = experience_response.strip()
                
                # Remove markdown code blocks if present
                if cleaned_experience_response.startswith('```json'):
                    cleaned_experience_response = cleaned_experience_response[7:]
                if cleaned_experience_response.startswith('```'):
                    cleaned_experience_response = cleaned_experience_response[3:]
                if cleaned_experience_response.endswith('```'):
                    cleaned_experience_response = cleaned_experience_response[:-3]
                
                cleaned_experience_response = cleaned_experience_response.strip()
                
                try:
                    # Try to parse as JSON array
                    experience_json = json.loads(cleaned_experience_response)
                    if isinstance(experience_json, list):
                        # Filter out any non-string items and clean up the experience
                        clean_experience = []
                        for exp in experience_json:
                            if isinstance(exp, str):
                                # Remove any remaining quotes or unwanted characters
                                clean_exp = exp.strip().strip('"').strip("'")
                                if clean_exp and not clean_exp.startswith('[') and not clean_exp.startswith(']'):
                                    clean_experience.append(clean_exp)
                        enhanced_content["experience"] = clean_experience
                    else:
                        # Fallback: split by lines
                        fallback_experience = [s.strip().strip('"').strip("'") for s in cleaned_experience_response.split('\n') if s.strip() and not s.strip().startswith('[') and not s.strip().startswith(']')]
                        enhanced_content["experience"] = [exp for exp in fallback_experience if exp and not exp.startswith('```') and not exp.endswith('```')]
                except json.JSONDecodeError:
                    # Enhanced fallback: split by lines and clean up
                    fallback_experience = []
                    
                    # Try to extract experience from various formats
                    lines = cleaned_experience_response.replace('[', '').replace(']', '').split('\n')
                    for line in lines:
                        clean_exp = line.strip().strip('"').strip("'").strip()
                        if clean_exp and not clean_exp.startswith('```') and not clean_exp.endswith('```') and len(clean_exp) > 10:
                            fallback_experience.append(clean_exp)
                    
                    enhanced_content["experience"] = fallback_experience if fallback_experience else [
                        f"Developed and optimized web applications using modern {profession.lower()} technologies",
                        f"Collaborated with cross-functional teams to deliver high-quality software solutions",
                        f"Implemented best practices and coding standards to improve code quality and maintainability"
                    ]
            
            else:
                # For other sections, provide a generic enhancement
                prompt = f"""
                Generate professional {section} content for a {profession} resume based on this job description:
                
                Job Description: {job_description}
                
                Create relevant, professional {section} content that would be appropriate for this role.
                Return only the content, no markdown, no code blocks, no additional formatting or explanation.
                """
                response = ai_service._generate_with_aws(prompt)
                
                # Clean the response
                cleaned_response = response.strip()
                
                # Remove any markdown formatting
                if cleaned_response.startswith('```'):
                    lines = cleaned_response.split('\n')
                    cleaned_response = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_response
                
                # Remove any remaining unwanted characters
                cleaned_response = cleaned_response.strip().strip('"').strip("'")
                
                enhanced_content[section] = cleaned_response
        
        return enhanced_content
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI-enhanced resume content: {str(e)}"
        )

def format_structured_response(resume: Resume) -> dict:
    """Format resume data for structured response with flat structure"""
    response = {
        "id": resume.id,
        "user_id": resume.user_id,
        "resume_title": resume.resume_title,
        "resume_type": resume.resume_type or "TemplateProfessional",
        "template_category": resume.template_category or "Professional",
        "profile_image": resume.profile_image,
        "pdf_url": resume.pdf_url,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }
    
    # Add structured data from JSON fields - extract content directly
    if resume.profile:
        profile_data = resume.profile
        if isinstance(profile_data, dict):
            # Extract personalInfo and profession directly
            if "personalInfo" in profile_data:
                response["personalInfo"] = profile_data["personalInfo"]
            if "profession" in profile_data:
                response["profession"] = profile_data["profession"]
    
    if resume.work_history:
        work_data = resume.work_history
        if isinstance(work_data, dict) and "experience" in work_data:
            response["experience"] = work_data["experience"]
    
    if resume.education:
        edu_data = resume.education
        if isinstance(edu_data, dict) and "education" in edu_data:
            response["education"] = edu_data["education"]
    
    if resume.skills:
        skills_data = resume.skills
        if isinstance(skills_data, dict) and "skills" in skills_data:
            response["skills"] = skills_data["skills"]
    
    if resume.summary:
        summary_data = resume.summary
        if isinstance(summary_data, dict) and "summary" in summary_data:
            response["summary"] = summary_data["summary"]
    
    if resume.hobbies:
        hobbies_data = resume.hobbies
        if isinstance(hobbies_data, dict) and "hobbies" in hobbies_data:
            response["hobbies"] = hobbies_data["hobbies"]
    
    if resume.certifications:
        cert_data = resume.certifications
        if isinstance(cert_data, dict) and "certifications" in cert_data:
            response["certifications"] = cert_data["certifications"]
    
    if resume.languages:
        lang_data = resume.languages
        if isinstance(lang_data, dict) and "languages" in lang_data:
            response["languages"] = lang_data["languages"]
    
    # Add optional fields only if they exist and have content
    if resume.achievements:
        achievements_data = resume.achievements
        if isinstance(achievements_data, dict) and "achievements" in achievements_data:
            response["achievements"] = achievements_data["achievements"]
    
    if resume.references:
        ref_data = resume.references
        if isinstance(ref_data, dict) and "references" in ref_data:
            response["references"] = ref_data["references"]
    
    if resume.publications:
        pub_data = resume.publications
        if isinstance(pub_data, dict) and "publications" in pub_data:
            response["publications"] = pub_data["publications"]
    
    if resume.custom_section:
        custom_data = resume.custom_section
        if isinstance(custom_data, dict) and "custom_section" in custom_data:
            response["custom_section"] = custom_data["custom_section"]
    
    if resume.resume_style:
        style_data = resume.resume_style
        if isinstance(style_data, dict) and "resume_style" in style_data:
            response["resume_style"] = style_data["resume_style"]
    
    return response
