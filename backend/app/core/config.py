import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra fields from .env file
    )
    
    PROJECT_NAME: str = "Dropshipping API"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    USE_SQLITE: bool = False
    
    # PostgreSQL Configuration (AWS RDS) - Read from .env
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT settings - Read from .env
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    # CORS
    CORS_ORIGINS: List[str] = [
        "https://dropshapes.com",
        "https://www.dropshapes.com", 
        "https://api.dropshapes.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # AWS S3 Configuration - Read from .env
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_S3_BUCKET_NAME: str = "dropshapesbucket"
    AWS_S3_REGION: str = "us-east-2"
    
    # AWS AI Services Configuration - Read from .env
    AWS_BEDROCK_REGION: str = "us-east-2"
    AWS_BEDROCK_MODEL_ID: str = "us.amazon.nova-lite-v1:0"  # Using Nova Lite inference profile (confirmed working)
    AWS_POLLY_VOICE_ID: str = "Joanna"
    AWS_POLLY_LANGUAGE_CODE: str = "en-US"
    AWS_COMPREHEND_REGION: str = "us-east-2"
    AWS_TRANSCRIBE_REGION: str = "us-east-2"
    
    # AWS AI Service Configuration - Read from .env
    USE_AWS_AI: bool = True
    AI_PROVIDER: str = "aws"
    
    # Storage Configuration - Read from .env
    USE_S3_STORAGE: bool = True
    
    # AWS Bedrock Token - Read from .env
    AWS_BEARER_TOKEN_BEDROCK: str
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    REDIS_USE_SSL: bool = False
    
    # Cache Configuration
    CACHE_ENABLED: bool = True
    CACHE_DEFAULT_TTL: int = 3600  # 1 hour
    CACHE_AI_RESPONSES_TTL: int = 7200  # 2 hours
    CACHE_USER_DATA_TTL: int = 1800  # 30 minutes
    CACHE_RESUME_TTL: int = 3600  # 1 hour
    CACHE_COVER_LETTER_TTL: int = 3600  # 1 hour
    
    # Email Configuration - Read from .env
    EMAIL_USER: str
    EMAIL_PASSWORD: str
    EMAIL_FROM: str = "noreply@dropshapes.com"
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USE_TLS: bool = True
    
    # Stripe Configuration - Read from .env
    STRIPE_API_KEY: str
    STRIPE_PUBLISHABLE_KEY: str = ""  # Optional for frontend integration
    STRIPE_WEBHOOK_SECRET: str
    
    # Trial Configuration
    TRIAL_AI_CREDITS: int = 10  # Number of free AI credits for new users
    TRIAL_RESUME_LIMIT: int = 3  # Number of free resumes for new users
    TRIAL_COVER_LETTER_LIMIT: int = 3  # Number of free cover letters for new users

settings = Settings()
