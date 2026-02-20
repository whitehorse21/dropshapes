from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.cover_letter import CoverLetter
from app.schemas.cover_letter import (
    CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse,
    CoverLetterSingleResponse, CoverLetterListResponse, CoverLetterDeleteResponse, CoverLetterMigrationResponse,
    APIResponse, CoverLetterPDFGenerationRequest, CoverLetterPDFGenerationResponse,
    CoverLetterAIEnhanceRequest, CoverLetterAIEnhanceResponse
)
from app.utils.storage import get_storage
from app.services.pdf_service import pdf_service
from app.services.ai_service import ai_service
from app.services.ai_credits_service import AICreditService
from app.services.subscription_service import SubscriptionService, SubscriptionLimitError
from app.models.resume import Resume
from app.utils.data_migration import migrate_cover_letter_data

router = APIRouter()
storage = get_storage()

@router.post("/migrate-data", response_model=CoverLetterMigrationResponse)
async def migrate_cover_letter_data_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Migrate existing cover letter data to match the new schema format"""
    # Only allow admin users to run migration
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can run data migration"
        )
    
    try:
        stats = migrate_cover_letter_data(db)
        return CoverLetterMigrationResponse(
            success=True,
            data=stats,
            message="Cover letter data migration completed successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Migration failed: {str(e)}"
        )

@router.get("/", response_model=CoverLetterListResponse)
async def get_my_cover_letters(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all user's cover letters"""
    try:
        cover_letters = db.query(CoverLetter).filter(CoverLetter.user_id == current_user.id).offset(skip).limit(limit).all()
        return CoverLetterListResponse(
            success=True,
            data=cover_letters,
            message=f"Successfully retrieved {len(cover_letters)} cover letters"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving cover letters: {str(e)}"
        )

@router.get("/{cover_letter_id}", response_model=CoverLetterSingleResponse)
async def get_cover_letter(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific cover letter by ID"""
    try:
        cover_letter = db.query(CoverLetter).filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id
        ).first()
        
        if not cover_letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found"
            )
        
        return CoverLetterSingleResponse(
            success=True,
            data=cover_letter,
            message="Cover letter retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving cover letter: {str(e)}"
        )

@router.post("/", response_model=CoverLetterSingleResponse)
async def create_cover_letter(
    cover_letter_in: CoverLetterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new cover letter"""
    try:
        # Validate required fields - allow empty strings but ensure they're not just whitespace
        if cover_letter_in.cover_letter_title and not cover_letter_in.cover_letter_title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover letter title cannot be empty"
            )
        
        if cover_letter_in.cover_letter_type and not cover_letter_in.cover_letter_type.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover letter type cannot be empty"
            )
        
        if cover_letter_in.cover_template_category and not cover_letter_in.cover_template_category.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover template category cannot be empty"
            )
        
        # Check user subscription and limits
        try:
            SubscriptionService.validate_cover_letter_creation(db, current_user.id)
        except SubscriptionLimitError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        
        # Create cover letter object - convert Pydantic models to dicts for JSON storage
        # Handle empty strings by storing them as-is, not stripping them
        db_cover_letter = CoverLetter(
            user_id=current_user.id,
            cover_letter_title=cover_letter_in.cover_letter_title.strip() if cover_letter_in.cover_letter_title else "",
            cover_letter_type=cover_letter_in.cover_letter_type.strip() if cover_letter_in.cover_letter_type else "",
            cover_template_category=cover_letter_in.cover_template_category.strip() if cover_letter_in.cover_template_category else "",
            profile=cover_letter_in.profile.dict() if cover_letter_in.profile else None,
            recipient=cover_letter_in.recipient.dict() if cover_letter_in.recipient else None,
            introduction=cover_letter_in.introduction.dict() if cover_letter_in.introduction else None,
            body=cover_letter_in.body.strip() if cover_letter_in.body else "",
            closing=cover_letter_in.closing.dict() if cover_letter_in.closing else None,
            cover_style=cover_letter_in.cover_style.dict() if cover_letter_in.cover_style else None
        )
        
        db.add(db_cover_letter)
        db.commit()
        db.refresh(db_cover_letter)
        
        return CoverLetterSingleResponse(
            success=True,
            data=db_cover_letter,
            message="Cover letter created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating cover letter: {str(e)}"
        )

@router.put("/{cover_letter_id}", response_model=CoverLetterSingleResponse)
async def update_cover_letter(
    cover_letter_id: int,
    cover_letter_in: CoverLetterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a cover letter"""
    try:
        cover_letter = db.query(CoverLetter).filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id
        ).first()
        
        if not cover_letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found"
            )
        
        # Validate update data
        update_data = cover_letter_in.dict(exclude_unset=True)
        
        # For updates, allow empty strings - only validate if a non-empty value is provided
        # This allows clearing fields by setting them to empty strings
        if 'cover_letter_title' in update_data and update_data['cover_letter_title'] and not update_data['cover_letter_title'].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover letter title cannot be empty"
            )
        
        if 'cover_letter_type' in update_data and update_data['cover_letter_type'] and not update_data['cover_letter_type'].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover letter type cannot be empty"
            )
        
        if 'cover_template_category' in update_data and update_data['cover_template_category'] and not update_data['cover_template_category'].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover template category cannot be empty"
            )
        
        # Clean string fields
        for field in ['cover_letter_title', 'cover_letter_type', 'cover_template_category', 'body']:
            if field in update_data and isinstance(update_data[field], str):
                update_data[field] = update_data[field].strip()
        
        for field, value in update_data.items():
            setattr(cover_letter, field, value)
        
        db.commit()
        db.refresh(cover_letter)
        
        return CoverLetterSingleResponse(
            success=True,
            data=cover_letter,
            message="Cover letter updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating cover letter: {str(e)}"
        )

@router.delete("/{cover_letter_id}", response_model=CoverLetterDeleteResponse)
async def delete_cover_letter(
    cover_letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a cover letter"""
    try:
        cover_letter = db.query(CoverLetter).filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id
        ).first()
        
        if not cover_letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found"
            )
        
        # Delete PDF if exists
        if cover_letter.pdf_url:
            try:
                storage.delete_file(cover_letter.pdf_url)
            except Exception as e:
                # Log the error but don't fail the deletion
                print(f"Warning: Could not delete PDF file {cover_letter.pdf_url}: {e}")
        
        db.delete(cover_letter)
        db.commit()
        
        return CoverLetterDeleteResponse(
            success=True,
            data={"message": "Cover letter deleted successfully"},
            message="Cover letter deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting cover letter: {str(e)}"
        )

@router.post("/{cover_letter_id}/generate-ai-pdf", response_model=CoverLetterPDFGenerationResponse)
async def generate_cover_letter_ai_pdf(
    cover_letter_id: int,
    request: CoverLetterPDFGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a PDF from AI using a prompt"""
    try:
        # Check if cover letter exists and belongs to user
        cover_letter = db.query(CoverLetter).filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id
        ).first()
        if not cover_letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cover letter not found"
            )
        
        # Check subscription limits and credits
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
        
        # Update cover letter with new PDF URL
        cover_letter.pdf_url = pdf_url
        db.commit()
        db.refresh(cover_letter)
        
        return CoverLetterPDFGenerationResponse(
            pdf_url=pdf_url,
            message="PDF generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Log the error for debugging
        print(f"Error generating AI PDF for cover letter {cover_letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI PDF: {str(e)}"
        )

@router.post("/generate-ai", response_model=APIResponse[Dict[str, Any]])
async def generate_cover_letter_with_ai(
    resume_id: int = Query(..., description="Resume ID to use for generating cover letter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a structured cover letter with AI based on resume data"""
    try:
        # Get resume data
        resume = db.query(Resume).filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id
        ).first()
        
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check and deduct AI credits using the service
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        # Generate structured cover letter with AI
        try:
            cover_letter_data = await ai_service.generate_structured_cover_letter(resume)
        except Exception as ai_error:
            # If AI generation fails completely, return a meaningful error
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service is temporarily unavailable: {str(ai_error)}. Please try again in a few moments."
            )
        
        # Save the generated cover letter to database
        cover_letter = CoverLetter(
            user_id=current_user.id,
            cover_letter_title=cover_letter_data.get("cover_letter_title", "New Cover Letter"),
            cover_letter_type=cover_letter_data.get("cover_letter_type", "general"),
            cover_template_category=cover_letter_data.get("cover_template_category", "professional"),
            profile=cover_letter_data.get("profile"),
            recipient=cover_letter_data.get("recipient"),
            introduction=cover_letter_data.get("introduction"),
            body=cover_letter_data.get("body"),
            closing=cover_letter_data.get("closing"),
            cover_style=cover_letter_data.get("cover_style", {"font": "Arial", "color": "#000000"})
        )
        
        db.add(cover_letter)
        db.commit()
        db.refresh(cover_letter)
        
        # Return the structured data without internal database fields
        return APIResponse(
            success=True,
            data={
                "cover_letter_title": cover_letter_data.get("cover_letter_title"),
                "cover_letter_type": cover_letter_data.get("cover_letter_type"),
                "cover_template_category": cover_letter_data.get("cover_template_category"),
                "profile": cover_letter_data.get("profile"),
                "recipient": cover_letter_data.get("recipient"),
                "introduction": cover_letter_data.get("introduction"),
                "body": cover_letter_data.get("body"),
                "closing": cover_letter_data.get("closing")
            },
            message="AI cover letter generated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating cover letter with AI: {str(e)}"
        )

@router.post("/{cover_letter_id}/ai-improve", response_model=Dict[str, Any])
async def improve_cover_letter_with_ai(
    cover_letter_id: int,
    section_name: str = Query(..., description="Section to improve: body, introduction, closing, profile, recipient"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Improve a section of a cover letter with AI"""
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    
    if not cover_letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cover letter not found"
        )
    
    # Get section content from the cover letter data
    section_content = None
    
    # Map section names to their actual locations in the cover letter data
    if section_name == "body":
        section_content = cover_letter.body
    elif section_name == "introduction":
        section_content = cover_letter.introduction
    elif section_name == "closing":
        section_content = cover_letter.closing
    elif section_name == "profile":
        section_content = cover_letter.profile
    elif section_name == "recipient":
        section_content = cover_letter.recipient
    elif section_name == "cover_letter_title":
        section_content = cover_letter.cover_letter_title
    elif section_name == "cover_letter_type":
        section_content = cover_letter.cover_letter_type
    elif section_name == "cover_template_category":
        section_content = cover_letter.cover_template_category
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid section name '{section_name}'. Valid sections: body, introduction, closing, profile, recipient, cover_letter_title, cover_letter_type, cover_template_category"
        )
    
    # Check if section content is completely missing (None)
    if section_content is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Section '{section_name}' not found"
        )
    
    # For empty strings or dicts, we'll provide context to AI to generate content
    is_empty_content = (
        (isinstance(section_content, str) and section_content.strip() == "") or
        (isinstance(section_content, dict) and len(section_content) == 0)
    )
    
    if is_empty_content:
        # For empty fields, provide context from other cover letter sections
        if section_name == "body":
            context_info = {
                "profile": cover_letter.profile if cover_letter.profile else {},
                "recipient": cover_letter.recipient if cover_letter.recipient else {},
                "introduction": cover_letter.introduction if cover_letter.introduction else {}
            }
            section_content = f"Empty body field. Please create professional cover letter body content based on this context: {context_info}"
        elif section_name == "introduction":
            context_info = {
                "profile": cover_letter.profile if cover_letter.profile else {},
                "recipient": cover_letter.recipient if cover_letter.recipient else {}
            }
            section_content = f"Empty introduction field. Please create professional cover letter introduction based on this context: {context_info}"
        elif section_name == "closing":
            context_info = {
                "profile": cover_letter.profile if cover_letter.profile else {},
                "recipient": cover_letter.recipient if cover_letter.recipient else {},
                "body": cover_letter.body if cover_letter.body else ""
            }
            section_content = f"Empty closing field. Please create professional cover letter closing based on this context: {context_info}"
        elif section_name == "profile":
            context_info = {
                "cover_letter_title": cover_letter.cover_letter_title if cover_letter.cover_letter_title else "",
                "recipient": cover_letter.recipient if cover_letter.recipient else {}
            }
            section_content = f"Empty profile field. Please create professional profile information based on this context: {context_info}"
        elif section_name == "recipient":
            context_info = {
                "cover_letter_title": cover_letter.cover_letter_title if cover_letter.cover_letter_title else "",
                "body": cover_letter.body if cover_letter.body else ""
            }
            section_content = f"Empty recipient field. Please create professional recipient information based on this context: {context_info}"
    
    try:
        # Check and deduct AI credits using the service
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        # Convert to string if it's a dict
        content_str = section_content
        if isinstance(section_content, dict):
            content_str = str(section_content)
        
        # Get full cover letter data for context
        cover_letter_data = {
            "cover_letter_title": cover_letter.cover_letter_title,
            "cover_letter_type": cover_letter.cover_letter_type,
            "cover_template_category": cover_letter.cover_template_category,
            "profile": cover_letter.profile,
            "recipient": cover_letter.recipient,
            "introduction": cover_letter.introduction,
            "body": cover_letter.body,
            "closing": cover_letter.closing
        }
        
        # Improve section with AI
        improved_content = await ai_service.improve_cover_letter_section(section_name, content_str, cover_letter_data)
        
        # Try to parse the improved content as JSON for structured response
        try:
            import json
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
                # Try to fix the JSON
                try:
                    fixed_json = ai_service._attempt_json_fix(cleaned_response)
                    if fixed_json != cleaned_response:
                        parsed_response = json.loads(fixed_json)
                        return parsed_response
                except Exception as fix_error:
                    print(f"JSON fix attempt failed: {str(fix_error)}")
                
                # If still not valid JSON, return the cleaned response in expected format
                return {
                    section_name: {
                        "original": content_str,
                        "improved": cleaned_response,
                        "note": f"AI response required manual cleaning. Original error: {str(e)}"
                    }
                }
        
        return parsed_response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error improving cover letter section: {str(e)}"
        )

@router.post("/ai-enhance", response_model=Dict[str, Any])
async def ai_enhance_cover_letter_content(
    request: CoverLetterAIEnhanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI-enhanced cover letter content based on profession and job description"""
    try:
        import json
        
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
            
            if section_lower == "introduction":
                prompt = f"""
                Create a compelling cover letter introduction for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Generate a professional introduction that:
                - Expresses genuine interest in the specific position
                - Briefly highlights relevant experience and skills
                - Shows enthusiasm and professionalism
                - Uses industry-specific keywords from the job description
                - Is engaging and makes the reader want to continue
                
                Return only the introduction text, no formatting, no markdown, no additional text.
                """
                introduction_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_introduction = introduction_response.strip()
                
                # Remove any markdown formatting
                if cleaned_introduction.startswith('```'):
                    lines = cleaned_introduction.split('\n')
                    cleaned_introduction = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_introduction
                
                # Remove any remaining unwanted characters
                cleaned_introduction = cleaned_introduction.strip().strip('"').strip("'")
                
                enhanced_content["introduction"] = cleaned_introduction
                
            elif section_lower == "body":
                prompt = f"""
                Create a compelling cover letter body for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Generate a professional body paragraph that:
                - Demonstrates specific relevant experience and achievements
                - Shows how your skills match the job requirements
                - Includes quantifiable accomplishments when possible
                - Uses strong action verbs and industry terminology
                - Connects your experience to the company's needs
                - Shows value you can bring to the organization
                
                Return only the body text, no formatting, no markdown, no additional text.
                """
                body_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_body = body_response.strip()
                
                # Remove any markdown formatting
                if cleaned_body.startswith('```'):
                    lines = cleaned_body.split('\n')
                    cleaned_body = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_body
                
                # Remove any remaining unwanted characters
                cleaned_body = cleaned_body.strip().strip('"').strip("'")
                
                enhanced_content["body"] = cleaned_body
                
            elif section_lower == "closing":
                prompt = f"""
                Create a professional cover letter closing for a {profession} based on this job description:
                
                Job Description: {job_description}
                
                Generate a strong closing paragraph that:
                - Reiterates interest in the position
                - Expresses eagerness to contribute to the organization
                - Includes a call to action for next steps
                - Shows appreciation for the reader's time
                - Ends on a confident and professional note
                
                Return only the closing text, no formatting, no markdown, no additional text.
                """
                closing_response = ai_service._generate_with_aws(prompt)
                
                # Clean the response to remove any markdown or formatting
                cleaned_closing = closing_response.strip()
                
                # Remove any markdown formatting
                if cleaned_closing.startswith('```'):
                    lines = cleaned_closing.split('\n')
                    cleaned_closing = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned_closing
                
                # Remove any remaining unwanted characters
                cleaned_closing = cleaned_closing.strip().strip('"').strip("'")
                
                enhanced_content["closing"] = cleaned_closing
            
            else:
                # For other sections, provide a generic enhancement
                prompt = f"""
                Generate professional {section} content for a {profession} cover letter based on this job description:
                
                Job Description: {job_description}
                
                Create relevant, professional {section} content that would be appropriate for this cover letter.
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
            detail=f"Error generating AI-enhanced cover letter content: {str(e)}"
        )
