from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserSummary(BaseModel):
    id: int
    name: str
    ai_requests: int

class Revenue(BaseModel):
    total: float
    monthly: float

class Overview(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    ai_requests_today: Optional[int] = None
    total_ai_requests: Optional[int] = None
    revenue: Revenue

class AIPerformance(BaseModel):
    average_response_time: str
    uptime: str
    failed_requests_today: int

class UserStats(BaseModel):
    total_users: int
    top_active_users: List[UserSummary]

class Subscriptions(BaseModel):
    total_subscribers: int
    active_plans: List[Dict[str, Any]]

class RecentActivity(BaseModel):
    user: str
    action: str
    time: str

class AdminDashboardStats(BaseModel):
    overview: Overview
    ai_performance: AIPerformance
    user_stats: UserStats
    subscriptions: Subscriptions
    recent_activity: List[RecentActivity]

class ResumeBuilderUsage(BaseModel):
    total_resumes_created: int
    ai_enhanced_resumes: int

class CoverLetterBuilderUsage(BaseModel):
    total_letters_created: int
    ai_generated_letters: int

class AIServicesUsage(BaseModel):
    grammar_check: int
    text_to_speech: int
    smart_task_management: int
    interview_prep_sessions: int

class FeatureUsageStats(BaseModel):
    resume_builder: ResumeBuilderUsage
    cover_letter_builder: CoverLetterBuilderUsage
    ai_services: AIServicesUsage

class AdminUserInfo(BaseModel):
    id: int
    name: str
    email: str
    ai_requests: int
    last_active: Optional[str] = None
    created_at: str
    profile_picture: Optional[str] = None
