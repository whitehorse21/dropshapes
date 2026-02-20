/**
 * Interview Training Service
 * =========================
 * Frontend service for AI-powered interview preparation
 * - Interview question generation
 * - Audio/video answer recording
 * - AI-powered answer evaluation
 * - Performance tracking and analytics
 * - Mock interview sessions
 */

import axios from "../apimodule/axiosConfig/Axios";
import { toast } from "react-hot-toast";
import { BehaviorSubject } from "rxjs";
import axiosInstance from "../apimodule/axiosConfig/Axios";

class InterviewTrainingService {
  constructor() {
    this.currentSession = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    // Observables for reactive state management
    this.sessionSubject = new BehaviorSubject(null);
    this.recordingSubject = new BehaviorSubject(false);
    this.evaluationSubject = new BehaviorSubject(null);

    // Session storage - only load on client side
    if (typeof window !== "undefined") {
      this.loadCurrentSession();
    }
  }

  /**
   * Get observable for current session
   */
  getSession$() {
    return this.sessionSubject.asObservable();
  }

  /**
   * Get observable for recording status
   */
  getRecording$() {
    return this.recordingSubject.asObservable();
  }

  /**
   * Get observable for evaluation results
   */
  getEvaluation$() {
    return this.evaluationSubject.asObservable();
  }

  /**
   * Generate interview question for a specific topic
   * @param {string} topic - Interview topic
   * @param {string} level - Difficulty level (junior, mid, senior)
   * @param {string} type - Question type (technical, behavioral, situational)
   * @returns {Promise<object>} Generated question
   */
  async generateInterviewQuestion(topic, level = "mid", type = "technical") {
    try {
      if (!topic || topic.trim() === "") {
        throw new Error("Topic is required");
      }
      const lowerTopic = topic.trim().toLowerCase();
      const token = localStorage.getItem("access");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}interview-training/questions?topic=${lowerTopic}&level=mid`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const question = {
          ...response.data,
          id: Date.now(),
          generatedAt: new Date().toISOString(),
          topic,
          level,
          type,
        };

        // Add to current session if exists
        if (this.currentSession) {
          this.currentSession.questions.push(question);
          this.saveCurrentSession();
          this.sessionSubject.next({ ...this.currentSession });
        }

        return question;
      } else {
        throw new Error("Failed to generate question");
      }
    } catch (error) {
      console.error("Error generating interview question:", error);
      toast.error(
        `Failed to generate question: ${
          error.response?.data?.detail || error.message
        }`
      );
      throw error;
    }
  }

  /**
   * Start a new interview session
   * @param {string} topic - Session topic
   * @param {object} settings - Session settings
   * @returns {object} New session
   */
  startInterviewSession(topic, settings = {}) {
    try {
      this.currentSession = {
        id: Date.now(),
        topic,
        startedAt: new Date().toISOString(),
        questions: [],
        answers: [],
        evaluations: [],
        settings: {
          questionCount: settings.questionCount || 5,
          level: settings.level || "mid",
          type: settings.type || "mixed",
          timeLimit: settings.timeLimit || 300, // 5 minutes per question
          ...settings,
        },
        status: "active",
      };

      this.saveCurrentSession();
      this.sessionSubject.next({ ...this.currentSession });

      toast.success("Interview session started");
      return this.currentSession;
    } catch (error) {
      console.error("Error starting interview session:", error);
      toast.error("Failed to start interview session");
      throw error;
    }
  }

  /**
   * End current interview session
   * @returns {object} Completed session
   */
  endInterviewSession() {
    try {
      if (!this.currentSession) {
        throw new Error("No active session");
      }

      this.currentSession.status = "completed";
      this.currentSession.endedAt = new Date().toISOString();

      // Calculate session statistics
      this.currentSession.statistics = this.calculateSessionStatistics();

      this.saveCurrentSession();
      this.sessionSubject.next({ ...this.currentSession });

      // Save to history
      this.saveSessionToHistory(this.currentSession);

      const completedSession = { ...this.currentSession };
      this.currentSession = null;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("dropshapes_current_interview_session");
      }
      this.sessionSubject.next(null);

      toast.success("Interview session completed");
      return completedSession;
    } catch (error) {
      console.error("Error ending interview session:", error);
      toast.error("Failed to end interview session");
      throw error;
    }
  }

  /**
   * Start recording audio/video answer
   * @param {string} questionId - Question ID
   * @param {boolean} videoEnabled - Whether to record video
   * @returns {Promise<boolean>} Recording started successfully
   */
  async startRecording(questionId, videoEnabled = false) {
    try {
      if (this.isRecording) {
        throw new Error("Recording already in progress");
      }

      // Request media permissions
      const constraints = {
        audio: true,
        video: videoEnabled,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: videoEnabled ? "video/webm" : "audio/webm",
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingSubject.next(true);

      toast.success("Recording started");
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(`Failed to start recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop recording and return the recorded blob
   * @returns {Promise<Blob>} Recorded audio/video blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isRecording || !this.mediaRecorder) {
          throw new Error("No recording in progress");
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder.mimeType,
          });

          this.isRecording = false;
          this.recordingSubject.next(false);
          this.recordedChunks = [];

          toast.success("Recording stopped");
          resolve(blob);
        };

        this.mediaRecorder.stop();
      } catch (error) {
        console.error("Error stopping recording:", error);
        toast.error("Failed to stop recording");
        reject(error);
      }
    });
  }

  /**
   * Submit answer for evaluation
   * @param {string} questionId - Question ID
   * @param {string} answerText - Text answer (if typed)
   * @param {Blob} audioBlob - Audio recording blob (if recorded)
   * @param {Blob} videoBlob - Video recording blob (if recorded)
   * @returns {Promise<object>} Evaluation result
   */
  async submitAnswer(
    questionId,
    answerText = "",
    audioBlob = null,
    videoBlob = null
  ) {
    try {
      if (!this.currentSession) {
        throw new Error("No active session");
      }

      const question = this.currentSession.questions.find(
        (q) => q.id === questionId
      );
      if (!question) {
        throw new Error("Question not found");
      }

      // Create answer object
      const answer = {
        id: Date.now(),
        questionId,
        submittedAt: new Date().toISOString(),
        textAnswer: answerText,
        hasAudio: !!audioBlob,
        hasVideo: !!videoBlob,
      };

      // Add answer to session
      this.currentSession.answers.push(answer);

      // If we have a text answer, evaluate it directly
      if (answerText.trim()) {
        const evaluation = await this.evaluateTextAnswer(
          question.text,
          answerText
        );
        answer.evaluation = evaluation;
        this.currentSession.evaluations.push(evaluation);
        this.evaluationSubject.next(evaluation);
      }

      // TODO: Handle audio/video transcription and evaluation
      // This would require backend implementation for transcription services

      this.saveCurrentSession();
      this.sessionSubject.next({ ...this.currentSession });

      toast.success("Answer submitted successfully");
      return answer;
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
      throw error;
    }
  }

  /**
   * Evaluate text answer
   * @param {string} question - Question text
   * @param {string} answer - Answer text
   * @returns {Promise<object>} Evaluation result
   */
  async evaluateTextAnswer(question, answer) {
    try {
      const response = await axios.post("/api/interview-training/", {
        reference_answer: question, // Using question as reference context
        transcribed_answer: answer,
      });

      const evaluation = {
        id: Date.now(),
        evaluatedAt: new Date().toISOString(),
        score: this.calculateAnswerScore(response.data),
        feedback: response.data,
        provider: "aws",
      };

      return evaluation;
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast.error("Failed to evaluate answer");
      throw error;
    }
  }

  /**
   * Calculate answer score from evaluation feedback
   * @param {string} feedback - AI feedback
   * @returns {number} Score out of 100
   */
  calculateAnswerScore(feedback) {
    // Simple scoring algorithm based on feedback keywords
    const positiveWords = [
      "excellent",
      "good",
      "well",
      "clear",
      "detailed",
      "comprehensive",
    ];
    const negativeWords = [
      "poor",
      "lacking",
      "unclear",
      "incomplete",
      "needs improvement",
    ];

    let score = 50; // Base score

    const feedbackLower = feedback.toLowerCase();

    positiveWords.forEach((word) => {
      if (feedbackLower.includes(word)) score += 8;
    });

    negativeWords.forEach((word) => {
      if (feedbackLower.includes(word)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get interview history
   * @returns {Array} Array of completed sessions
   */
  getInterviewHistory() {
    if (typeof localStorage === "undefined") return [];

    try {
      const stored = localStorage.getItem("dropshapes_interview_history");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load interview history:", error);
      return [];
    }
  }

  /**
   * Get session analytics
   * @param {string} sessionId - Session ID (optional, uses current session if not provided)
   * @returns {object} Session analytics
   */
  getSessionAnalytics(sessionId = null) {
    try {
      let session = sessionId
        ? this.getInterviewHistory().find((s) => s.id === sessionId)
        : this.currentSession;

      if (!session) {
        return null;
      }

      return this.calculateSessionStatistics(session);
    } catch (error) {
      console.error("Error calculating session analytics:", error);
      return null;
    }
  }

  /**
   * Calculate session statistics
   * @param {object} session - Session object
   * @returns {object} Statistics
   */
  calculateSessionStatistics(session = null) {
    const targetSession = session || this.currentSession;
    if (!targetSession) return null;

    const totalQuestions = targetSession.questions.length;
    const totalAnswers = targetSession.answers.length;
    const evaluations = targetSession.evaluations || [];

    const averageScore =
      evaluations.length > 0
        ? evaluations.reduce(
            (sum, evaluation) => sum + (evaluation.score || 0),
            0
          ) / evaluations.length
        : 0;

    const duration = targetSession.endedAt
      ? new Date(targetSession.endedAt) - new Date(targetSession.startedAt)
      : Date.now() - new Date(targetSession.startedAt);

    return {
      totalQuestions,
      totalAnswers,
      completionRate:
        totalQuestions > 0 ? (totalAnswers / totalQuestions) * 100 : 0,
      averageScore: Math.round(averageScore * 10) / 10,
      durationMinutes: Math.round(duration / (1000 * 60)),
      evaluatedAnswers: evaluations.length,
      topic: targetSession.topic,
      level: targetSession.settings?.level || "mid",
    };
  }

  /**
   * Generate practice plan
   * @param {string} targetRole - Target job role
   * @param {string} experience - Experience level
   * @returns {Promise<object>} Practice plan
   */
  async generatePracticePlan(targetRole, experience) {
    try {
      // This would be a more comprehensive API call
      const topics = await this.getTopicsForRole(targetRole, experience);

      const plan = {
        id: Date.now(),
        targetRole,
        experience,
        topics,
        createdAt: new Date().toISOString(),
        recommendedSessions: Math.max(3, topics.length),
        estimatedHours: topics.length * 1.5,
      };

      return plan;
    } catch (error) {
      console.error("Error generating practice plan:", error);
      throw error;
    }
  }

  /**
   * Get recommended topics for a role
   * @param {string} role - Job role
   * @param {string} experience - Experience level
   * @returns {Array} Array of topics
   */
  async getTopicsForRole(role, experience) {
    // This could be enhanced with an API call for dynamic topic generation
    const topicMap = {
      "software-engineer": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding",
        "Debugging",
      ],
      "product-manager": [
        "Product Strategy",
        "User Research",
        "Data Analysis",
        "Stakeholder Management",
      ],
      "data-scientist": [
        "Machine Learning",
        "Statistics",
        "Python/R",
        "Data Visualization",
        "SQL",
      ],
      marketing: [
        "Digital Marketing",
        "Analytics",
        "Campaign Management",
        "Brand Strategy",
      ],
      sales: [
        "Lead Generation",
        "Customer Relations",
        "Negotiation",
        "Pipeline Management",
      ],
    };

    return (
      topicMap[role] || [
        "General Interview Skills",
        "Communication",
        "Problem Solving",
      ]
    );
  }

  /**
   * Save current session to storage
   */
  saveCurrentSession() {
    if (typeof localStorage === "undefined") return;

    if (this.currentSession) {
      localStorage.setItem(
        "dropshapes_current_interview_session",
        JSON.stringify(this.currentSession)
      );
    }
  }

  /**
   * Load current session from storage
   */
  loadCurrentSession() {
    try {
      const stored = localStorage.getItem(
        "dropshapes_current_interview_session"
      );
      if (stored) {
        this.currentSession = JSON.parse(stored);
        this.sessionSubject.next({ ...this.currentSession });
      }
    } catch (error) {
      console.error("Failed to load current session:", error);
    }
  }

  /**
   * Save session to history
   * @param {object} session - Completed session
   */
  saveSessionToHistory(session) {
    if (typeof localStorage === "undefined") return;

    try {
      const history = this.getInterviewHistory();
      history.push(session);

      // Keep only last 50 sessions
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      localStorage.setItem(
        "dropshapes_interview_history",
        JSON.stringify(history)
      );
    } catch (error) {
      console.error("Failed to save session to history:", error);
    }
  }

  /**
   * Clear interview history
   */
  clearHistory() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("dropshapes_interview_history");
    }
    toast.success("Interview history cleared");
  }

  /**
   * Export session data
   * @param {string} sessionId - Session ID
   * @returns {string} JSON string of session data
   */
  exportSession(sessionId) {
    try {
      const session =
        sessionId === "current"
          ? this.currentSession
          : this.getInterviewHistory().find((s) => s.id === sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      return JSON.stringify(
        {
          session,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        },
        null,
        2
      );
    } catch (error) {
      console.error("Failed to export session:", error);
      throw error;
    }
  }
}

// Export singleton instance
// eslint-disable-next-line import/no-anonymous-default-export
export default new InterviewTrainingService();
