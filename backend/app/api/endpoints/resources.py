from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from app.schemas.pagination import PaginatedResponse
import re

router = APIRouter()

def validate_video_url(url: Optional[str]) -> bool:
    if not url:
        return True
    # Basic URL validation for common video platforms
    video_patterns = [
        r'^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'^https?://(?:www\.)?vimeo\.com/[\d]+',
        r'^https?://(?:www\.)?dailymotion\.com/video/[\w]+',
    ]
    return any(re.match(pattern, url) for pattern in video_patterns)

@router.post("/", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db)
):
    """Create a new resource"""
    if resource.videoUrl and not validate_video_url(resource.videoUrl):
        raise HTTPException(status_code=400, detail="Invalid video URL format")

    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/", response_model=PaginatedResponse[ResourceResponse])
async def list_resources(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all resources with optional filtering"""
    query = db.query(Resource)
    
    if type:
        query = query.filter(Resource.type == type)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Resource.title.ilike(search_filter)) |
            (Resource.description.ilike(search_filter))
        )
    
    total = query.count()
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    
    return PaginatedResponse(
        total=total,
        items=resources,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific resource by ID"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int,
    resource: ResourceUpdate,
    db: Session = Depends(get_db)
):
    """Update a resource"""
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    for key, value in resource.model_dump(exclude_unset=True).items():
        setattr(db_resource, key, value)
    
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Delete a resource"""
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(db_resource)
    db.commit()
    return None
