'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';

interface NetworkingSuggestions {
  key_professionals: string[];
  industries_organizations: string[];
  networking_platforms_events: string[];
  effective_networking_tips: string[];
}

interface SuggestionsResponse {
  profession: string;
  suggestions: NetworkingSuggestions;
  provider: string;
}

function ProfessionalNetworkingContent() {
  const router = useRouter();
  const [profession, setProfession] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [targetProfession, setTargetProfession] = useState('');
  const [userProfession, setUserProfession] = useState('');
  const [context, setContext] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    if (!profession.trim()) {
      toast.error('Enter your profession');
      return;
    }
    setSuggestionsLoading(true);
    setSuggestions(null);
    try {
      const res = await axiosInstance.get<SuggestionsResponse>('professional-networking/', {
        params: { profession: profession.trim() },
      });
      setSuggestions(res.data);
      toast.success('Suggestions loaded');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to load suggestions';
      toast.error(typeof msg === 'string' ? msg : 'Failed to load suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!targetProfession.trim() || !userProfession.trim()) {
      toast.error('Enter both target and your profession');
      return;
    }
    setMessageLoading(true);
    setGeneratedMessage(null);
    try {
      const res = await axiosInstance.post<{ message: string }>('professional-networking/message', {
        target_profession: targetProfession.trim(),
        user_profession: userProfession.trim(),
        context: context.trim(),
      });
      setGeneratedMessage(res.data.message);
      toast.success('Message generated');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to generate message';
      toast.error(typeof msg === 'string' ? msg : 'Failed to generate message');
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <section id="view-professional-networking" className="view-section active-view" aria-label="Professional Networking">
      <div className="tool-page-wrap professional-networking-page">
        <div className="header-minimal">
          <h1>Professional Networking</h1>
          <p>Get AI suggestions and generate messages for LinkedIn and professional outreach.</p>
        </div>
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
        </div>

        <div className="tool-page-card">
          <h2 className="pn-section-title">Connection suggestions</h2>
          <p className="pn-section-desc">Enter your profession to get tailored networking suggestions.</p>
          <div className="pn-form-row">
            <input
              type="text"
              className="auth-input"
              placeholder="e.g. Software Engineer, Product Manager"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={handleGetSuggestions}
              disabled={suggestionsLoading || !profession.trim()}
            >
              {suggestionsLoading ? 'Loading…' : 'Get suggestions'}
            </button>
          </div>
          {suggestions && (
            <div className="pn-suggestions">
              <h3 className="pn-list-title">Key professionals to connect with</h3>
              <ul className="pn-list">
                {suggestions.suggestions.key_professionals.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="pn-list-title">Industries & organizations</h3>
              <ul className="pn-list">
                {suggestions.suggestions.industries_organizations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="pn-list-title">Platforms & events</h3>
              <ul className="pn-list">
                {suggestions.suggestions.networking_platforms_events.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="pn-list-title">Networking tips</h3>
              <ul className="pn-list">
                {suggestions.suggestions.effective_networking_tips.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tool-page-card">
          <h2 className="pn-section-title">Generate networking message</h2>
          <p className="pn-section-desc">Create a professional message for LinkedIn or email.</p>
          <div className="add-task-form-row">
            <label className="form-label">Their profession / role</label>
            <input
              type="text"
              className="auth-input"
              placeholder="e.g. Hiring Manager at Tech Co"
              value={targetProfession}
              onChange={(e) => setTargetProfession(e.target.value)}
            />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Your profession</label>
            <input
              type="text"
              className="auth-input"
              placeholder="e.g. Frontend Developer"
              value={userProfession}
              onChange={(e) => setUserProfession(e.target.value)}
            />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Context (optional)</label>
            <textarea
              className="auth-input"
              rows={2}
              placeholder="e.g. Met at conference, interested in open role"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="tts-actions" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={handleGenerateMessage}
              disabled={messageLoading || !targetProfession.trim() || !userProfession.trim()}
            >
              {messageLoading ? 'Generating…' : 'Generate message'}
            </button>
          </div>
          {generatedMessage && (
            <div className="pn-message-result">
              <h3 className="pn-list-title">Generated message</h3>
              <div className="pn-message-text">{generatedMessage}</div>
              <button
                type="button"
                className="btn-resume"
                style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  navigator.clipboard.writeText(generatedMessage);
                  toast.success('Copied to clipboard');
                }}
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProfessionalNetworkingPage() {
  return (
    <AuthWrapper>
      <ProfessionalNetworkingContent />
    </AuthWrapper>
  );
}
