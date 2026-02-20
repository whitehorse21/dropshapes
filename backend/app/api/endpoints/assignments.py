from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.assignment import Assignment, AssignmentStatus
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.schemas.pagination import PaginatedResponse
from app.models.course_unit import CourseUnit

router = APIRouter()

def check_and_update_status(assignment: Assignment) -> None:
    """Check and update assignment status based on due date"""
    if assignment.status != AssignmentStatus.COMPLETED:
        now = datetime.now(timezone.utc)
        if assignment.due_date < now:
            assignment.status = AssignmentStatus.OVERDUE

@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new assignment"""
    # Validate due date is in the future
    if assignment.due_date <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Due date must be in the future")

    db_assignment = Assignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.get("/", response_model=PaginatedResponse[AssignmentResponse])
async def list_assignments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AssignmentStatus] = None,
    due_before: Optional[datetime] = None,
    due_after: Optional[datetime] = None,
    sort_by: str = Query("due_date", enum=["due_date", "created_at", "title"]),
    order: str = Query("asc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """List all assignments with filtering and sorting"""
    query = db.query(Assignment)

    # Apply filters
    if status:
        query = query.filter(Assignment.status == status)
    if due_before:
        query = query.filter(Assignment.due_date <= due_before)
    if due_after:
        query = query.filter(Assignment.due_date >= due_after)

    # Apply sorting
    sort_column = getattr(Assignment, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    assignments = query.offset(skip).limit(limit).all()

    # Update overdue status
    for assignment in assignments:
        check_and_update_status(assignment)
    if [a for a in assignments if a.status == AssignmentStatus.OVERDUE]:
        db.commit()

    return {
        "total": total,
        "items": assignments,
        "page": skip // limit + 1,
        "size": limit
    }

@router.get("/unit/{unit_id}", response_model=List[AssignmentResponse])
async def list_assignments_by_unit(
    unit_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all assignments for a specific unit"""
    assignments = db.query(Assignment).filter(Assignment.unit == unit_id).offset(skip).limit(limit).all()
    return assignments

@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific assignment by ID"""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: int,
    assignment: AssignmentUpdate,
    db: Session = Depends(get_db)
):
    """Update an assignment"""
    db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    for key, value in assignment.model_dump(exclude_unset=True).items():
        setattr(db_assignment, key, value)
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    """Delete an assignment"""
    db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(db_assignment)
    db.commit()
    return None
