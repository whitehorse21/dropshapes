from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from app.services.task_management_service import TaskManagementService
from app.services.ai_credits_service import AICreditService
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskSimpleCreate,
    TaskQuickEntryRequest, DeadlineRecommendationRequest,
    CategorizationRequest, TaskSuggestionsRequest
)
from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

# Initialize task service with error handling
try:
    task_service = TaskManagementService()
    print("✅ TaskManagementService initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize TaskManagementService: {str(e)}")
    task_service = None

@router.get("/health")
async def task_service_health():
    """Check if the task management service is properly initialized"""
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
    return {"status": "healthy", "service": "task_management"}

@router.post("/", response_model=dict)
async def add_task(
    task_data: Optional[TaskCreate] = None,
    task: Optional[str] = Query(None, description="Simple task title (alternative to request body)"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a new task. Supports two input methods:
    1. Request body with TaskCreate schema for full task details
    2. Query parameter 'task' for simple task creation with just a title
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    if task_data:
        # Use the full task data from request body
        return task_service.add_task(task_data.dict(), current_user.id)
    elif task:
        # Use the simple task string from query parameter
        return task_service.add_task(task, current_user.id)
    else:
        raise HTTPException(status_code=400, detail="Either provide task data in request body or task title in query parameter")

@router.put("/{task_id}", response_model=dict)
async def update_task(
    task_id: int, 
    request_body: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing task. Supports multiple input formats:
    1. Direct task data: {"title": "...", "priority": "medium", ...}
    2. Nested task data: {"task": {"title": "...", "priority": "medium", ...}}
    3. Pydantic model validation for type safety
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
    
    print(f"Debug API - Raw request_body: {request_body}")
    
    # Handle different input formats
    task_data = None
    
    # Check if data is nested under "task" key
    if "task" in request_body and isinstance(request_body["task"], dict):
        print("Debug API - Using nested task format")
        task_data = request_body["task"]
    else:
        print("Debug API - Using direct task format")
        task_data = request_body
    
    print(f"Debug API - Extracted task_data: {task_data}")
    
    # Validate the extracted data using Pydantic
    try:
        # Create TaskUpdate object for validation
        validated_task = TaskUpdate(**task_data)
        print(f"Debug API - Validated task: {validated_task}")
        
        # Convert to dict and exclude None values
        update_dict = {k: v for k, v in validated_task.dict().items() if v is not None}
        print(f"Debug API - Final update_dict: {update_dict}")
        
        result = task_service.update_task(task_id, update_dict, current_user.id)
        
    except Exception as validation_error:
        print(f"Debug API - Validation error: {validation_error}")
        raise HTTPException(status_code=422, detail=f"Invalid task data: {str(validation_error)}")
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result

@router.put("/{task_id}/update-nested", response_model=dict)
async def update_task_nested_format(
    task_id: int,
    request_body: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing task with nested format specifically for frontend compatibility.
    Expects: {"task": {"title": "...", "priority": "medium", ...}}
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
    
    print(f"Debug Nested API - Raw request_body: {request_body}")
    
    # Extract task data from nested format
    if "task" not in request_body:
        raise HTTPException(status_code=400, detail="Request body must contain 'task' object")
    
    task_data = request_body["task"]
    print(f"Debug Nested API - Extracted task_data: {task_data}")
    
    # Validate the extracted data using Pydantic
    try:
        validated_task = TaskUpdate(**task_data)
        print(f"Debug Nested API - Validated task: {validated_task}")
        
        # Convert to dict and exclude None values
        update_dict = {k: v for k, v in validated_task.dict().items() if v is not None}
        print(f"Debug Nested API - Final update_dict: {update_dict}")
        
        result = task_service.update_task(task_id, update_dict, current_user.id)
        
    except Exception as validation_error:
        print(f"Debug Nested API - Validation error: {validation_error}")
        raise HTTPException(status_code=422, detail=f"Invalid task data: {str(validation_error)}")
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user)
):
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    result = task_service.delete_task(task_id, current_user.id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/")
async def list_tasks(
    current_user: User = Depends(get_current_active_user)
):
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    return task_service.list_tasks(current_user.id)

# AI-powered task management endpoints - specific routes must come before parameterized routes

@router.get("/prioritization-suggestions", response_model=dict)
async def get_task_prioritization_suggestions(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get AI-powered suggestions for task prioritization based on current task list.
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        result = task_service.suggest_task_prioritization(user_id=current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate prioritization suggestions: {str(e)}")

@router.get("/productivity-analysis", response_model=dict)
async def get_productivity_pattern_analysis(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get AI-powered analysis of productivity patterns and task completion trends.
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        result = task_service.analyze_productivity_patterns(current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze productivity patterns: {str(e)}")

@router.get("/{task_id}")
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user)
):
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    result = task_service.get_task_by_id(task_id, current_user.id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# AI-powered task management endpoints

@router.post("/quick-entry", response_model=dict)
async def create_task_with_ai_quick_entry(
    request: TaskQuickEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    AI-powered quick task entry that parses natural language input 
    and extracts task details like title, priority, due date, and category.
    
    Examples:
    - "Buy groceries tomorrow"
    - "Urgent: Finish project report by Friday"
    - "Schedule dentist appointment next week"
    - "Learn Python for 1 hour"
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        # Check and deduct AI credits (1 credit per AI quick entry)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        result = await task_service.quick_task_entry(request.task_input, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process quick task entry: {str(e)}")

@router.post("/deadline-recommendations", response_model=Dict[str, Any])
async def get_intelligent_deadline_recommendations(
    request: DeadlineRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get AI-powered deadline recommendations based on task complexity, 
    type, priority, and current workload.
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        # Check and deduct AI credits (1 credit per deadline recommendation)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        result = await task_service.intelligent_deadline_recommendations(
            request.task_title, request.task_description, 
            request.task_category, request.task_priority,
            current_user.id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate deadline recommendations: {str(e)}")

@router.post("/categorization-analysis", response_model=Dict[str, Any])
async def get_smart_task_categorization_and_tagging(
    request: CategorizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    AI-powered task categorization and intelligent tagging based on content analysis.
    Returns recommended categories, tags, task type, and other organizational metadata.
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        # Check and deduct AI credits (1 credit per categorization analysis)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        result = await task_service.smart_task_categorization_and_tagging(
            request.task_title, request.task_description,
            current_user.id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze task categorization: {str(e)}")

@router.post("/ai-suggestions", response_model=dict)
async def get_ai_task_suggestions(
    request: TaskSuggestionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate AI-powered task suggestions based on user context.
    Useful for productivity planning and goal achievement.
    """
    if task_service is None:
        raise HTTPException(status_code=503, detail="Task management service is not available")
        
    try:
        # Check and deduct AI credits (1 credit per AI task suggestions)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        result = task_service.generate_task_suggestions(request.user_context, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate task suggestions: {str(e)}")
