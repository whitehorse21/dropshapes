from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.auth import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.course_unit import CourseUnit
from app.schemas.course_unit import CourseUnitCreate, CourseUnitUpdate, CourseUnitResponse
from app.schemas.pagination import PaginatedResponse

router = APIRouter()

@router.post("/", response_model=CourseUnitResponse)
async def create_course_unit(
    unit: CourseUnitCreate,
    db: Session = Depends(get_db)
):
    """Create a new course unit"""
    # Points validation is now handled by the Pydantic model
    db_unit = CourseUnit(**unit.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.get("/", response_model=PaginatedResponse[CourseUnitResponse])
async def list_course_units(
    skip: int = 0,
    limit: int = 100,
    module_id: Optional[int] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    sort_by: str = Query("module", enum=["module", "points", "title", "created_at"]),
    order: str = Query("asc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """List all course units with filtering and sorting"""
    query = db.query(CourseUnit)

    # Apply filters
    if module_id is not None:
        query = query.filter(CourseUnit.module == str(module_id))
    # Remove points comparison since points is now a string
    if min_points is not None or max_points is not None:
        pass  # Skip points comparison for now since points is text

    # Apply sorting
    sort_column = getattr(CourseUnit, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    units = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": units,
        "page": skip // limit + 1,
        "size": limit
    }

@router.get("/{unit_id}", response_model=CourseUnitResponse)
async def get_course_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific course unit by ID"""
    unit = db.query(CourseUnit).filter(CourseUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Course unit not found")
    return unit

@router.put("/{unit_id}", response_model=CourseUnitResponse)
async def update_course_unit(
    unit_id: int,
    unit: CourseUnitUpdate,
    db: Session = Depends(get_db)
):
    """Update a course unit"""
    db_unit = db.query(CourseUnit).filter(CourseUnit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Course unit not found")
    
    for key, value in unit.model_dump(exclude_unset=True).items():
        setattr(db_unit, key, value)
    
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    """Delete a course unit"""
    db_unit = db.query(CourseUnit).filter(CourseUnit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Course unit not found")
    
    db.delete(db_unit)
    db.commit()
    return None
