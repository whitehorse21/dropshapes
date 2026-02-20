from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.utils.cache import (
    cache, 
    clear_user_cache, 
    clear_resume_cache, 
    clear_cover_letter_cache, 
    clear_ai_cache,
    get_cache_stats,
    CacheKeys
)

router = APIRouter()

@router.get("/stats")
async def get_cache_statistics(
    current_user: User = Depends(get_current_active_user)
):
    """Get cache statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access cache statistics"
        )
    
    stats = get_cache_stats()
    return {
        "success": True,
        "data": stats
    }

@router.delete("/user/{user_id}")
async def clear_user_cache_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear cache for a specific user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can clear user cache"
        )
    
    deleted_count = clear_user_cache(user_id)
    return {
        "success": True,
        "message": f"Cleared {deleted_count} cache entries for user {user_id}",
        "deleted_count": deleted_count
    }

@router.delete("/resume/{resume_id}")
async def clear_resume_cache_endpoint(
    resume_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Clear cache for a specific resume"""
    # Users can only clear cache for their own resumes
    # This would need to be implemented based on your resume ownership logic
    deleted_count = clear_resume_cache(resume_id)
    return {
        "success": True,
        "message": f"Cleared {deleted_count} cache entries for resume {resume_id}",
        "deleted_count": deleted_count
    }

@router.delete("/cover-letter/{cover_letter_id}")
async def clear_cover_letter_cache_endpoint(
    cover_letter_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Clear cache for a specific cover letter"""
    # Users can only clear cache for their own cover letters
    # This would need to be implemented based on your cover letter ownership logic
    deleted_count = clear_cover_letter_cache(cover_letter_id)
    return {
        "success": True,
        "message": f"Cleared {deleted_count} cache entries for cover letter {cover_letter_id}",
        "deleted_count": deleted_count
    }

@router.delete("/ai")
async def clear_ai_cache_endpoint(
    current_user: User = Depends(get_current_active_user)
):
    """Clear all AI-related cache (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can clear AI cache"
        )
    
    deleted_count = clear_ai_cache()
    return {
        "success": True,
        "message": f"Cleared {deleted_count} AI cache entries",
        "deleted_count": deleted_count
    }

@router.delete("/all")
async def clear_all_cache_endpoint(
    current_user: User = Depends(get_current_active_user)
):
    """Clear all cache (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can clear all cache"
        )
    
    if not cache.enabled or not cache.redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache is not available"
        )
    
    try:
        # Flush all databases
        cache.redis_client.flushall()
        return {
            "success": True,
            "message": "All cache cleared successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )

@router.get("/key/{key}")
async def get_cache_key(
    key: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get value for a specific cache key (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access cache keys"
        )
    
    if not cache.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache is not available"
        )
    
    value = cache.get(key)
    if value is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cache key not found"
        )
    
    ttl = cache.ttl(key)
    return {
        "success": True,
        "data": {
            "key": key,
            "value": value,
            "ttl": ttl,
            "exists": True
        }
    }

@router.delete("/key/{key}")
async def delete_cache_key(
    key: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific cache key (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete cache keys"
        )
    
    deleted = cache.delete(key)
    return {
        "success": True,
        "message": f"Cache key '{key}' {'deleted' if deleted else 'not found'}",
        "deleted": deleted
    }

@router.get("/keys")
async def list_cache_keys(
    pattern: str = "*",
    current_user: User = Depends(get_current_active_user)
):
    """List cache keys matching a pattern (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can list cache keys"
        )
    
    if not cache.enabled or not cache.redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache is not available"
        )
    
    try:
        keys = cache.redis_client.keys(pattern)
        # Limit to first 100 keys to avoid overwhelming response
        keys = keys[:100]
        
        key_info = []
        for key in keys:
            ttl = cache.ttl(key)
            key_info.append({
                "key": key,
                "ttl": ttl,
                "exists": ttl > 0
            })
        
        return {
            "success": True,
            "data": {
                "pattern": pattern,
                "total_keys": len(keys),
                "keys": key_info
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list cache keys: {str(e)}"
        ) 