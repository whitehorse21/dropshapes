from app.schemas.user import UserBase, UserCreate, UserLogin, UserResponse, UserInDB, Token
from app.schemas.contact import ContactCreate, ContactResponse
from app.schemas.resume import ResumeBase, ResumeCreate, ResumeUpdate, ResumeResponse
from app.schemas.cover_letter import (
    CoverLetterBase, CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse,
    ProfileSchema, RecipientSchema, IntroductionSchema, ClosingSchema, CoverStyleSchema,
    APIResponse, CoverLetterSingleResponse, CoverLetterListResponse, CoverLetterDeleteResponse, CoverLetterMigrationResponse
)
from app.schemas.subscription import SubscriptionBase, SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.schemas.signature import SignatureBase, SignatureCreate, SignatureUpdate, SignatureResponse
from app.schemas.task import TaskBase, TaskCreate, TaskUpdate, TaskResponse, TaskSimpleCreate
from app.schemas.resource import ResourceBase, ResourceCreate, ResourceUpdate, ResourceResponse
from app.schemas.module import ModuleBase, ModuleCreate, ModuleUpdate, ModuleResponse
from app.schemas.course_unit import CourseUnitBase, CourseUnitCreate, CourseUnitUpdate, CourseUnitResponse
from app.schemas.discussion import DiscussionBase, DiscussionCreate, DiscussionUpdate, DiscussionResponse
from app.schemas.comment import CommentBase, CommentCreate, CommentUpdate, CommentResponse
from app.schemas.assignment import AssignmentBase, AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.schemas.professional_networking import (
    NetworkingSuggestions, ProfessionalNetworkingResponse, 
    NetworkingMessageRequest, NetworkingMessageResponse
)
from app.schemas.interview_training import (
    DifficultyLevel, AnswerType, InterviewQuestion, InterviewQuestionsResponse,
    InterviewAnswerRequest, InterviewFeedback, InterviewEvaluationResponse,
    InterviewSessionSummaryRequest, InterviewSessionSummary, InterviewTopicsResponse,
    UserAnswer, BulkAnswersRequest, BulkEvaluationResponse, AnswerEvaluation,
    EvaluationRequest, EvaluationResponse, MockInterviewResponse,
    SessionRecord, PerformanceResponse
)
from app.schemas.grammar_check import (
    GrammarCheckRequest, GrammarCheckResponse, GrammarCorrection, 
    GrammarCheckContext, GrammarCheckError
)

# This module exports all schemas for easy importing
