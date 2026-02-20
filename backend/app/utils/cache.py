import json
import hashlib
import logging
from typing import Any, Optional, Union, Dict, List
from functools import wraps
import redis
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache service for Dropshapes application"""
    
    def __init__(self):
        self.redis_client = None
        self.enabled = settings.CACHE_ENABLED
        
        if self.enabled:
            try:
                self.redis_client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    db=settings.REDIS_DB,
                    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                    ssl=settings.REDIS_USE_SSL,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache connected successfully")
            except Exception as e:
                logger.warning(f"Redis cache connection failed: {e}. Caching will be disabled.")
                self.enabled = False
                self.redis_client = None
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from prefix and arguments"""
        # Create a string representation of args and kwargs
        key_parts = [prefix]
        
        if args:
            key_parts.extend([str(arg) for arg in args])
        
        if kwargs:
            # Sort kwargs for consistent key generation
            sorted_kwargs = sorted(kwargs.items())
            key_parts.extend([f"{k}:{v}" for k, v in sorted_kwargs])
        
        key_string = ":".join(key_parts)
        
        # Hash the key if it's too long (Redis key length limit)
        if len(key_string) > 250:
            return f"{prefix}:{hashlib.md5(key_string.encode()).hexdigest()}"
        
        return key_string
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            ttl = ttl or settings.CACHE_DEFAULT_TTL
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.enabled or not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error deleting cache pattern {pattern}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    def ttl(self, key: str) -> int:
        """Get TTL for a key"""
        if not self.enabled or not self.redis_client:
            return -1
        
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL for key {key}: {e}")
            return -1
    
    def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter in cache"""
        if not self.enabled or not self.redis_client:
            return 0
        
        try:
            return self.redis_client.incr(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing cache key {key}: {e}")
            return 0
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for a key"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Error setting expiration for key {key}: {e}")
            return False

# Global cache instance
cache = RedisCache()

# Cache decorators
def cached(prefix: str, ttl: Optional[int] = None, key_func=None):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if not cache.enabled:
                return await func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = cache._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for key: {cache_key}, stored result")
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if not cache.enabled:
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = cache._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for key: {cache_key}, stored result")
            
            return result
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Specific cache functions for different use cases
class CacheKeys:
    """Cache key constants"""
    USER_PROFILE = "user:profile"
    USER_SUBSCRIPTION = "user:subscription"
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    AI_RESPONSE = "ai:response"
    GRAMMAR_CHECK = "grammar:check"
    PDF_ANALYSIS = "pdf:analysis"
    TTS_AUDIO = "tts:audio"
    DISCUSSION = "discussion"
    RESOURCE = "resource"
    MODULE = "module"
    UNIT = "unit"

def cache_user_profile(user_id: int, ttl: Optional[int] = None):
    """Cache user profile data"""
    return cached(
        prefix=CacheKeys.USER_PROFILE,
        ttl=ttl or settings.CACHE_USER_DATA_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.USER_PROFILE}:{user_id}"
    )

def cache_resume(resume_id: int, ttl: Optional[int] = None):
    """Cache resume data"""
    return cached(
        prefix=CacheKeys.RESUME,
        ttl=ttl or settings.CACHE_RESUME_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.RESUME}:{resume_id}"
    )

def cache_cover_letter(cover_letter_id: int, ttl: Optional[int] = None):
    """Cache cover letter data"""
    return cached(
        prefix=CacheKeys.COVER_LETTER,
        ttl=ttl or settings.CACHE_COVER_LETTER_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.COVER_LETTER}:{cover_letter_id}"
    )

def cache_ai_response(prompt_hash: str, ttl: Optional[int] = None):
    """Cache AI responses"""
    return cached(
        prefix=CacheKeys.AI_RESPONSE,
        ttl=ttl or settings.CACHE_AI_RESPONSES_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.AI_RESPONSE}:{prompt_hash}"
    )

def cache_grammar_check(text_hash: str, ttl: Optional[int] = None):
    """Cache grammar check results"""
    return cached(
        prefix=CacheKeys.GRAMMAR_CHECK,
        ttl=ttl or settings.CACHE_DEFAULT_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.GRAMMAR_CHECK}:{text_hash}"
    )

def cache_pdf_analysis(file_hash: str, ttl: Optional[int] = None):
    """Cache PDF analysis results"""
    return cached(
        prefix=CacheKeys.PDF_ANALYSIS,
        ttl=ttl or settings.CACHE_DEFAULT_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.PDF_ANALYSIS}:{file_hash}"
    )

def cache_tts_audio(text_hash: str, voice_id: str, ttl: Optional[int] = None):
    """Cache TTS audio data"""
    return cached(
        prefix=CacheKeys.TTS_AUDIO,
        ttl=ttl or settings.CACHE_DEFAULT_TTL,
        key_func=lambda *args, **kwargs: f"{CacheKeys.TTS_AUDIO}:{text_hash}:{voice_id}"
    )

# Utility functions for cache management
def clear_user_cache(user_id: int):
    """Clear all cache entries for a specific user"""
    patterns = [
        f"{CacheKeys.USER_PROFILE}:{user_id}",
        f"{CacheKeys.USER_SUBSCRIPTION}:{user_id}",
        f"{CacheKeys.RESUME}:*:user:{user_id}",
        f"{CacheKeys.COVER_LETTER}:*:user:{user_id}"
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache.delete_pattern(pattern)
    
    logger.info(f"Cleared {total_deleted} cache entries for user {user_id}")
    return total_deleted

def clear_resume_cache(resume_id: int):
    """Clear cache for a specific resume"""
    patterns = [
        f"{CacheKeys.RESUME}:{resume_id}",
        f"{CacheKeys.RESUME}:{resume_id}:*"
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache.delete_pattern(pattern)
    
    logger.info(f"Cleared {total_deleted} cache entries for resume {resume_id}")
    return total_deleted

def clear_cover_letter_cache(cover_letter_id: int):
    """Clear cache for a specific cover letter"""
    patterns = [
        f"{CacheKeys.COVER_LETTER}:{cover_letter_id}",
        f"{CacheKeys.COVER_LETTER}:{cover_letter_id}:*"
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache.delete_pattern(pattern)
    
    logger.info(f"Cleared {total_deleted} cache entries for cover letter {cover_letter_id}")
    return total_deleted

def clear_ai_cache():
    """Clear all AI-related cache"""
    patterns = [
        f"{CacheKeys.AI_RESPONSE}:*",
        f"{CacheKeys.GRAMMAR_CHECK}:*",
        f"{CacheKeys.PDF_ANALYSIS}:*",
        f"{CacheKeys.TTS_AUDIO}:*"
    ]
    
    total_deleted = 0
    for pattern in patterns:
        total_deleted += cache.delete_pattern(pattern)
    
    logger.info(f"Cleared {total_deleted} AI cache entries")
    return total_deleted

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    if not cache.enabled or not cache.redis_client:
        return {"enabled": False, "connected": False}
    
    try:
        info = cache.redis_client.info()
        return {
            "enabled": True,
            "connected": True,
            "used_memory": info.get("used_memory_human", "N/A"),
            "connected_clients": info.get("connected_clients", 0),
            "total_commands_processed": info.get("total_commands_processed", 0),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "uptime_in_seconds": info.get("uptime_in_seconds", 0)
        }
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return {"enabled": True, "connected": False, "error": str(e)} 