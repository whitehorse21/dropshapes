from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class DifficultyLevel(str, Enum):
    """Enum for interview question difficulty levels"""
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    EXPERT = "expert"

class AnswerType(str, Enum):
    """Enum for answer types"""
    TEXT = "text"
    VIDEO = "video"
    AUDIO = "audio"

class InterviewQuestion(BaseModel):
    """Schema for individual interview question"""
    question_id: str = Field(..., description="Unique identifier for the question")
    question_text: str = Field(..., description="The interview question text")

class InterviewQuestionsResponse(BaseModel):
    """Schema for interview questions generation response"""
    session_id: str = Field(..., description="Unique session identifier")
    topic: str = Field(..., description="The topic for which questions were generated")
    level: DifficultyLevel = Field(..., description="Difficulty level of the questions")
    questions: List[InterviewQuestion] = Field(..., description="List of generated interview questions")

class UserAnswer(BaseModel):
    """Schema for individual user answer"""
    question_id: str = Field(..., description="Question identifier")
    answer_type: AnswerType = Field(..., description="Type of answer (text, video, audio)")
    user_answer: str = Field(..., description="User's answer content or URL for media")

class BulkAnswersRequest(BaseModel):
    """Schema for bulk answer submission"""
    session_id: str = Field(..., description="Session identifier")
    answers: List[UserAnswer] = Field(..., description="List of user answers")

class AnswerEvaluation(BaseModel):
    """Schema for individual answer evaluation"""
    question_id: str = Field(..., description="Question identifier")
    score: float = Field(..., ge=0, le=100, description="Score out of 100")
    feedback: str = Field(..., description="Detailed feedback on the answer")
    criteria: dict = Field(default_factory=dict, description="Detailed scoring criteria")

class BulkEvaluationResponse(BaseModel):
    """Schema for bulk answer evaluation response"""
    response_id: str = Field(..., description="Unique response identifier")
    session_id: str = Field(..., description="Session identifier")
    evaluations: List[AnswerEvaluation] = Field(..., description="Individual answer evaluations")
    overall_score: float = Field(..., ge=0, le=100, description="Overall session score")

class EvaluationRequest(BaseModel):
    """Schema for evaluation request"""
    response_id: str = Field(..., description="Response identifier")
    topic: str = Field(..., description="Interview topic")

class EvaluationResponse(BaseModel):
    """Schema for evaluation response"""
    evaluation: dict = Field(..., description="Detailed evaluation results")

class InterviewAnswerRequest(BaseModel):
    """Schema for interview answer submission"""
    session_id: str = Field(..., description="Session identifier")
    question_id: str = Field(..., description="Question identifier")
    answer: str = Field(..., description="User's answer to the question")

class InterviewFeedback(BaseModel):
    """Schema for interview answer feedback"""
    question_id: str = Field(..., description="Question identifier")
    score: float = Field(..., ge=0, le=10, description="Score out of 10")
    feedback: str = Field(..., description="Detailed feedback on the answer")
    areas_for_improvement: List[str] = Field(default=[], description="Specific areas for improvement")
    strengths: List[str] = Field(default=[], description="Strengths identified in the answer")

class InterviewEvaluationResponse(BaseModel):
    """Schema for interview answer evaluation response"""
    session_id: str = Field(..., description="Session identifier")
    question_id: str = Field(..., description="Question identifier")
    feedback: InterviewFeedback = Field(..., description="Feedback on the answer")

class InterviewSessionSummaryRequest(BaseModel):
    """Schema for requesting interview session summary"""
    session_id: str = Field(..., description="Session identifier")

class InterviewSessionSummary(BaseModel):
    """Schema for interview session summary"""
    session_id: str = Field(..., description="Session identifier")
    topic: str = Field(..., description="Interview topic")
    level: DifficultyLevel = Field(..., description="Difficulty level")
    total_questions: int = Field(..., description="Total number of questions")
    questions_answered: int = Field(..., description="Number of questions answered")
    average_score: float = Field(..., ge=0, le=10, description="Average score across all answered questions")
    overall_feedback: str = Field(..., description="Overall session feedback")
    recommendations: List[str] = Field(default=[], description="Recommendations for improvement")

class MockInterviewResponse(BaseModel):
    """Schema for mock interview response"""
    session_id: str = Field(..., description="Mock interview session identifier")
    topic: str = Field(..., description="Interview topic")
    questions: List[str] = Field(..., description="List of interview questions")
    time_limit_minutes: int = Field(default=30, description="Time limit for the mock interview")

class SessionRecord(BaseModel):
    """Schema for individual session record"""
    session_id: str = Field(..., description="Session identifier")
    score: float = Field(..., ge=0, le=100, description="Session score")
    date: str = Field(..., description="Session date (YYYY-MM-DD)")
    topic: str = Field(..., description="Interview topic")

class PerformanceResponse(BaseModel):
    """Schema for user performance tracking"""
    user_id: str = Field(..., description="User identifier")
    interviews_taken: int = Field(..., description="Total number of interviews taken")
    average_score: float = Field(..., ge=0, le=100, description="Average score across all interviews")
    strengths: List[str] = Field(default=[], description="User's strength areas")
    weaknesses: List[str] = Field(default=[], description="Areas needing improvement")
    recent_sessions: List[SessionRecord] = Field(default=[], description="Recent interview sessions")

class InterviewTopicsResponse(BaseModel):
    """Schema for available interview topics"""
    topics: List[str] = Field(..., description="List of available interview topics")

class InterviewQuestionsRequest(BaseModel):
    """Schema for generating interview questions with job description"""
    topic: str = Field(..., description="The topic for interview questions (e.g., react, python, system design)")
    level: DifficultyLevel = Field(default=DifficultyLevel.MID, description="Difficulty level of the questions")
    job_description: str = Field(..., description="Job description to tailor questions specifically to the role")
    num_questions: int = Field(default=3, ge=1, le=10, description="Number of questions to generate (1-10)")
    user_id: Optional[int] = Field(None, description="Optional user ID for tracking")
