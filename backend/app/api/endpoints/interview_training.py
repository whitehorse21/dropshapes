from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.interview_training_service import InterviewTrainingService
from app.services.ai_credits_service import AICreditService
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.interview import (
    InterviewSession as DBInterviewSession,
    InterviewAnswer as DBInterviewAnswer
)
from app.schemas.interview_training import (
    DifficultyLevel,
    InterviewQuestionsResponse,
    InterviewQuestionsRequest,
    InterviewAnswerRequest,
    InterviewEvaluationResponse,
    InterviewSessionSummaryRequest,
    InterviewSessionSummary,
    InterviewTopicsResponse,
    BulkAnswersRequest,
    BulkEvaluationResponse,
    EvaluationRequest,
    EvaluationResponse,
    MockInterviewResponse,
    PerformanceResponse
)

router = APIRouter()

@router.get("/questions", response_model=InterviewQuestionsResponse)
async def generate_interview_questions(
    topic: str = Query(..., description="The topic for interview questions (e.g., react, python, system design)"),
    level: DifficultyLevel = Query(DifficultyLevel.MID, description="Difficulty level of the questions"),
    num_questions: int = Query(3, ge=1, le=10, description="Number of questions to generate (1-10)"),
    job_description: Optional[str] = Query(None, description="Optional job description to tailor questions"),
    user_id: Optional[int] = Query(None, description="Optional user ID for tracking"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate interview questions for a specific topic and difficulty level.
    Optionally provide a job description to generate more targeted questions.
    Creates a new interview session and returns multiple questions.
    """
    try:
        # Check and deduct AI credits (1 credit per question generation request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        interview_service = InterviewTrainingService()
        response = interview_service.generate_interview_questions(topic, level, num_questions, user_id, db, job_description)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/questions/job-specific", response_model=InterviewQuestionsResponse)
async def generate_job_specific_interview_questions(
    request: InterviewQuestionsRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate interview questions tailored to a specific job description.
    This endpoint accepts a job description in the request body to create 
    highly targeted interview questions that align with the role requirements.
    """
    try:
        # Check and deduct AI credits (1 credit per job-specific question generation)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        interview_service = InterviewTrainingService()
        response = interview_service.generate_interview_questions(
            topic=request.topic,
            level=request.level,
            num_questions=request.num_questions,
            user_id=request.user_id,
            db=db,
            job_description=request.job_description
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/answer", response_model=InterviewEvaluationResponse)
async def evaluate_interview_answer(
    request: InterviewAnswerRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit and evaluate an answer to an interview question.
    Returns detailed feedback including score, strengths, and areas for improvement.
    """
    try:
        # Check and deduct AI credits (1 credit per answer evaluation)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        interview_service = InterviewTrainingService()
        evaluation = interview_service.evaluate_answer(
            request.session_id,
            request.question_id,
            request.answer,
            db
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/summary", response_model=InterviewSessionSummary)
async def get_session_summary(
    request: InterviewSessionSummaryRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Get a comprehensive summary of an interview session.
    Includes overall performance, average score, and personalized recommendations.
    """
    try:
        interview_service = InterviewTrainingService()
        summary = interview_service.get_session_summary(request.session_id, db)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics", response_model=InterviewTopicsResponse)
async def get_available_topics():
    """
    Get a list of available interview topics.
    Use these topics when generating interview questions.
    """
    try:
        interview_service = InterviewTrainingService()
        topics = interview_service.get_available_topics()
        return InterviewTopicsResponse(topics=topics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/answers", response_model=BulkEvaluationResponse)
async def submit_bulk_answers(
    request: BulkAnswersRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit multiple answers for evaluation at once.
    Supports text, video, and audio answer types.
    Returns comprehensive evaluation with individual and overall scores.
    """
    try:
        # Check and deduct AI credits (1 credit per bulk answer evaluation)
        num_answers = len(request.answers) if hasattr(request, 'answers') else 1
        AICreditService.check_and_deduct_credits(db, current_user, num_answers)
        
        interview_service = InterviewTrainingService()
        evaluation = interview_service.submit_bulk_answers(request, db)
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_responses(
    request: EvaluationRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed evaluation for previously submitted answers.
    Returns comprehensive analysis including criteria breakdown.
    """
    try:
        # Check and deduct AI credits (1 credit per evaluation request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        interview_service = InterviewTrainingService()
        
        # Get session from database to verify it exists
        db_session = db.query(DBInterviewSession).filter(DBInterviewSession.id == request.response_id).first()
        if not db_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get answers for this session to calculate evaluation
        answers = db.query(DBInterviewAnswer).filter(DBInterviewAnswer.session_id == request.response_id).all()
        if not answers:
            raise HTTPException(status_code=404, detail="No answers found for this session")
        
        # Calculate overall score from all answers
        scores = [answer.score for answer in answers if answer.score is not None]
        overall_score = sum(scores) / len(scores) if scores else 0
        
        # Format response to match expected structure
        evaluation_result = {
            "score": round(overall_score, 1),
            "feedback": f"Overall performance on {db_session.topic} interview questions. {len(answers)} questions answered with an average score of {round(overall_score, 1)}/10.",
            "criteria": {
                "clarity": round(overall_score * 0.9, 1),  # Slightly lower for clarity
                "technical_accuracy": round(overall_score, 1),  # Main score
                "confidence": round(min(overall_score * 1.1, 10), 1)  # Slightly higher for confidence, capped at 10
            }
        }
        
        return EvaluationResponse(evaluation=evaluation_result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mock", response_model=MockInterviewResponse)
async def generate_mock_interview(
    topic: str = Query(..., description="Topic for the mock interview"),
    time_limit: int = Query(30, ge=10, le=120, description="Time limit in minutes (10-120)"),
    user_id: Optional[int] = Query(None, description="Optional user ID for tracking"),
    db: Session = Depends(get_db)
):
    """
    Generate a mock interview session with multiple questions and time limit.
    Simulates a real interview experience with comprehensive questions.
    """
    try:
        interview_service = InterviewTrainingService()
        mock_interview = interview_service.generate_mock_interview(topic, time_limit, user_id, db)
        return mock_interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance", response_model=PerformanceResponse)
async def get_user_performance(
    userId: str = Query(..., description="User ID for performance tracking"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive performance tracking for a user.
    Includes interview history, strengths, weaknesses, and trends.
    """
    try:
        interview_service = InterviewTrainingService()
        performance = interview_service.get_user_performance(userId, db)
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Legacy endpoint for backward compatibility
@router.post("/")
async def interview_training(topic: str):
    """
    Legacy endpoint: Generate a single interview question.
    Use /questions endpoint for enhanced functionality.
    """
    try:
        interview_service = InterviewTrainingService()
        question = interview_service.generate_interview_question(topic)
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
