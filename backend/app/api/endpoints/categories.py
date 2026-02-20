from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.core.auth import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all categories"""
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.post("/", response_model=CategoryResponse)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new category (admin only)"""
    # Check if category with the same name already exists
    db_category = db.query(Category).filter(Category.name == category_in.name).first()
    if db_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    # Create new category
    db_category = Category(**category_in.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a category (admin only)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check name collision if updating name
    if category_in.name:
        name_exists = db.query(Category).filter(
            Category.name == category_in.name, 
            Category.id != category_id
        ).first()
        
        if name_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    # Update fields
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a category (admin only)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db.delete(db_category)
    db.commit()
    
    return None
