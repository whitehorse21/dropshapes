from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    contact,
    health,
    resume,
    cover_letter,
    subscriptions,
    signatures,
    resources,
    modules,
    course_units,
    discussions,
    comments,
    assignments,
    text_to_speech,
    grammar_check,
    task_management,
    interview_training,
    professional_networking,
    cache,
    credits,
    admin,
    billing
)

# Create API router
api_router = APIRouter()

# Include all endpoints
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])

# Core SaaS Features
api_router.include_router(resume.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(cover_letter.router, prefix="/cover-letters", tags=["cover-letters"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(signatures.router, prefix="/signatures", tags=["signatures"])
api_router.include_router(credits.router, prefix="/credits", tags=["credits"])

# Educational Content Only
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(course_units.router, prefix="/course-units", tags=["course-units"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])

# Newly added endpoints
api_router.include_router(text_to_speech.router, prefix="/text-to-speech", tags=["text-to-speech"])
api_router.include_router(grammar_check.router, prefix="/grammar-check", tags=["grammar-check"])
api_router.include_router(task_management.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(interview_training.router, prefix="/interview-training", tags=["interview-training"])
api_router.include_router(professional_networking.router, prefix="/professional-networking", tags=["professional-networking"])

# Cache management (admin only)
api_router.include_router(cache.router, prefix="/cache", tags=["cache"])

# Admin endpoints
api_router.include_router(admin.router, tags=["admin"])
