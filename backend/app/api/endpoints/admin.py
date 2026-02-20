from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Optional

from app.db.session import get_db
from app.core.auth import get_current_admin_user
from app.models.user import User
from app.schemas.admin import AdminDashboardStats, Overview, AIPerformance, UserStats, Subscriptions, RecentActivity, UserSummary, Revenue, FeatureUsageStats, ResumeBuilderUsage, CoverLetterBuilderUsage, AIServicesUsage, AdminUserInfo
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/admin/dashboard/stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard statistics"""
    
    # Get user statistics
    user_stats_data = AdminService.get_user_statistics(db)
    
    # Get AI request statistics
    ai_request_stats = AdminService.get_ai_request_statistics(db)
    
    # Get revenue statistics
    revenue_stats = AdminService.get_revenue_statistics(db)
    
    # Create overview
    overview = Overview(
        total_users=user_stats_data["total_users"],
        active_users=user_stats_data["active_users"],
        new_users_today=user_stats_data["new_users_today"],
        ai_requests_today=ai_request_stats["ai_requests_today"],
        total_ai_requests=ai_request_stats["total_ai_requests"],
        revenue=Revenue(
            total=revenue_stats["total"],
            monthly=revenue_stats["monthly"]
        )
    )
    
    # Get AI performance metrics
    ai_performance_data = AdminService.get_ai_performance_metrics()
    ai_performance = AIPerformance(
        average_response_time=ai_performance_data["average_response_time"],
        uptime=ai_performance_data["uptime"],
        failed_requests_today=ai_performance_data["failed_requests_today"]
    )
    
    # Get top active users
    top_users_data = AdminService.get_top_active_users(db, limit=3)
    top_active_users = [
        UserSummary(id=user_id, name=name, ai_requests=requests)
        for user_id, name, requests in top_users_data
    ]
    
    user_stats = UserStats(
        total_users=user_stats_data["total_users"],
        top_active_users=top_active_users
    )
    
    # Get subscription statistics
    subscription_stats = AdminService.get_subscription_statistics(db)
    subscriptions = Subscriptions(
        total_subscribers=subscription_stats["total_subscribers"],
        active_plans=subscription_stats["active_plans"]
    )
    
    # Get recent activity
    recent_activity_data = AdminService.get_recent_activity(db, limit=10)
    recent_activity = [
        RecentActivity(
            user=activity["user"],
            action=activity["action"],
            time=activity["time"]
        )
        for activity in recent_activity_data
    ]
    
    return AdminDashboardStats(
        overview=overview,
        ai_performance=ai_performance,
        user_stats=user_stats,
        subscriptions=subscriptions,
        recent_activity=recent_activity
    )

@router.get("/admin/dashboard/feature-usage", response_model=FeatureUsageStats)
def get_feature_usage_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed feature usage statistics"""
    
    # Get feature usage statistics
    usage_stats = AdminService.get_feature_usage_statistics(db)
    
    return FeatureUsageStats(
        resume_builder=ResumeBuilderUsage(
            total_resumes_created=usage_stats["resume_builder"]["total_resumes_created"],
            ai_enhanced_resumes=usage_stats["resume_builder"]["ai_enhanced_resumes"]
        ),
        cover_letter_builder=CoverLetterBuilderUsage(
            total_letters_created=usage_stats["cover_letter_builder"]["total_letters_created"],
            ai_generated_letters=usage_stats["cover_letter_builder"]["ai_generated_letters"]
        ),
        ai_services=AIServicesUsage(
            grammar_check=usage_stats["ai_services"]["grammar_check"],
            text_to_speech=usage_stats["ai_services"]["text_to_speech"],
            smart_task_management=usage_stats["ai_services"]["smart_task_management"],
            interview_prep_sessions=usage_stats["ai_services"]["interview_prep_sessions"]
        )
    )

@router.get("/admin/users", response_model=List[AdminUserInfo])
def get_admin_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: Optional[int] = Query(50, description="Number of users to return (default: 50)"),
    offset: int = Query(0, description="Number of users to skip")
):
    """Get list of all users with their activity information"""
    
    try:
        users_data = AdminService.get_all_users_with_activity(db, limit, offset)
        
        # Convert to response model
        users_response = [
            AdminUserInfo(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                ai_requests=user["ai_requests"],
                last_active=user["last_active"],
                created_at=user["created_at"],
                profile_picture=user["profile_picture"]
            )
            for user in users_data
        ]
        
        return users_response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.get("/admin/users/search", response_model=List[AdminUserInfo])
def search_admin_users(
    search_term: str = Query(..., description="Search users by name, username, or email"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: Optional[int] = Query(20, description="Number of users to return (default: 20)"),
    offset: int = Query(0, description="Number of users to skip")
):
    """Search users by name, username, or email"""
    
    try:
        users_data = AdminService.search_users_with_activity(db, search_term, limit, offset)
        
        # Convert to response model
        users_response = [
            AdminUserInfo(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                ai_requests=user["ai_requests"],
                last_active=user["last_active"],
                created_at=user["created_at"],
                profile_picture=user["profile_picture"]
            )
            for user in users_data
        ]
        
        return users_response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching users: {str(e)}"
        )

@router.get("/admin/users/count")
def get_admin_users_count(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get total count of users for pagination"""
    
    try:
        total_count = AdminService.get_users_count(db)
        return {"total_users": total_count}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user count: {str(e)}"
        )

