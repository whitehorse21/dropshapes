'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';

interface Correction {
  start?: number;
  end?: number;
  error?: string;
  suggestion?: string;
  description?: string;
  type?: string;
  confidence?: number;
}

interface GrammarResult {
  corrections: Correction[];
  correctedText?: string;
  originalText?: string;
  summary?: {
    totalErrors?: number;
    grammarErrors?: number;
    spellingErrors?: number;
  };
}

function GrammarCheckContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const corrections = grammarResult?.corrections || [];

  const handleCheck = async () => {
    if (!text.trim()) {
      setGrammarResult(null);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('grammar-check/', {
        text,
        language: 'en',
        context: {
          maxSuggestions: 5,
          checkSpelling: true,
          checkGrammar: true,
          highlightOffsets: true,
        },
      });
      setGrammarResult(res.data as GrammarResult);
    } catch (err) {
      console.error('Grammar check failed:', err);
      setGrammarResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    if (!grammarResult?.correctedText) return;
    setHistory((prev) => [...prev, text]);
    setText(grammarResult.correctedText);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevText = history[history.length - 1];
      setText(prevText);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleApplySuggestion = (start: number, end: number, suggestion: string) => {
    setHistory((prev) => [...prev, text]);
    const newText = text.slice(0, start) + suggestion + text.slice(end);
    setText(newText);
  };

  return (
    <section id="view-grammar-check" className="view-section active-view" aria-label="Grammar Check">
      <div className="grammar-check-page">
        <div className="header-minimal">
          <h1>Grammar Check Editor</h1>
          <p>Type your text and click Check Grammar to see AI suggestions.</p>
        </div>

        <div className="grammar-check-nav">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grammar-check-card">
          <textarea
            id="grammar-page-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="auth-input"
            style={{ width: '100%', resize: 'vertical', minHeight: '140px' }}
            placeholder="Type something to check grammar..."
            aria-label="Text to check"
          />
          <div className="grammar-check-actions-row">
            <button
              type="button"
              className="btn-resume"
              onClick={() => {
                setText('');
                setGrammarResult(null);
              }}
            >
              Clear input
            </button>
          </div>
        </div>

        {grammarResult?.correctedText && (
          <div className="grammar-check-card">
            <p style={{ margin: 0, color: 'var(--text-secondary)', borderLeft: '4px solid var(--safe-green)', paddingLeft: '12px' }}>
              Suggested: <span style={{ color: 'var(--safe-green)' }}>{grammarResult.correctedText}</span>
            </p>
          </div>
        )}

        <div className="grammar-check-actions-row">
          <button
            type="button"
            className="btn-resume btn-resume-primary"
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            style={{ flex: 1 }}
          >
            {loading ? 'Checking...' : 'Check Grammar'}
          </button>
          <button
            type="button"
            className="btn-resume"
            onClick={handleAcceptAll}
            disabled={!grammarResult?.correctedText}
          >
            Accept All
          </button>
          <button
            type="button"
            className="btn-resume"
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            Undo
          </button>
        </div>

        <div className="grammar-check-card">
          <h2 className="grammar-check-suggestions-title">Suggestions</h2>
          {corrections.length === 0 && !loading && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>No grammar issues found</p>
          )}
          {corrections.map((val, idx) => (
            <div key={idx} className="grammar-check-suggestion-item">
              <p className="error">{val.error}</p>
              <p className="suggestion">→ {val.suggestion}</p>
              {val.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{val.description}</p>}
              {val.confidence != null && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Confidence: {(val.confidence * 100).toFixed(0)}% | Type: {val.type || '—'}
                </p>
              )}
              {val.start != null && val.end != null && val.suggestion && (
                <button
                  type="button"
                  className="btn-resume"
                  style={{ marginTop: '8px' }}
                  onClick={() => handleApplySuggestion(val.start!, val.end!, val.suggestion!)}
                >
                  Apply
                </button>
              )}
            </div>
          ))}
        </div>

        {grammarResult?.summary && (
          <div className="grammar-check-card">
            <div className="grammar-check-summary">
              Errors: <span style={{ color: 'var(--danger-red)' }}>{grammarResult.summary.totalErrors}</span>
              {' '}| Grammar: {grammarResult.summary.grammarErrors} | Spelling: {grammarResult.summary.spellingErrors}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function GrammarCheckPage() {
  return (
    <AuthWrapper>
      <GrammarCheckContent />
    </AuthWrapper>
  );
}
