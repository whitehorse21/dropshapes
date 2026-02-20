from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.core.auth import (
    verify_password, 
    get_password_hash,
    create_access_token, 
    get_current_active_user
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.services.ai_credits_service import AICreditService
from app.db.utils import db_retry

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if the user already exists
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        name=user_in.name,
        password=hashed_password,
        agree_to_terms=user_in.agree_to_terms,
        ai_credits=settings.TRIAL_AI_CREDITS  # Give trial AI credits to new users
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Create access token
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=60*24*7)  # 7 days
    )
    
    # Convert user object to dict for response
    user_dict = {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "name": db_user.name,
        "is_admin": db_user.is_admin,
        "profile_image": db_user.profile_image,
        "ai_credits": db_user.ai_credits,
        "created_at": db_user.created_at,
        "updated_at": db_user.updated_at
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/login", response_model=Token)
@db_retry(max_retries=3, delay=1.0)
def login_json(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user with JSON and return access token"""
    try:
        # JSON login
        email = user_data.email
        password = user_data.password
        
        # Find user by email with retry logic
        user = db.query(User).filter(User.email == email).first()
        
        # Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check password
        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=60*24*7)  # 7 days
        )
        
        # Convert user object to dict for response
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "is_admin": user.is_admin,
            "profile_image": user.profile_image,
            "ai_credits": user.ai_credits,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_dict
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log unexpected errors and return generic error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.post("/login-form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user with form data and return access token"""
    # Form login (OAuth2)
    email = form_data.username  # In OAuth2 form, email is sent as username
    password = form_data.password
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60*24*7)  # 7 days
    )
    
    # Convert user object to dict for response
    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "is_admin": user.is_admin,
        "profile_image": user.profile_image,
        "ai_credits": user.ai_credits,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user - client should discard the token"""
    return {
        "message": "Successfully logged out",
        "detail": "Please discard your authentication token"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.get("/credits")
def get_user_credits(current_user: User = Depends(get_current_active_user)):
    """Get current user's AI credit balance and summary"""
    return AICreditService.get_credit_summary(current_user)

@router.post("/credits/add")
def add_credits(
    credits: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add credits to current user (admin only for now, can be extended for purchases)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add credits"
        )
    
    new_balance = AICreditService.add_credits(db, current_user, credits)
    return {
        "message": f"Added {credits} credits successfully",
        "new_balance": new_balance
    }

@router.post("/credits/give-trial")
def give_trial_credits_to_user(
    user_email: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Give trial credits to a specific user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can give trial credits"
        )
    
    # Find the user by email
    target_user = db.query(User).filter(User.email == user_email).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Give trial credits
    new_balance = AICreditService.add_credits(db, target_user, settings.TRIAL_AI_CREDITS)
    return {
        "message": f"Gave {settings.TRIAL_AI_CREDITS} trial credits to {user_email}",
        "new_balance": new_balance
    }

@router.post("/credits/give-trial-all")
def give_trial_credits_to_all_zero_credit_users(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Give trial credits to all users who currently have 0 credits (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    
    # Find all users with 0 AI credits
    users_with_no_credits = db.query(User).filter(User.ai_credits == 0).all()
    
    updated_count = 0
    for user in users_with_no_credits:
        user.ai_credits = settings.TRIAL_AI_CREDITS
        updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Gave {settings.TRIAL_AI_CREDITS} trial credits to {updated_count} users",
        "users_updated": updated_count,
        "credits_given": settings.TRIAL_AI_CREDITS
    }


