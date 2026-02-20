from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.signature import Signature
from app.schemas.signature import SignatureCreate, SignatureUpdate, SignatureResponse
from app.utils.storage import get_storage

router = APIRouter()
storage = get_storage()

@router.get("/", response_model=List[SignatureResponse])
async def get_my_signatures(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all user's signatures"""
    signatures = db.query(Signature).filter(Signature.user_id == current_user.id).offset(skip).limit(limit).all()
    return signatures

@router.get("/{signature_id}", response_model=SignatureResponse)
async def get_signature(
    signature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific signature by ID"""
    signature = db.query(Signature).filter(
        Signature.id == signature_id,
        Signature.user_id == current_user.id
    ).first()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    return signature

@router.post("/", response_model=SignatureResponse)
async def create_signature(
    name: str = Form(...),
    signature_file: Optional[UploadFile] = File(None),
    signature_data: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new signature"""
    if not signature_file and not signature_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either signature file or signature data must be provided"
        )
    
    # If file is provided, upload it and get the URL
    if signature_file:
        # Validate file type
        content_type = signature_file.content_type
        if not content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Upload to storage
        try:
            signature_data = await storage.upload_file(signature_file, folder="signatures")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading file: {str(e)}"
            )
    
    # Create signature
    db_signature = Signature(
        name=name,
        signature_data=signature_data,
        user_id=current_user.id
    )
    
    db.add(db_signature)
    db.commit()
    db.refresh(db_signature)
    
    return db_signature

@router.put("/{signature_id}", response_model=SignatureResponse)
async def update_signature(
    signature_id: int,
    name: Optional[str] = Form(None),
    signature_file: Optional[UploadFile] = File(None),
    signature_data: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing signature"""
    signature = db.query(Signature).filter(
        Signature.id == signature_id,
        Signature.user_id == current_user.id
    ).first()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    # Update name if provided
    if name:
        signature.name = name
    
    # Update signature data if provided
    if signature_file or signature_data:
        if signature_file:
            # Validate file type
            content_type = signature_file.content_type
            if not content_type.startswith("image/"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File must be an image"
                )
            
            # Upload to storage
            try:
                new_signature_data = await storage.upload_file(signature_file, folder="signatures")
                signature.signature_data = new_signature_data
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error uploading file: {str(e)}"
                )
        elif signature_data:
            signature.signature_data = signature_data
    
    db.commit()
    db.refresh(signature)
    
    return signature

@router.delete("/{signature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_signature(
    signature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a signature"""
    signature = db.query(Signature).filter(
        Signature.id == signature_id,
        Signature.user_id == current_user.id
    ).first()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    db.delete(signature)
    db.commit()
    
    return None
