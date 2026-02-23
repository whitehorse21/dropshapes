from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.drive import DriveItem
from app.schemas.drive import DriveItemCreate, DriveItemUpdate, DriveItemResponse, DriveImportRequest

router = APIRouter()


@router.get("/", response_model=List[DriveItemResponse])
def list_drive_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List current user's notes. Newest first."""
    items = (
        db.query(DriveItem)
        .filter(DriveItem.user_id == current_user.id)
        .order_by(DriveItem.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items


@router.get("/{item_id}", response_model=DriveItemResponse)
def get_drive_note(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single note by id."""
    item = (
        db.query(DriveItem)
        .filter(DriveItem.id == item_id, DriveItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    return item


@router.post("/", response_model=DriveItemResponse, status_code=status.HTTP_201_CREATED)
def create_drive_note(
    payload: DriveItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new note."""
    item = DriveItem(
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=DriveItemResponse)
def update_drive_note(
    item_id: int,
    payload: DriveItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a note (content)."""
    item = (
        db.query(DriveItem)
        .filter(DriveItem.id == item_id, DriveItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    if payload.content is not None:
        item.content = payload.content
    db.commit()
    db.refresh(item)
    return item


@router.post("/import", response_model=List[DriveItemResponse], status_code=status.HTTP_201_CREATED)
def import_drive_notes(
    payload: DriveImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Import multiple notes at once. Creates one note per non-empty content string."""
    created = []
    for content in payload.contents:
        text = (content or "").strip()
        if not text:
            continue
        item = DriveItem(user_id=current_user.id, content=text)
        db.add(item)
        db.flush()
        created.append(item)
    db.commit()
    for item in created:
        db.refresh(item)
    return created


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drive_note(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a note."""
    item = (
        db.query(DriveItem)
        .filter(DriveItem.id == item_id, DriveItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    db.delete(item)
    db.commit()
    return None
