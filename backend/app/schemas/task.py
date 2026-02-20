from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    priority: TaskPriority = Field(TaskPriority.medium, description="Task priority level")
    status: TaskStatus = Field(TaskStatus.pending, description="Task status")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    category: str = Field("general", max_length=100, description="Task category")
    tags: Optional[List[str]] = Field([], description="Task tags for organization")

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    priority: Optional[TaskPriority] = Field(None, description="Task priority level")
    status: Optional[TaskStatus] = Field(None, description="Task status")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    category: Optional[str] = Field(None, max_length=100, description="Task category")
    tags: Optional[List[str]] = Field(None, description="Task tags for organization")

class TaskResponse(TaskBase):
    id: int = Field(..., description="Task ID")
    created_at: Optional[datetime] = Field(None, description="Task creation timestamp")
    ai_generated: Optional[bool] = Field(False, description="Whether task was created using AI")

    class Config:
        from_attributes = True

class TaskSimpleCreate(BaseModel):
    """Simple task creation for when only a title is provided"""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")

class TaskQuickEntryRequest(BaseModel):
    """Request model for AI quick task entry"""
    task_input: str = Field(..., min_length=1, max_length=500, description="Natural language task input")

class DeadlineRecommendationRequest(BaseModel):
    """Request model for deadline recommendations"""
    task_title: str = Field(..., min_length=1, max_length=255, description="Task title")
    task_description: Optional[str] = Field("", max_length=1000, description="Task description")
    task_category: str = Field("general", max_length=100, description="Task category")
    task_priority: TaskPriority = Field(TaskPriority.medium, description="Task priority")

class CategorizationRequest(BaseModel):
    """Request model for task categorization and tagging"""
    task_title: str = Field(..., min_length=1, max_length=255, description="Task title")
    task_description: Optional[str] = Field("", max_length=1000, description="Task description")

class TaskSuggestionsRequest(BaseModel):
    """Request model for AI task suggestions"""
    user_context: Optional[str] = Field("", max_length=1000, description="User context for task suggestions")
