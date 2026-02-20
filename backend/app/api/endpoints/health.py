from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.db.session import get_db
from app.core.auth import get_current_admin_user
from app.db.utils import check_db_connection

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Check API health status"""
    try:
        # Test database connection using our utility function
        db_healthy = check_db_connection(db)
        db_status = "healthy" if db_healthy else "unhealthy"
    except Exception as e:
        logger.error(f"Health check database error: {str(e)}")
        db_status = "unhealthy"
    
    return {
        "status": "up",
        "timestamp": datetime.utcnow(),
        "database": db_status
    }

@router.get("/health/")
def health_check_with_slash(db: Session = Depends(get_db)):
    """Check API health status - alternate endpoint with trailing slash"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    return {
        "status": "up",
        "timestamp": datetime.utcnow(),
        "database": db_status
    }

@router.get("/health/detail")
def detailed_health_check(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """Check detailed API health status (admin only)"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = {"status": "healthy", "message": "Database connection successful"}
    except Exception as e:
        db_status = {"status": "unhealthy", "message": str(e)}
    
    # Test AI service
    try:
        from app.services.ai_service import ai_service
        if ai_service.aws_ai_service and ai_service.aws_ai_service.bedrock_client:
            available_models = ai_service.aws_ai_service.get_available_models()
            ai_status = {
                "status": "healthy" if available_models else "degraded",
                "available_models": available_models,
                "message": f"Found {len(available_models)} available models" if available_models else "No models available"
            }
        else:
            ai_status = {"status": "unhealthy", "message": "AWS AI service not initialized", "available_models": []}
    except Exception as e:
        ai_status = {"status": "unhealthy", "message": str(e), "available_models": []}
    
    # Get memory usage
    try:
        import psutil
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        system_status = {
            "memory_used_percent": memory.percent,
            "disk_used_percent": disk.percent
        }
    except Exception as e:
        system_status = {"error": str(e)}
    
    return {
        "status": "up",
        "timestamp": datetime.utcnow(),
        "database": db_status,
        "ai_service": ai_status,
        "system": system_status
    }

@router.get("/health/ai")
def ai_health_check():
    """Check AI service health status"""
    try:
        from app.services.ai_service import ai_service
        
        if not ai_service.aws_ai_service:
            return {
                "status": "unhealthy",
                "message": "AWS AI service not initialized",
                "available_models": [],
                "timestamp": datetime.utcnow()
            }
        
        available_models = ai_service.aws_ai_service.get_available_models()
        
        # Test with a simple prompt
        try:
            test_response = ai_service._generate_with_aws("Hello, this is a test.")
            test_successful = not any(phrase in test_response.lower() for phrase in [
                "temporarily unavailable", "contact support", "configuration error"
            ])
        except:
            test_successful = False
        
        return {
            "status": "healthy" if available_models and test_successful else "degraded",
            "message": f"Found {len(available_models)} available models" if available_models else "No models available",
            "available_models": available_models,
            "test_successful": test_successful,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": str(e),
            "available_models": [],
            "test_successful": False,
            "timestamp": datetime.utcnow()
        }
