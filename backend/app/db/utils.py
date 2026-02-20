"""
Database utilities for handling connection issues and retries
"""

import time
import logging
from typing import Callable, Any, Optional
from sqlalchemy.exc import OperationalError, DisconnectionError
from sqlalchemy.orm import Session
from functools import wraps

logger = logging.getLogger(__name__)

def db_retry(max_retries: int = 3, delay: float = 1.0):
    """
    Decorator to retry database operations on connection failures
    
    Args:
        max_retries: Maximum number of retry attempts
        delay: Delay between retries in seconds
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except (OperationalError, DisconnectionError) as e:
                    last_exception = e
                    if attempt < max_retries:
                        logger.warning(
                            f"Database connection failed (attempt {attempt + 1}/{max_retries + 1}): {str(e)}"
                        )
                        time.sleep(delay * (attempt + 1))  # Exponential backoff
                        
                        # Try to refresh the database session if it's passed as an argument
                        if 'db' in kwargs and hasattr(kwargs['db'], 'rollback'):
                            try:
                                kwargs['db'].rollback()
                            except Exception:
                                pass
                    else:
                        logger.error(f"Database connection failed after {max_retries + 1} attempts: {str(e)}")
                        raise last_exception
                except Exception as e:
                    # For non-connection errors, don't retry
                    raise e
            
            # This should never be reached, but just in case
            if last_exception:
                raise last_exception
                
        return wrapper
    return decorator

def safe_db_operation(db: Session, operation: Callable, *args, **kwargs) -> Any:
    """
    Safely execute a database operation with automatic retry on connection errors
    
    Args:
        db: Database session
        operation: Function to execute
        *args, **kwargs: Arguments to pass to the operation
    
    Returns:
        Result of the operation
    """
    max_retries = 3
    delay = 1.0
    
    for attempt in range(max_retries + 1):
        try:
            return operation(*args, **kwargs)
        except (OperationalError, DisconnectionError) as e:
            if attempt < max_retries:
                logger.warning(
                    f"Database operation failed (attempt {attempt + 1}/{max_retries + 1}): {str(e)}"
                )
                time.sleep(delay * (attempt + 1))
                try:
                    db.rollback()
                except Exception:
                    pass
            else:
                logger.error(f"Database operation failed after {max_retries + 1} attempts: {str(e)}")
                raise e
        except Exception as e:
            # For non-connection errors, don't retry
            raise e

def check_db_connection(db: Session) -> bool:
    """
    Check if database connection is healthy
    
    Args:
        db: Database session
        
    Returns:
        True if connection is healthy, False otherwise
    """
    try:
        # Simple query to test connection
        db.execute("SELECT 1")
        return True
    except Exception as e:
        logger.warning(f"Database connection check failed: {str(e)}")
        return False
