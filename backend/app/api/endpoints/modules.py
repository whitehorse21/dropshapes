from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.auth import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse

router = APIRouter()

@router.post("/", response_model=ModuleResponse)
async def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new module"""
    db_module = Module(**module.model_dump())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.get("/", response_model=List[ModuleResponse])
async def list_modules(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all modules ordered by their order field"""
    modules = db.query(Module).order_by(Module.order.asc()).offset(skip).limit(limit).all()
    return modules

@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific module by ID"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: int,
    module: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a module"""
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    for key, value in module.model_dump(exclude_unset=True).items():
        setattr(db_module, key, value)
    
    db.commit()
    db.refresh(db_module)
    return db_module

@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a module"""
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db.delete(db_module)
    db.commit()
    return None
