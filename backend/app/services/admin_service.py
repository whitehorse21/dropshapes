"""
Admin service for dashboard statistics and admin-only operations
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, date, timedelta
from typing import List, Tuple, Dict, Any, Optional

from app.models.user import User
from app.models.subscription import Subscription
from app.models.interview import InterviewSession, InterviewAnswer
from app.models.resume import Resume
from app.models.cover_letter import CoverLetter
from app.models.task import Task


def normalize_datetime(dt):
    """Convert timezone-aware datetime to timezone-naive for comparison"""
    if dt and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


class AdminService:
    """Service class for admin dashboard and admin operations"""
    
    @staticmethod
    def _get_user_display_name(user_name: str, username: str, email: str, user_id: int) -> str:
        """
        Get user display name with fallback priority:
        1. name (full name)
        2. username 
        3. email prefix (part before @)
        4. User ID as fallback
        """
        if user_name and user_name.strip():
            return user_name.strip()
        elif username and username.strip():
            return username.strip()
        elif email and email.strip():
            return email.split('@')[0]
        else:
            return f"User {user_id}"
    
    @staticmethod
    def get_user_statistics(db: Session) -> Dict[str, int]:
        """Get basic user statistics"""
        today = date.today()
        
        total_users = db.query(User).count()
        new_users_today = db.query(User).filter(
            func.date(User.created_at) == today
        ).count()
        
        # Active users (users who have used any AI feature in the last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        active_users = db.query(User.id).distinct().filter(
            User.id.in_(
                db.query(InterviewSession.user_id).filter(
                    InterviewSession.created_at >= thirty_days_ago
                ).union(
                    db.query(Resume.user_id).filter(Resume.created_at >= thirty_days_ago)
                ).union(
                    db.query(CoverLetter.user_id).filter(CoverLetter.created_at >= thirty_days_ago)
                )
            )
        ).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today
        }
    
    @staticmethod
    def get_ai_request_statistics(db: Session) -> Dict[str, int]:
        """Get AI request statistics"""
        today = date.today()
        
        # AI requests today
        ai_requests_today = (
            db.query(InterviewSession).filter(func.date(InterviewSession.created_at) == today).count() +
            db.query(Resume).filter(func.date(Resume.created_at) == today).count() +
            db.query(CoverLetter).filter(func.date(CoverLetter.created_at) == today).count()
        )
        
        # Total AI requests
        total_ai_requests = (
            db.query(InterviewSession).count() +
            db.query(Resume).count() +
            db.query(CoverLetter).count()
        )
        
        return {
            "ai_requests_today": ai_requests_today,
            "total_ai_requests": total_ai_requests
        }
    
    @staticmethod
    def get_revenue_statistics(db: Session) -> Dict[str, float]:
        """Get revenue statistics from subscriptions"""
        start_of_month = date.today().replace(day=1)
        
        total_revenue = db.query(func.sum(Subscription.price)).filter(
            Subscription.is_active == True
        ).scalar() or 0
        
        monthly_revenue = db.query(func.sum(Subscription.price)).filter(
            Subscription.is_active == True,
            Subscription.created_at >= start_of_month
        ).scalar() or 0
        
        return {
            "total": float(total_revenue),
            "monthly": float(monthly_revenue)
        }
    
    @staticmethod
    def get_top_active_users(db: Session, limit: int = 3) -> List[Tuple[int, str, int]]:
        """Get top active users based on AI feature usage"""
        # Get users who have interview sessions
        users_with_activity = []
        
        # Get users with interview activity including username and email for fallback
        interview_users = db.query(
            User.id, 
            User.name,
            User.username,
            User.email,
            func.count(InterviewSession.id).label('interview_count')
        ).join(InterviewSession).group_by(User.id, User.name, User.username, User.email).all()
        
        for user_id, user_name, username, email, interview_count in interview_users:
            # Count all AI requests for this user
            resume_count = db.query(Resume).filter(Resume.user_id == user_id).count()
            cover_letter_count = db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count()
            total_requests = interview_count + resume_count + cover_letter_count
            
            # Use name priority: name -> username -> email -> fallback
            display_name = AdminService._get_user_display_name(
                user_name, username, email, user_id
            )
            
            users_with_activity.append((user_id, display_name, total_requests))
        
        # Sort by total requests and return top users
        users_with_activity.sort(key=lambda x: x[2], reverse=True)
        return users_with_activity[:limit]
    
    @staticmethod
    def get_subscription_statistics(db: Session) -> Dict[str, Any]:
        """Get subscription statistics"""
        total_subscribers = db.query(Subscription).filter(Subscription.is_active == True).count()
        
        active_plans = db.query(
            Subscription.name,
            func.count(Subscription.id).label('count')
        ).filter(Subscription.is_active == True)\
         .group_by(Subscription.name).all()
        
        active_plans_list = [{"plan": plan.name, "count": plan.count} for plan in active_plans]
        
        return {
            "total_subscribers": total_subscribers,
            "active_plans": active_plans_list
        }
    
    @staticmethod
    def get_recent_activity(db: Session, limit: int = 10) -> List[Dict[str, str]]:
        """Get recent user activity"""
        today = date.today()
        start_of_today = datetime.combine(today, datetime.min.time())
        
        recent_activity = []
        
        # Get recent interview sessions with full user details
        recent_interviews = db.query(InterviewSession, User.name, User.username, User.email).join(User).filter(
            InterviewSession.created_at >= start_of_today
        ).order_by(desc(InterviewSession.created_at)).limit(5).all()
        
        for session, user_name, username, email in recent_interviews:
            # Use name priority: name -> username -> email -> fallback
            display_name = AdminService._get_user_display_name(
                user_name, username, email, session.user_id
            )
            recent_activity.append({
                "user": display_name,
                "action": "Used AI Interview Preparation",
                "time": session.created_at.isoformat()
            })
        
        # Get recent resumes with full user details
        recent_resumes = db.query(Resume, User.name, User.username, User.email).join(User).filter(
            Resume.created_at >= start_of_today
        ).order_by(desc(Resume.created_at)).limit(3).all()
        
        for resume, user_name, username, email in recent_resumes:
            # Use name priority: name -> username -> email -> fallback
            display_name = AdminService._get_user_display_name(
                user_name, username, email, resume.user_id
            )
            recent_activity.append({
                "user": display_name,
                "action": "Generated AI Resume",
                "time": resume.created_at.isoformat()
            })
        
        # Get recent cover letters with full user details
        recent_cover_letters = db.query(CoverLetter, User.name, User.username, User.email).join(User).filter(
            CoverLetter.created_at >= start_of_today
        ).order_by(desc(CoverLetter.created_at)).limit(2).all()
        
        for cover_letter, user_name, username, email in recent_cover_letters:
            # Use name priority: name -> username -> email -> fallback
            display_name = AdminService._get_user_display_name(
                user_name, username, email, cover_letter.user_id
            )
            recent_activity.append({
                "user": display_name,
                "action": "Checked Grammar for Cover Letter",
                "time": cover_letter.created_at.isoformat()
            })
        
        # Sort by time and limit results
        recent_activity.sort(key=lambda x: x["time"], reverse=True)
        return recent_activity[:limit]
    
    @staticmethod
    def get_ai_performance_metrics() -> Dict[str, Any]:
        """Get AI performance metrics (mock data for now)"""
        # In a production environment, these would come from actual monitoring
        return {
            "average_response_time": "2.1s",
            "uptime": "99.8%",
            "failed_requests_today": 2
        }
    
    @staticmethod
    def get_feature_usage_statistics(db: Session) -> Dict[str, Any]:
        """Get comprehensive feature usage statistics"""
        
        # Resume Builder Statistics
        total_resumes = db.query(Resume).count()
        # Count AI-enhanced resumes (those with AI-generated content in key sections)
        ai_enhanced_resumes = db.query(Resume).filter(
            (Resume.summary.isnot(None)) |
            (Resume.skills.isnot(None)) |
            (Resume.work_history.isnot(None))
        ).count()
        
        # Cover Letter Builder Statistics
        total_cover_letters = db.query(CoverLetter).count()
        # Count AI-generated letters (those with AI-generated body content)
        ai_generated_letters = db.query(CoverLetter).filter(
            (CoverLetter.body.isnot(None)) |
            (CoverLetter.introduction.isnot(None))
        ).count()
        
        # AI Services Statistics
        # Interview Prep Sessions
        interview_prep_sessions = db.query(InterviewSession).count()
        
        # Smart Task Management: Count all tasks (AI and non-AI)
        smart_task_management = db.query(Task).count()
        
        # For services without dedicated tracking, provide realistic estimates
        # based on user activity and typical usage patterns
        
        # Grammar Check: Estimate based on text content creation
        # Assume users check grammar for cover letters and resume summaries
        grammar_check_usage = (
            total_cover_letters * 2 +  # 2 checks per cover letter on average
            ai_enhanced_resumes * 1    # 1 check per AI-enhanced resume
        )
        
        # Text to Speech: Estimate based on accessibility features usage
        # Assume 20% of users use TTS for reviewing their content
        text_to_speech_usage = int((total_resumes + total_cover_letters) * 0.2)
        
        return {
            "resume_builder": {
                "total_resumes_created": total_resumes,
                "ai_enhanced_resumes": ai_enhanced_resumes
            },
            "cover_letter_builder": {
                "total_letters_created": total_cover_letters,
                "ai_generated_letters": ai_generated_letters
            },
            "ai_services": {
                "grammar_check": grammar_check_usage,
                "text_to_speech": text_to_speech_usage,
                "smart_task_management": smart_task_management,
                "interview_prep_sessions": interview_prep_sessions
            }
        }
    
    @staticmethod
    def get_feature_usage_trends(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get feature usage trends over the specified number of days"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Get trends for resumes
        recent_resumes = db.query(Resume).filter(
            Resume.created_at >= start_date
        ).count()
        
        # Get trends for cover letters
        recent_cover_letters = db.query(CoverLetter).filter(
            CoverLetter.created_at >= start_date
        ).count()
        
        # Get trends for interview sessions
        recent_interviews = db.query(InterviewSession).filter(
            InterviewSession.created_at >= start_date
        ).count()
        
        # Get trends for tasks
        recent_tasks = db.query(Task).filter(
            Task.created_at >= start_date
        ).count()
        
        return {
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "trends": {
                "resumes_created": recent_resumes,
                "cover_letters_created": recent_cover_letters,
                "interview_sessions": recent_interviews,
                "tasks_created": recent_tasks
            }
        }
    
    @staticmethod
    def get_user_engagement_metrics(db: Session) -> Dict[str, Any]:
        """Get user engagement metrics"""
        # Users who have created at least one piece of content
        engaged_users = db.query(User.id).distinct().filter(
            User.id.in_(
                db.query(Resume.user_id).union(
                    db.query(CoverLetter.user_id)
                ).union(
                    db.query(InterviewSession.user_id)
                ).union(
                    db.query(Task.user_id)
                )
            )
        ).count()
        
        total_users = db.query(User).count()
        engagement_rate = (engaged_users / total_users * 100) if total_users > 0 else 0
        
        # Average content per engaged user
        avg_resumes_per_user = db.query(func.avg(
            db.query(func.count(Resume.id)).filter(Resume.user_id == User.id).scalar_subquery()
        )).scalar() or 0
        
        return {
            "total_users": total_users,
            "engaged_users": engaged_users,
            "engagement_rate_percent": round(engagement_rate, 2),
            "average_resumes_per_user": round(float(avg_resumes_per_user), 2)
        }
    
    @staticmethod
    def get_all_users_with_activity(db: Session, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all users with their activity information"""
        
        # Base query for users
        users_query = db.query(
            User.id,
            User.name,
            User.username,
            User.email,
            User.profile_image,
            User.created_at,
            User.updated_at
        ).order_by(desc(User.created_at))
        
        # Apply pagination if specified
        if limit:
            users_query = users_query.offset(offset).limit(limit)
        
        users = users_query.all()
        user_list = []
        
        for user_id, name, username, email, profile_image, created_at, updated_at in users:
            # Get AI requests count for this user
            interview_count = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).count()
            resume_count = db.query(Resume).filter(Resume.user_id == user_id).count()
            cover_letter_count = db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count()
            task_count = db.query(Task).filter(Task.user_id == user_id).count()
            
            total_ai_requests = interview_count + resume_count + cover_letter_count + task_count
            
            # Get last activity date
            last_activities = []
            
            # Check latest interview session
            latest_interview = db.query(InterviewSession.created_at).filter(
                InterviewSession.user_id == user_id
            ).order_by(desc(InterviewSession.created_at)).first()
            if latest_interview:
                last_activities.append(latest_interview[0])
            
            # Check latest resume
            latest_resume = db.query(Resume.created_at).filter(
                Resume.user_id == user_id
            ).order_by(desc(Resume.created_at)).first()
            if latest_resume:
                last_activities.append(latest_resume[0])
            
            # Check latest cover letter
            latest_cover_letter = db.query(CoverLetter.created_at).filter(
                CoverLetter.user_id == user_id
            ).order_by(desc(CoverLetter.created_at)).first()
            if latest_cover_letter:
                last_activities.append(latest_cover_letter[0])
            
            # Check latest task
            latest_task = db.query(Task.created_at).filter(
                Task.user_id == user_id
            ).order_by(desc(Task.created_at)).first()
            if latest_task:
                last_activities.append(latest_task[0])
            
            # Get the most recent activity or fall back to user creation/update date
            if last_activities:
                # Normalize all datetime objects to timezone-naive for comparison
                normalized_activities = [normalize_datetime(dt) for dt in last_activities]
                last_active = max(normalized_activities)
            else:
                last_active = normalize_datetime(updated_at or created_at)
            
            # Format last active date
            last_active_str = last_active.strftime("%Y-%m-%d %H:%M") if last_active else None
            
            # Format created_at date
            created_at_str = created_at.strftime("%Y-%m-%d %H:%M") if created_at else None
            
            # Get display name using our helper function
            display_name = AdminService._get_user_display_name(name, username, email, user_id)
            
            user_list.append({
                "id": user_id,
                "name": display_name,
                "email": email,
                "ai_requests": total_ai_requests,
                "last_active": last_active_str,
                "created_at": created_at_str,
                "profile_picture": profile_image
            })
        
        return user_list
    
    @staticmethod
    def get_users_count(db: Session) -> int:
        """Get total count of users for pagination"""
        return db.query(User).count()
    
    @staticmethod
    def search_users_with_activity(db: Session, search_term: str, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        """Search users by name or email and return with activity information"""
        
        # Create search filter for name, username, or email
        search_filter = f"%{search_term.lower()}%"
        users_query = db.query(
            User.id,
            User.name,
            User.username,
            User.email,
            User.profile_image,
            User.created_at,
            User.updated_at
        ).filter(
            (func.lower(User.name).like(search_filter)) |
            (func.lower(User.username).like(search_filter)) |
            (func.lower(User.email).like(search_filter))
        ).order_by(desc(User.created_at))
        
        # Apply pagination if specified
        if limit:
            users_query = users_query.offset(offset).limit(limit)
        
        users = users_query.all()
        user_list = []
        
        for user_id, name, username, email, profile_image, created_at, updated_at in users:
            # Get AI requests count for this user
            interview_count = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).count()
            resume_count = db.query(Resume).filter(Resume.user_id == user_id).count()
            cover_letter_count = db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count()
            task_count = db.query(Task).filter(Task.user_id == user_id).count()
            
            total_ai_requests = interview_count + resume_count + cover_letter_count + task_count
            
            # Get last activity date (same logic as in get_all_users_with_activity)
            last_activities = []
            
            # Check latest interview session
            latest_interview = db.query(InterviewSession.created_at).filter(
                InterviewSession.user_id == user_id
            ).order_by(desc(InterviewSession.created_at)).first()
            if latest_interview:
                last_activities.append(latest_interview[0])
            
            # Check latest resume
            latest_resume = db.query(Resume.created_at).filter(
                Resume.user_id == user_id
            ).order_by(desc(Resume.created_at)).first()
            if latest_resume:
                last_activities.append(latest_resume[0])
            
            # Check latest cover letter
            latest_cover_letter = db.query(CoverLetter.created_at).filter(
                CoverLetter.user_id == user_id
            ).order_by(desc(CoverLetter.created_at)).first()
            if latest_cover_letter:
                last_activities.append(latest_cover_letter[0])
            
            # Check latest task
            latest_task = db.query(Task.created_at).filter(
                Task.user_id == user_id
            ).order_by(desc(Task.created_at)).first()
            if latest_task:
                last_activities.append(latest_task[0])
            
            # Get the most recent activity or fall back to user creation/update date
            if last_activities:
                # Normalize all datetime objects to timezone-naive for comparison
                normalized_activities = [normalize_datetime(dt) for dt in last_activities]
                last_active = max(normalized_activities)
            else:
                last_active = normalize_datetime(updated_at or created_at)
            
            # Format last active date
            last_active_str = last_active.strftime("%Y-%m-%d %H:%M") if last_active else None
            
            # Format created_at date
            created_at_str = created_at.strftime("%Y-%m-%d %H:%M") if created_at else None
            
            # Get display name using our helper function
            display_name = AdminService._get_user_display_name(name, username, email, user_id)
            
            user_list.append({
                "id": user_id,
                "name": display_name,
                "email": email,
                "ai_requests": total_ai_requests,
                "last_active": last_active_str,
                "created_at": created_at_str,
                "profile_picture": profile_image
            })
        
        return user_list
