from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging
import traceback

logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.db.session import get_db
from app.models.discussion import Discussion
from app.models.comment import Comment
from app.schemas.discussion import DiscussionCreate, DiscussionUpdate, DiscussionResponse, DiscussionDetailResponse

router = APIRouter()

@router.post("/", response_model=DiscussionResponse)
async def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db)
):
    """Create a new discussion"""
    try:
        db_discussion = Discussion(
            title=discussion.title,
            content=discussion.content,
            author_name=discussion.author_name,
            date=func.now()
        )
        db.add(db_discussion)
        db.commit()
        db.refresh(db_discussion)
        return db_discussion
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating discussion: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create discussion: {str(e)}"
        )

@router.get("/", response_model=List[DiscussionDetailResponse])
async def list_discussions(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", enum=["created_at", "title", "comments"]),
    order: str = Query("desc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    """List all discussions with optional filtering and sorting"""
    # Start with a base query
    query = db.query(Discussion)
    
    # Add search filter if provided
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Discussion.title.ilike(search_filter)) |
            (Discussion.content.ilike(search_filter))
        )
    
    # Add comment count as a subquery
    if sort_by == "comments":
        comment_count = db.query(
            Comment.title,
            func.count(Comment.id).label('comment_count')
        ).group_by(Comment.title).subquery()
        
        query = query.outerjoin(comment_count, Discussion.id == comment_count.c.title)
    
    # Apply sorting
    if sort_by == "comments":
        order_column = comment_count.c.comment_count
    else:
        order_column = getattr(Discussion, sort_by)
    
    if order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    discussions = query.offset(skip).limit(limit).all()
      # Get comment counts for all discussions
    discussion_ids = [d.id for d in discussions]
    comment_counts = dict(
        db.query(
            Comment.discussion_id,
            func.count(Comment.id).label('count')
        ).filter(Comment.discussion_id.in_(discussion_ids))
        .group_by(Comment.discussion_id)
        .all()
    )
    
    # Prepare response
    result = []
    for d in discussions:
        discussion_data = {
            "id": d.id,
            "title": d.title,
            "content": d.content,
            "author_name": d.author_name,
            "date": d.date,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
            "comment_count": comment_counts.get(d.id, 0)
        }
        result.append(discussion_data)
    
    return result

@router.get("/{discussion_id}", response_model=DiscussionDetailResponse)
async def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific discussion by ID"""    
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    # Get comment count
    comment_count = db.query(func.count(Comment.id)).filter(Comment.discussion_id == discussion_id).scalar()
    
    return {
        "id": discussion.id,
        "title": discussion.title,
        "content": discussion.content,
        "author_name": discussion.author_name,
        "date": discussion.date,
        "created_at": discussion.created_at,
        "updated_at": discussion.updated_at,
        "comment_count": comment_count or 0
    }

@router.put("/{discussion_id}", response_model=DiscussionResponse)
async def update_discussion(
    discussion_id: int,
    discussion: DiscussionUpdate,
    db: Session = Depends(get_db)
):
    """Update a discussion"""
    db_discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not db_discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    for key, value in discussion.model_dump(exclude_unset=True).items():
        setattr(db_discussion, key, value)
    
    db.commit()
    db.refresh(db_discussion)
    return db_discussion

@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Delete a discussion"""
    db_discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not db_discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    db.delete(db_discussion)
    db.commit()
    return None
