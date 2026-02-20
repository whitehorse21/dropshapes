from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging

from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with connection pooling and retry logic
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Additional connections beyond pool_size
    pool_pre_ping=True,  # Validate connections before use
    pool_recycle=3600,  # Recycle connections every hour
    echo=False  # Set to True for SQL debugging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Database dependency with better error handling
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
