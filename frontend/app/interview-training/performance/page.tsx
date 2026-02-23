'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import { useAuth } from '@/app/context/AuthContext';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';

interface SessionRecord {
  session_id: string;
  score: number;
  date: string;
  topic: string;
}

interface PerformanceData {
  user_id: string;
  interviews_taken: number;
  average_score: number;
  strengths: string[];
  weaknesses: string[];
  recent_sessions: SessionRecord[];
}

function PerformanceContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const userId = String(user.id);
    axiosInstance
      .get<PerformanceData>(ApiEndpoints.interviewTrainingPerformance, { params: { userId } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err.response?.data?.detail ?? err.message ?? 'Failed to load performance';
          setError(typeof message === 'string' ? message : JSON.stringify(message));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const hasSessions = data && (data.interviews_taken > 0 || (data.recent_sessions && data.recent_sessions.length > 0));

  return (
    <section id="view-interview-performance" className="view-section active-view" aria-label="Interview Performance History">
      <div className="interview-performance-page">
        <div className="header-minimal">
          <h1>Interview Performance History</h1>
          <p>Your past sessions and scores.</p>
        </div>

        <div className="interview-training-nav">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
          <Link
            href="/interview-training"
            className="btn-resume btn-resume-primary"
            aria-label="Back to Interview Training"
          >
            ← Back to Interview Training
          </Link>
        </div>

        {loading && (
          <div className="interview-performance-card">
            <p className="interview-performance-card-text">Loading your performance...</p>
          </div>
        )}

        {error && !loading && (
          <div className="interview-performance-card">
            <p className="interview-performance-card-title" style={{ color: 'var(--danger-red)' }}>Error</p>
            <p className="interview-performance-card-text">{error}</p>
            <Link href="/interview-training" className="btn-resume btn-resume-primary" style={{ marginTop: '1rem' }}>
              Go to Interview Training
            </Link>
          </div>
        )}

        {!loading && !error && !hasSessions && data && (
          <div className="interview-performance-card">
            <p className="interview-performance-card-title">No sessions yet</p>
            <p className="interview-performance-card-text">
              Your interview session history and score trends will appear here. Complete practice sessions from the Interview Training page to build your history.
            </p>
            <Link href="/interview-training" className="btn-resume btn-resume-primary" style={{ marginTop: '1rem' }}>
              Go to Interview Training
            </Link>
          </div>
        )}

        {!loading && !error && hasSessions && data && (
          <>
            <div className="interview-performance-card">
              <p className="interview-performance-card-title">Overview</p>
              <p className="interview-performance-card-text">
                Interviews taken: <strong>{data.interviews_taken}</strong>
                {' · '}
                Average score: <strong>{data.average_score.toFixed(1)}%</strong>
              </p>
            </div>

            {data.strengths && data.strengths.length > 0 && (
              <div className="interview-performance-card">
                <p className="interview-performance-card-title">Strengths</p>
                <ul className="interview-performance-list">
                  {data.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.weaknesses && data.weaknesses.length > 0 && (
              <div className="interview-performance-card">
                <p className="interview-performance-card-title">Areas to improve</p>
                <ul className="interview-performance-list">
                  {data.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.recent_sessions && data.recent_sessions.length > 0 && (
              <div className="interview-performance-card">
                <p className="interview-performance-card-title">Recent sessions</p>
                <div className="interview-performance-table-wrap">
                  <table className="interview-performance-table" aria-label="Recent interview sessions">
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Date</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.recent_sessions]
                        .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
                        .map((s) => (
                          <tr key={s.session_id}>
                            <td>{s.topic}</td>
                            <td>{s.date}</td>
                            <td>{s.score.toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function PerformancePage() {
  return (
    <AuthWrapper>
      <PerformanceContent />
    </AuthWrapper>
  );
}
