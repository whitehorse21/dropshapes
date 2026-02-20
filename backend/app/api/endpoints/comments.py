from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.comment import Comment
from app.models.discussion import Discussion
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.schemas.pagination import PaginatedResponse

router = APIRouter()

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db)
):
    """Create a new comment"""    # Validate discussion exists
    discussion = db.query(Discussion).filter(Discussion.id == comment.discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    db_comment = Comment(
        name=comment.name,
        comment=comment.comment,
        discussion_id=comment.discussion_id,
        date_time=datetime.utcnow()
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/discussion/{discussion_id}", response_model=PaginatedResponse[CommentResponse])
async def list_comments_by_discussion(
    discussion_id: int,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = Query("date_time", enum=["date_time", "name"]),
    order: str = Query("asc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """List all comments for a specific discussion with pagination and sorting"""
    # Validate discussion exists
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
        
    query = db.query(Comment).filter(Comment.discussion_id == discussion_id)

    # Apply sorting
    sort_column = getattr(Comment, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    comments = query.offset(skip).limit(limit).all()

    return PaginatedResponse(
        total=total,
        items=comments,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/", response_model=PaginatedResponse[CommentResponse])
async def list_comments(
    skip: int = 0,
    limit: int = 20,
    sort_by: str = Query("date_time", enum=["date_time", "name"]),
    order: str = Query("asc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """List all comments with pagination and sorting"""
    query = db.query(Comment)

    # Apply sorting
    sort_column = getattr(Comment, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    comments = query.offset(skip).limit(limit).all()
    
    return PaginatedResponse(
        total=total,
        items=comments,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific comment by ID"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment: CommentUpdate,
    db: Session = Depends(get_db)
):
    """Update a comment"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    for key, value in comment.model_dump(exclude_unset=True).items():
        setattr(db_comment, key, value)
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(db_comment)
    db.commit()
    return None
