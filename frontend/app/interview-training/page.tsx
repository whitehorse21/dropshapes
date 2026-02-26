'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';

interface InterviewQuestion {
  question_id: string;
  question_text: string;
}

interface FeedbackEval {
  question_id: string;
  score?: number;
  feedback?: string;
  criteria?: { clarity?: number; technical_accuracy?: number; confidence?: number; completeness?: number };
}

interface FeedbackResponse {
  overall_score?: number;
  evaluations?: FeedbackEval[];
}

function InterviewTrainingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('mid');
  const [jobDescription, setJobDescription] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ question_id: string; answer_type: string; user_answer: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [hasSession, setHasSession] = useState(false);

  const levels = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid-Level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
  ];

  const generateQuestions = async () => {
    if (!selectedTopic.trim()) {
      alert('Please enter a topic first.');
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await axiosInstance.post('interview-training/questions/job-specific', {
        topic: selectedTopic.trim(),
        level: selectedLevel,
        num_questions: 5,
        user_id: user?.id ?? null,
        job_description: jobDescription.trim() || 'General role.',
      });
      const data = res.data as { session_id?: string; questions?: InterviewQuestion[] };
      setSessionId(data.session_id ?? null);
      setCurrentQuestion(data.questions ?? []);
      setCurrentIndex(0);
      setAnswers([]);
      setHasSession(true);
    } catch (err) {
      console.error('Generate questions error:', err);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAnswer = answers.find((a) => a.question_id === currentQuestion[currentIndex]?.question_id)?.user_answer ?? '';

  const setAnswerForCurrent = (value: string) => {
    const q = currentQuestion[currentIndex];
    if (!q) return;
    setAnswers((prev) => {
      const rest = prev.filter((a) => a.question_id !== q.question_id);
      return [...rest, { question_id: q.question_id, answer_type: 'text', user_answer: value }];
    });
  };

  const submitAnswers = async () => {
    if (!sessionId || answers.length === 0) {
      alert('Please provide at least one answer.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('interview-training/answers', {
        session_id: sessionId,
        answers: answers.map((a) => ({ question_id: a.question_id, answer_type: 'text', user_answer: a.user_answer })),
      });
      const data = res.data as FeedbackResponse;
      setFeedback(data);
    } catch (err) {
      console.error('Submit answers error:', err);
      alert('Failed to submit answers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestion.length - 1) setCurrentIndex((i) => i + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const endSession = () => {
    setHasSession(false);
    setCurrentQuestion([]);
    setCurrentIndex(0);
    setSessionId(null);
    setAnswers([]);
    setFeedback(null);
  };

  return (
    <section id="view-interview-training" className="view-section active-view" aria-label="Interview Training">
      <div className="interview-training-page">
        <div className="header-minimal">
          <h1>AI Interview Training</h1>
          <p>Practice with AI-powered questions and get feedback.</p>
        </div>

        <div className="interview-training-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
          <Link href="/interview-training/performance" className="btn-resume" aria-label="View interview history">
            View History
          </Link>
        </div>

        {!hasSession && (
          <div className="interview-training-card">
            <h2>Start Interview Practice</h2>
            <p className="interview-training-card-sub">
              Enter a topic and level, then generate questions. Optionally add a job description for tailored questions.
            </p>
            <div className="interview-training-form-row">
              <div>
                <label className="form-label">Topic</label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="e.g. React, Python, System Design"
                  className="auth-input w-full"
                />
              </div>
              <div>
                <label className="form-label">Level</label>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="auth-input w-full">
                  {levels.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Job description (optional)</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description for tailored questions"
                  className="auth-input w-full"
                  rows={4}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={generateQuestions}
              disabled={!selectedTopic.trim() || isLoading}
            >
              {isLoading ? 'Generating...' : 'Start Interview Session'}
            </button>
          </div>
        )}

        {hasSession && currentQuestion.length > 0 && (
          <div className="interview-training-card">
            <div className="interview-training-actions" style={{ marginBottom: '1rem' }}>
              <div>
                <h2>{selectedTopic} Interview</h2>
                <p className="interview-training-card-sub" style={{ marginBottom: 0 }}>{currentQuestion.length} questions</p>
              </div>
              <button type="button" className="btn-resume btn-resume-danger" onClick={endSession} aria-label="End session">
                End Session
              </button>
            </div>

            {!feedback ? (
              <>
                <div className="interview-training-question-block">
                  <p className="q-label">Question {currentIndex + 1} of {currentQuestion.length}</p>
                  <p style={{ color: 'var(--text-primary)', margin: 0 }}>{currentQuestion[currentIndex]?.question_text}</p>
                </div>
                <div className="interview-training-form-row" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Your answer</label>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setAnswerForCurrent(e.target.value)}
                      placeholder="Type your answer..."
                      className="auth-input w-full"
                      rows={5}
                    />
                  </div>
                </div>
                <div className="interview-training-actions">
                  <button
                    type="button"
                    className="btn-resume"
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    aria-label="Previous question"
                  >
                    Previous
                  </button>
                  {currentIndex < currentQuestion.length - 1 ? (
                    <button type="button" className="btn-resume btn-resume-primary" onClick={nextQuestion}>
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-resume btn-resume-primary"
                      onClick={submitAnswers}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Submit All'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div>
                <div className="interview-training-feedback-card">
                  <h3>Overall Score: {feedback.overall_score ?? 0}/100</h3>
                  <p>Review your feedback below.</p>
                </div>
                {feedback.evaluations?.map((evalItem, idx) => (
                  <div key={evalItem.question_id} className="interview-training-eval-item">
                    <h4>Question {idx + 1} (Score: {evalItem.score ?? 0}/100)</h4>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{evalItem.feedback}</p>
                    {evalItem.criteria && (
                      <div className="criteria">
                        Clarity: {evalItem.criteria.clarity} | Technical: {evalItem.criteria.technical_accuracy} | Confidence: {evalItem.criteria.confidence}
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-resume btn-resume-primary" onClick={endSession} style={{ marginTop: '0.5rem' }}>
                  Start New Session
                </button>
              </div>
            )}
          </div>
        )}

        {hasSession && currentQuestion.length === 0 && !feedback && (
          <div className="interview-training-card" style={{ textAlign: 'center' }}>
            <p className="interview-training-card-sub" style={{ marginBottom: '1rem' }}>Ready for your first question?</p>
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={generateQuestions}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Questions'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function InterviewTrainingPage() {
  return (
    <InterviewTrainingContent />
  );
}
