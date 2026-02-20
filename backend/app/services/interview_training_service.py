import os
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.schemas.interview_training import (
    DifficultyLevel, AnswerType,
    InterviewQuestion, 
    InterviewQuestionsResponse,
    InterviewFeedback,
    InterviewEvaluationResponse,
    InterviewSessionSummary,
    UserAnswer,
    BulkAnswersRequest,
    BulkEvaluationResponse,
    AnswerEvaluation,
    MockInterviewResponse,
    SessionRecord,
    PerformanceResponse
)

# Import database models
from app.models.interview import (
    InterviewSession as DBInterviewSession,
    InterviewQuestion as DBInterviewQuestion,
    InterviewAnswer as DBInterviewAnswer,
    UserPerformance as DBUserPerformance,
    DifficultyLevelEnum,
    AnswerTypeEnum
)

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

class InterviewTrainingService:
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS Interview Training service initialized successfully")
                else:
                    raise Exception("AWS Interview Training service not available")
            except Exception as e:
                print(f"Failed to initialize AWS Interview Training service: {str(e)}")
                raise Exception("AWS Interview Training service is required but not available")
        else:
            raise Exception("AWS Interview Training service is required but not configured")

    def _convert_difficulty_to_enum(self, difficulty: DifficultyLevel) -> DifficultyLevelEnum:
        """Convert schema DifficultyLevel to database enum"""
        mapping = {
            DifficultyLevel.JUNIOR: DifficultyLevelEnum.JUNIOR,
            DifficultyLevel.MID: DifficultyLevelEnum.MID,
            DifficultyLevel.SENIOR: DifficultyLevelEnum.SENIOR,
            DifficultyLevel.EXPERT: DifficultyLevelEnum.EXPERT
        }
        return mapping[difficulty]

    def _convert_answer_type_to_enum(self, answer_type: AnswerType) -> AnswerTypeEnum:
        """Convert schema AnswerType to database enum"""
        mapping = {
            AnswerType.TEXT: AnswerTypeEnum.TEXT,
            AnswerType.VIDEO: AnswerTypeEnum.VIDEO,
            AnswerType.AUDIO: AnswerTypeEnum.AUDIO
        }
        return mapping[answer_type]

    def generate_interview_questions(self, topic: str, level: DifficultyLevel, num_questions: int = 3, user_id: Optional[int] = None, db: Session = None, job_description: Optional[str] = None) -> InterviewQuestionsResponse:
        """Generate multiple interview questions for a topic and difficulty level, optionally tailored to a job description"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            session_id = str(uuid.uuid4())
            questions = self._generate_questions_with_aws(topic, level, num_questions, job_description)
            
            # Create database session
            db_session = DBInterviewSession(
                id=session_id,
                user_id=user_id,
                topic=topic,
                difficulty_level=self._convert_difficulty_to_enum(level),
                session_type="standard",
                total_questions=len(questions),
                questions_answered=0,
                average_score=0.0
            )
            db.add(db_session)
            db.flush()  # Get the session ID
            
            # Create database questions
            for i, question in enumerate(questions, 1):
                db_question = DBInterviewQuestion(
                    id=question.question_id,
                    session_id=session_id,
                    question_text=question.question_text,
                    question_order=i
                )
                db.add(db_question)
            
            db.commit()
            
            return InterviewQuestionsResponse(
                session_id=session_id,
                topic=topic,
                level=level,
                questions=questions
            )
        except Exception as e:
            if db:
                db.rollback()
            raise Exception(f"Question generation error: {str(e)}")

    def _generate_questions_with_aws(self, topic: str, level: DifficultyLevel, num_questions: int, job_description: Optional[str] = None) -> List[InterviewQuestion]:
        """Generate interview questions using AWS Bedrock, optionally tailored to a job description"""
        try:
            # Define difficulty descriptions
            difficulty_descriptions = {
                DifficultyLevel.JUNIOR: "entry-level, basic concepts and fundamentals",
                DifficultyLevel.MID: "intermediate-level, practical experience and problem-solving",
                DifficultyLevel.SENIOR: "senior-level, advanced concepts, system design, and leadership",
                DifficultyLevel.EXPERT: "expert-level, architecture, complex problem-solving, and industry expertise"
            }
            
            # Build job description context if provided
            job_context = ""
            if job_description:
                job_context = f"""
            Job Description Context:
            {job_description}
            
            Please tailor the questions to be specifically relevant to this job description while maintaining focus on {topic}.
            """
            
            prompt = f"""
            Generate {num_questions} professional interview questions about {topic} for {difficulty_descriptions[level]} positions.
            {job_context}
            Requirements:
            - Questions should be relevant to {topic}
            - Difficulty level: {level.value}
            - Questions should be open-ended and encourage detailed responses
            - Suitable for a job interview context
            - Each question should be unique and cover different aspects
            {"- Questions should align with the provided job description requirements" if job_description else ""}
            
            Return the response as a JSON object with this exact structure:
            {{
                "questions": [
                    {{
                        "question_id": "q1",
                        "question_text": "First interview question here"
                    }},
                    {{
                        "question_id": "q2", 
                        "question_text": "Second interview question here"
                    }},
                    {{
                        "question_id": "q3",
                        "question_text": "Third interview question here"
                    }}
                ]
            }}
            
            Start your response directly with {{ and end with }}.
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=800, temperature=0.7)
            
            try:
                # Parse the JSON response
                questions_data = json.loads(response.strip())
                questions = []
                
                for i, q_data in enumerate(questions_data.get("questions", []), 1):
                    # Generate unique question ID using UUID to avoid primary key conflicts
                    unique_question_id = str(uuid.uuid4())
                    question = InterviewQuestion(
                        question_id=unique_question_id,
                        question_text=q_data.get("question_text", "")
                    )
                    questions.append(question)
                
                return questions
                
            except json.JSONDecodeError:
                # Fallback: create questions from raw response
                lines = response.strip().split('\n')
                questions = []
                for i, line in enumerate(lines[:num_questions], 1):
                    if line.strip():
                        # Generate unique question ID using UUID to avoid primary key conflicts
                        unique_question_id = str(uuid.uuid4())
                        question = InterviewQuestion(
                            question_id=unique_question_id,
                            question_text=line.strip()
                        )
                        questions.append(question)
                
                return questions[:num_questions]
                
        except Exception as e:
            raise Exception(f"AWS question generation error: {str(e)}")

    def evaluate_answer(self, session_id: str, question_id: str, answer: str, db: Session = None) -> InterviewEvaluationResponse:
        """Evaluate an interview answer"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            # Get session from database
            db_session = db.query(DBInterviewSession).filter(DBInterviewSession.id == session_id).first()
            if not db_session:
                raise Exception("Session not found")
            
            # Get question from database
            db_question = db.query(DBInterviewQuestion).filter(
                DBInterviewQuestion.id == question_id,
                DBInterviewQuestion.session_id == session_id
            ).first()
            if not db_question:
                raise Exception("Question not found")
            
            # Evaluate the answer
            feedback = self._evaluate_answer_with_aws(
                db_question.question_text, 
                answer, 
                db_session.topic, 
                DifficultyLevel(db_session.difficulty_level.value), 
                question_id
            )
            
            # Store the answer and evaluation in database
            db_answer = DBInterviewAnswer(
                session_id=session_id,
                question_id=question_id,
                user_answer=answer,
                answer_type=AnswerTypeEnum.TEXT,
                score=feedback.score,
                feedback=feedback.feedback,
                strengths=feedback.strengths,
                areas_for_improvement=feedback.areas_for_improvement,
                criteria_scores={},  # Will be populated by detailed evaluation
                evaluated_at=datetime.now()
            )
            db.add(db_answer)
            
            # Update session statistics
            answered_count = db.query(DBInterviewAnswer).filter(DBInterviewAnswer.session_id == session_id).count() + 1
            db_session.questions_answered = answered_count
            
            # Calculate average score
            if answered_count > 0:
                avg_score = db.query(func.avg(DBInterviewAnswer.score)).filter(
                    DBInterviewAnswer.session_id == session_id
                ).scalar()
                db_session.average_score = float(avg_score) if avg_score else 0.0
            
            db.commit()
            
            return InterviewEvaluationResponse(
                session_id=session_id,
                question_id=question_id,
                feedback=feedback
            )
            
        except Exception as e:
            if db:
                db.rollback()
            raise Exception(f"Answer evaluation error: {str(e)}")

    def _evaluate_answer_with_aws(self, question: str, answer: str, topic: str, level: DifficultyLevel, question_id: str) -> InterviewFeedback:
        """Evaluate interview answer using AWS Bedrock"""
        try:
            prompt = f"""
            Evaluate the following interview answer for a {level.value}-level {topic} position.
            
            Question: {question}
            User's Answer: {answer}
            
            Evaluate based on:
            1. Technical accuracy and completeness
            2. Communication clarity and structure
            3. Professional presentation
            4. Depth of knowledge appropriate for {level.value} level
            5. Practical understanding and examples
            
            Provide a comprehensive evaluation in the following JSON format:
            {{
                "score": 7.5,
                "feedback": "Detailed feedback explaining the score and overall assessment",
                "strengths": ["Strength 1", "Strength 2", "Strength 3"],
                "areas_for_improvement": ["Area 1", "Area 2", "Area 3"]
            }}
            
            Score should be between 0-10 where:
            - 0-3: Poor, significant gaps in knowledge
            - 4-5: Below average, some understanding but major improvements needed
            - 6-7: Average, good understanding with room for improvement
            - 8-9: Very good, strong understanding with minor improvements
            - 10: Excellent, comprehensive and well-articulated answer
            
            Start your response directly with {{ and end with }}.
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=600, temperature=0.3)
            
            try:
                feedback_data = json.loads(response.strip())
                return InterviewFeedback(
                    question_id=question_id,
                    score=feedback_data.get("score", 5.0),
                    feedback=feedback_data.get("feedback", "No feedback available"),
                    strengths=feedback_data.get("strengths", []),
                    areas_for_improvement=feedback_data.get("areas_for_improvement", [])
                )
            except json.JSONDecodeError:
                # Fallback evaluation
                return InterviewFeedback(
                    question_id=question_id,
                    score=6.0,
                    feedback="Thank you for your answer. The evaluation service is temporarily unavailable, but your response has been recorded.",
                    strengths=["Provided a response", "Engaged with the question"],
                    areas_for_improvement=["Consider providing more specific examples", "Structure your answer more clearly"]
                )
                
        except Exception as e:
            raise Exception(f"AWS answer evaluation error: {str(e)}")

    def get_session_summary(self, session_id: str, db: Session = None) -> InterviewSessionSummary:
        """Get summary of an interview session"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            # Get session from database
            db_session = db.query(DBInterviewSession).filter(DBInterviewSession.id == session_id).first()
            if not db_session:
                raise Exception("Session not found")
            
            # Get answers for scoring
            answers = db.query(DBInterviewAnswer).filter(DBInterviewAnswer.session_id == session_id).all()
            scores = [answer.score for answer in answers if answer.score is not None]
            
            # Calculate average score and ensure it's on 0-10 scale
            if scores:
                raw_average = sum(scores) / len(scores)
                # If the score appears to be on 0-100 scale, convert to 0-10
                average_score = raw_average / 10 if raw_average > 10 else raw_average
                # Ensure score is within valid range
                average_score = max(0, min(10, average_score))
            else:
                average_score = 0
            
            # Update session with calculated values
            db_session.average_score = average_score
            db_session.questions_answered = len(answers)
            
            # Generate overall feedback and recommendations
            overall_feedback = self._generate_session_feedback_from_db(db_session, average_score)
            recommendations = self._generate_recommendations_from_db(db_session, average_score)
            
            # Update session with feedback
            db_session.overall_feedback = overall_feedback
            db_session.recommendations = recommendations
            
            if len(answers) == db_session.total_questions:
                db_session.completed_at = datetime.now()
            
            db.commit()
            
            return InterviewSessionSummary(
                session_id=session_id,
                topic=db_session.topic,
                level=DifficultyLevel(db_session.difficulty_level.value),
                total_questions=db_session.total_questions,
                questions_answered=db_session.questions_answered,
                average_score=round(average_score, 1),
                overall_feedback=overall_feedback,
                recommendations=recommendations
            )
            
        except Exception as e:
            if db:
                db.rollback()
            raise Exception(f"Session summary error: {str(e)}")

    def _generate_session_feedback_from_db(self, session: DBInterviewSession, average_score: float) -> str:
        """Generate overall session feedback from database session"""
        if average_score >= 8:
            return f"Excellent performance! You demonstrated strong knowledge in {session.topic} at the {session.difficulty_level.value} level."
        elif average_score >= 6:
            return f"Good performance overall. You show solid understanding of {session.topic} concepts with some areas for improvement."
        elif average_score >= 4:
            return f"Average performance. Consider reviewing key {session.topic} concepts and practicing more detailed explanations."
        else:
            return f"There's room for improvement. Focus on building stronger foundational knowledge in {session.topic}."

    def _generate_recommendations_from_db(self, session: DBInterviewSession, average_score: float) -> List[str]:
        """Generate personalized recommendations from database session"""
        recommendations = []
        
        if average_score < 6:
            recommendations.extend([
                f"Study fundamental {session.topic} concepts",
                "Practice explaining technical concepts clearly",
                "Work on providing specific examples in your answers"
            ])
        
        if average_score < 8:
            recommendations.extend([
                "Practice mock interviews to improve confidence",
                "Focus on structuring your answers more clearly"
            ])
            
        recommendations.append(f"Continue practicing {session.topic} interview questions")
        
        return recommendations

    def _generate_session_feedback(self, session: Dict[str, Any], average_score: float) -> str:
        """Generate overall session feedback"""
        if average_score >= 8:
            return f"Excellent performance! You demonstrated strong knowledge in {session['topic']} at the {session['level']} level."
        elif average_score >= 6:
            return f"Good performance overall. You show solid understanding of {session['topic']} concepts with some areas for improvement."
        elif average_score >= 4:
            return f"Average performance. Consider reviewing key {session['topic']} concepts and practicing more detailed explanations."
        else:
            return f"There's room for improvement. Focus on building stronger foundational knowledge in {session['topic']}."

    def _generate_recommendations(self, session: Dict[str, Any], average_score: float) -> List[str]:
        """Generate personalized recommendations based on session performance"""
        recommendations = []
        
        if average_score < 6:
            recommendations.extend([
                f"Study fundamental {session['topic']} concepts",
                "Practice explaining technical concepts clearly",
                "Work on providing specific examples in your answers"
            ])
        
        if average_score < 8:
            recommendations.extend([
                "Practice mock interviews to improve confidence",
                "Focus on structuring your answers more clearly"
            ])
            
        recommendations.append(f"Continue practicing {session['topic']} interview questions")
        
        return recommendations

    def get_available_topics(self) -> List[str]:
        """Get list of available interview topics"""
        return [
            "react", "javascript", "python", "java", "node.js", "express.js",
            "database design", "system design", "data structures", "algorithms",
            "machine learning", "devops", "cloud computing", "cybersecurity",
            "project management", "leadership", "communication skills",
            "frontend development", "backend development", "full-stack development"
        ]

    def submit_bulk_answers(self, request: BulkAnswersRequest, db: Session = None) -> BulkEvaluationResponse:
        """Submit and evaluate multiple answers at once using database"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            # Get session from database
            db_session = db.query(DBInterviewSession).filter(DBInterviewSession.id == request.session_id).first()
            if not db_session:
                raise Exception("Session not found")
            
            response_id = str(uuid.uuid4())
            evaluations = []
            scores = []
            
            for user_answer in request.answers:
                # Get question from database
                db_question = db.query(DBInterviewQuestion).filter(
                    DBInterviewQuestion.id == user_answer.question_id,
                    DBInterviewQuestion.session_id == request.session_id
                ).first()
                
                if not db_question:
                    continue
                
                # Evaluate the answer based on type
                if user_answer.answer_type == AnswerType.TEXT:
                    evaluation = self._evaluate_text_answer(
                        db_question.question_text, user_answer.user_answer, 
                        db_session.topic, DifficultyLevel(db_session.difficulty_level.value), user_answer.question_id
                    )
                elif user_answer.answer_type == AnswerType.VIDEO:
                    evaluation = self._evaluate_video_answer(
                        db_question.question_text, user_answer.user_answer,
                        db_session.topic, DifficultyLevel(db_session.difficulty_level.value), user_answer.question_id
                    )
                elif user_answer.answer_type == AnswerType.AUDIO:
                    evaluation = self._evaluate_audio_answer(
                        db_question.question_text, user_answer.user_answer,
                        db_session.topic, DifficultyLevel(db_session.difficulty_level.value), user_answer.question_id
                    )
                else:
                    evaluation = AnswerEvaluation(
                        question_id=user_answer.question_id,
                        score=50.0,  # Keep on 0-100 scale for consistency
                        feedback="Answer type not supported for evaluation",
                        criteria={}
                    )
                
                # Store the answer in database
                db_answer = DBInterviewAnswer(
                    session_id=request.session_id,
                    question_id=user_answer.question_id,
                    user_answer=user_answer.user_answer,
                    answer_type=self._convert_answer_type_to_enum(user_answer.answer_type),
                    score=evaluation.score / 10,  # Convert from 0-100 to 0-10 scale
                    feedback=evaluation.feedback,
                    strengths=[],  # Will be populated by detailed evaluation
                    areas_for_improvement=[],  # Will be populated by detailed evaluation
                    criteria_scores=evaluation.criteria,
                    evaluated_at=datetime.now()
                )
                db.add(db_answer)
                
                evaluations.append(evaluation)
                scores.append(evaluation.score / 10)  # Convert to 0-10 scale for consistency
            
            # Update session statistics
            answered_count = len(request.answers)
            db_session.questions_answered = answered_count
            
            overall_score = sum(scores) / len(scores) if scores else 0
            db_session.average_score = overall_score
            
            db.commit()
            
            return BulkEvaluationResponse(
                response_id=response_id,
                session_id=request.session_id,
                evaluations=evaluations,
                overall_score=round(overall_score, 1)
            )
            
        except Exception as e:
            if db:
                db.rollback()
            raise Exception(f"Bulk answer evaluation error: {str(e)}")

    def _evaluate_text_answer(self, question: str, answer: str, topic: str, level: DifficultyLevel, question_id: str) -> AnswerEvaluation:
        """Evaluate text-based answer"""
        try:
            prompt = f"""
            Evaluate the following interview answer for a {level.value}-level {topic} position.
            
            Question: {question}
            User's Answer: {answer}
            
            Provide a comprehensive evaluation in the following JSON format:
            {{
                "score": 75.5,
                "feedback": "Detailed feedback explaining the score and overall assessment",
                "criteria": {{
                    "clarity": 80,
                    "technical_accuracy": 70,
                    "confidence": 75,
                    "completeness": 80
                }}
            }}
            
            Score should be between 0-100 where:
            - 0-30: Poor, significant gaps in knowledge
            - 31-50: Below average, some understanding but major improvements needed
            - 51-70: Average, good understanding with room for improvement
            - 71-85: Very good, strong understanding with minor improvements
            - 86-100: Excellent, comprehensive and well-articulated answer
            
            Start your response directly with {{ and end with }}.
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=600, temperature=0.3)
            
            try:
                eval_data = json.loads(response.strip())
                return AnswerEvaluation(
                    question_id=question_id,
                    score=eval_data.get("score", 50.0),
                    feedback=eval_data.get("feedback", "No feedback available"),
                    criteria=eval_data.get("criteria", {})
                )
            except json.JSONDecodeError:
                return AnswerEvaluation(
                    question_id=question_id,
                    score=60.0,  # Keep on 0-100 scale for consistency
                    feedback="Thank you for your answer. The evaluation service is temporarily unavailable.",
                    criteria={"clarity": 60, "technical_accuracy": 60, "confidence": 60}
                )
                
        except Exception as e:
            raise Exception(f"Text answer evaluation error: {str(e)}")

    def _evaluate_video_answer(self, question: str, video_url: str, topic: str, level: DifficultyLevel, question_id: str) -> AnswerEvaluation:
        """Evaluate video-based answer (placeholder - would need video processing)"""
        # In a real implementation, this would:
        # 1. Download/process the video
        # 2. Extract audio and convert to text
        # 3. Analyze video for confidence, body language, etc.
        # 4. Evaluate both content and presentation
        
        return AnswerEvaluation(
            question_id=question_id,
            score=75.0,  # Keep on 0-100 scale for consistency with text evaluation
            feedback=f"Video answer received for {topic} question. Full video analysis is not yet implemented, but your engagement with video responses is noted positively.",
            criteria={
                "clarity": 75,
                "technical_accuracy": 70,
                "confidence": 80,
                "presentation": 75
            }
        )

    def _evaluate_audio_answer(self, question: str, audio_url: str, topic: str, level: DifficultyLevel, question_id: str) -> AnswerEvaluation:
        """Evaluate audio-based answer (placeholder - would need audio processing)"""
        # In a real implementation, this would:
        # 1. Download/process the audio
        # 2. Convert speech to text
        # 3. Analyze for clarity, pace, confidence
        # 4. Evaluate content
        
        return AnswerEvaluation(
            question_id=question_id,
            score=70.0,  # Keep on 0-100 scale for consistency with text evaluation
            feedback=f"Audio answer received for {topic} question. Full audio analysis is not yet implemented, but your verbal communication attempt is noted.",
            criteria={
                "clarity": 70,
                "technical_accuracy": 65,
                "confidence": 75,
                "verbal_communication": 70
            }
        )

    def generate_mock_interview(self, topic: str, time_limit: int = 30, user_id: Optional[int] = None, db: Session = None) -> MockInterviewResponse:
        """Generate a mock interview session using database"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            session_id = f"mock_{str(uuid.uuid4())}"
            
            # Generate mock interview questions (typically 3-5 questions)
            questions = self._generate_mock_questions(topic)
            
            # Create database session
            db_session = DBInterviewSession(
                id=session_id,
                user_id=user_id,
                topic=topic,
                difficulty_level=DifficultyLevelEnum.MID,  # Default for mock interviews
                session_type="mock",
                total_questions=len(questions),
                questions_answered=0,
                average_score=0.0
            )
            db.add(db_session)
            db.flush()
            
            # Create database questions
            for i, question_text in enumerate(questions, 1):
                # Generate unique question ID using UUID to avoid primary key conflicts
                unique_question_id = str(uuid.uuid4())
                db_question = DBInterviewQuestion(
                    id=unique_question_id,
                    session_id=session_id,
                    question_text=question_text,
                    question_order=i
                )
                db.add(db_question)
            
            db.commit()
            
            return MockInterviewResponse(
                session_id=session_id,
                topic=topic,
                questions=questions,
                time_limit_minutes=time_limit
            )
            
        except Exception as e:
            if db:
                db.rollback()
            raise Exception(f"Mock interview generation error: {str(e)}")

    def _generate_mock_questions(self, topic: str) -> List[str]:
        """Generate mock interview questions"""
        try:
            prompt = f"""
            Generate 3-5 professional mock interview questions for {topic}.
            
            Requirements:
            - Questions should simulate a real interview experience
            - Cover different aspects of {topic}
            - Include both technical and behavioral questions
            - Questions should be challenging but fair
            - Suitable for a comprehensive interview assessment
            
            Return only the questions as a JSON array:
            ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
            
            Start your response directly with [ and end with ].
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=600, temperature=0.7)
            
            try:
                questions = json.loads(response.strip())
                return questions if isinstance(questions, list) else []
            except json.JSONDecodeError:
                # Fallback questions
                return [
                    f"What are the key concepts in {topic}?",
                    f"How do you handle challenges when working with {topic}?",
                    f"Describe a project where you used {topic} effectively.",
                    f"What are the best practices for {topic}?",
                    f"How do you stay updated with {topic} trends?"
                ]
                
        except Exception as e:
            raise Exception(f"Mock question generation error: {str(e)}")

    def get_user_performance(self, user_id: str, db: Session = None) -> PerformanceResponse:
        """Get user performance tracking data from database"""
        try:
            if not db:
                raise Exception("Database session is required")
                
            # Get user's interview sessions from database
            user_sessions = db.query(DBInterviewSession).filter(
                DBInterviewSession.user_id == int(user_id)
            ).all()
            
            interviews_taken = len(user_sessions)
            
            # Calculate scores from sessions
            session_scores = []
            for session in user_sessions:
                if session.average_score is not None:
                    # Ensure score is on 0-100 scale for PerformanceResponse
                    score = session.average_score * 10 if session.average_score <= 10 else session.average_score
                    session_scores.append(score)
            
            average_score = sum(session_scores) / len(session_scores) if session_scores else 0
            
            # Get recent sessions (last 10)
            recent_sessions = []
            for session in user_sessions[-10:]:
                # Ensure score is on 0-100 scale for PerformanceResponse
                score = session.average_score or 0
                if score <= 10:
                    score = score * 10  # Convert from 0-10 to 0-100 scale
                
                recent_sessions.append(SessionRecord(
                    session_id=session.id,
                    score=score,
                    date=session.created_at.date().isoformat() if session.created_at else date.today().isoformat(),
                    topic=session.topic
                ))
            
            # Analyze strengths and weaknesses based on session history
            strengths, weaknesses = self._analyze_performance_trends_from_db(user_sessions)
            
            return PerformanceResponse(
                user_id=user_id,
                interviews_taken=interviews_taken,
                average_score=round(average_score, 1),
                strengths=strengths,
                weaknesses=weaknesses,
                recent_sessions=recent_sessions
            )
            
        except Exception as e:
            raise Exception(f"Performance tracking error: {str(e)}")

    def _analyze_performance_trends_from_db(self, sessions: List[DBInterviewSession]) -> tuple[List[str], List[str]]:
        """Analyze user performance from database sessions to identify strengths and weaknesses"""
        if not sessions:
            return [], []
        
        # Group sessions by topic and calculate average scores
        topic_scores = {}
        for session in sessions:
            topic = session.topic
            raw_score = session.average_score or 0
            # Normalize score to 0-10 scale for analysis
            score = raw_score if raw_score <= 10 else raw_score / 10
            
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(score)
        
        # Calculate average scores per topic
        topic_averages = {}
        for topic, scores in topic_scores.items():
            topic_averages[topic] = sum(scores) / len(scores)
        
        # Determine strengths (topics with high scores) and weaknesses (topics with low scores)
        sorted_topics = sorted(topic_averages.items(), key=lambda x: x[1], reverse=True)
        
        strengths = []
        weaknesses = []
        
        for topic, avg_score in sorted_topics:
            if avg_score >= 7.5:  # Score out of 10
                strengths.append(topic.title())
            elif avg_score <= 6.0:  # Score out of 10
                weaknesses.append(topic.title())
        
        return strengths[:5], weaknesses[:5]  # Limit to top 5

    def update_user_performance(self, user_id: str, session_id: str, score: float, topic: str, db: Session = None):
        """Update user performance data after completing a session - now handled automatically by database"""
        # This method is now deprecated as performance is calculated directly from database
        # User performance is automatically tracked through the InterviewSession and InterviewAnswer tables
        pass

    # Legacy methods for backward compatibility
    def generate_interview_question(self, topic):
        """Generate a single interview question (legacy method)"""
        try:
            return self._generate_single_question_with_aws(topic)
        except Exception as e:
            raise Exception(f"AWS question generation error: {str(e)}")

    def _generate_single_question_with_aws(self, topic):
        """Generate a single interview question using AWS Bedrock (legacy method)"""
        try:
            prompt = f"""
            Generate a professional interview question about {topic}. 
            The question should be:
            - Relevant to the topic
            - Professional and appropriate
            - Open-ended to encourage detailed responses
            - Suitable for a job interview context
            
            Return only the question without any additional text.
            """
            
            question = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=200, temperature=0.7)
            return question.strip()
        except Exception as e:
            raise Exception(f"AWS question generation error: {str(e)}")

    def transcribe_audio_answer(self, audio_bytes, language="en"):
        """Transcribe audio using AWS Transcribe (placeholder for future implementation)"""
        # For now, this is a placeholder. Full implementation would require S3 upload
        raise NotImplementedError("Audio transcription requires AWS Transcribe with S3 upload. Implementation pending.")

    # Placeholder for video-to-text (not implemented)
    def transcribe_video_answer(self, video_bytes):
        raise NotImplementedError("Video-to-text transcription is not implemented yet.")


