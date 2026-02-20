from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse
from app.core.auth import get_current_admin_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ContactResponse)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db)
):
    """Submit a contact form"""
    db_contact = Contact(**contact_in.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact

@router.get("/", response_model=List[ContactResponse])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all contact submissions (admin only)"""
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts

@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific contact submission (admin only)"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a contact submission (admin only)"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    db.delete(contact)
    db.commit()
    
    return None
