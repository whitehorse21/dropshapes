'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';
import {
  buildCoverLetterPayload,
  defaultCoverLetterData,
  defaultProfile,
  defaultRecipient,
  defaultIntroduction,
  defaultClosing,
  defaultCoverStyle,
  type CoverLetterData,
} from '@/app/utils/coverLetterService';

interface ApiCoverLetter {
  id: number;
  cover_letter_title?: string;
  cover_letter_type?: string;
  cover_template_category?: string;
  profile?: Record<string, string> | null;
  recipient?: Record<string, string> | null;
  introduction?: { greet_text?: string; intro_para?: string } | null;
  body?: string | null;
  closing?: { text?: string } | null;
  cover_style?: { font?: string; color?: string } | null;
}

function mapApiToCoverLetterData(raw: ApiCoverLetter): CoverLetterData {
  return {
    id: raw.id,
    cover_letter_title: raw.cover_letter_title ?? '',
    cover_letter_type: raw.cover_letter_type ?? 'professional',
    cover_template_category: raw.cover_template_category ?? 'professional',
    profile: raw.profile ? { ...defaultProfile, ...raw.profile } : defaultProfile,
    recipient: raw.recipient ? { ...defaultRecipient, ...raw.recipient } : defaultRecipient,
    introduction: raw.introduction ? { ...defaultIntroduction, ...raw.introduction } : defaultIntroduction,
    body: raw.body ?? '',
    closing: raw.closing ? { ...defaultClosing, ...raw.closing } : defaultClosing,
    cover_style: raw.cover_style ? { ...defaultCoverStyle, ...raw.cover_style } : defaultCoverStyle,
  };
}

const COVER_TYPES = ['professional', 'academic', 'creative'] as const;
const PROFILE_KEYS = ['full_name', 'email', 'phone_number', 'location', 'linkedin_profile', 'portfolio_website'] as const;
const RECIPIENT_KEYS = ['company_name', 'hiring_manager_name', 'job_title', 'company_address'] as const;

function EditContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<CoverLetterData>(defaultCoverLetterData);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, '');
    axiosInstance
      .get<{ success: boolean; data: ApiCoverLetter }>(`${baseUrl}/${id}/`)
      .then((res) => {
        if (!cancelled && res.data?.data) {
          setData(mapApiToCoverLetterData(res.data.data));
          setLoadState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => { cancelled = true; };
  }, [id]);

  const update = (partial: Partial<CoverLetterData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      if (partial.profile) next.profile = { ...(prev.profile ?? defaultProfile), ...partial.profile };
      if (partial.recipient) next.recipient = { ...(prev.recipient ?? defaultRecipient), ...partial.recipient };
      if (partial.introduction) next.introduction = { ...(prev.introduction ?? defaultIntroduction), ...partial.introduction };
      if (partial.closing) next.closing = { ...(prev.closing ?? defaultClosing), ...partial.closing };
      if (partial.cover_style) next.cover_style = { ...(prev.cover_style ?? defaultCoverStyle), ...partial.cover_style };
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildCoverLetterPayload(data);
      const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, '');
      await axiosInstance.put(`${baseUrl}/${id}/`, payload);
      toast.success('Saved');
      router.push(`/cover-letters/preview/${id}`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <section id="view-cover-letter-edit" className="view-section active-view" aria-label="Edit cover letter">
        <div className="tool-page-wrap cover-letters-page">
          <p className="cl-loading">Loading…</p>
        </div>
      </section>
    );
  }

  if (loadState === 'error') {
    return (
      <section id="view-cover-letter-edit" className="view-section active-view" aria-label="Edit cover letter">
        <div className="tool-page-wrap cover-letters-page">
          <p className="cl-empty">Failed to load.</p>
          <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>
            Back
          </button>
        </div>
      </section>
    );
  }

  const profile = { ...defaultProfile, ...(data.profile ?? {}) };
  const recipient = { ...defaultRecipient, ...(data.recipient ?? {}) };
  const introduction = { ...defaultIntroduction, ...(data.introduction ?? {}) };
  const closing = { ...defaultClosing, ...(data.closing ?? {}) };

  return (
    <section id="view-cover-letter-edit" className="view-section active-view" aria-label="Edit cover letter">
      <div className="tool-page-wrap cover-letters-page">
        <div className="header-minimal">
          <h1>Edit cover letter</h1>
          <p>{data.cover_letter_title || 'Update your cover letter'}</p>
        </div>
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>
            ← Back to list
          </button>
          <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/preview/${id}`)}>
            Preview
          </button>
        </div>

        <form onSubmit={handleSave} className="tool-page-card cl-form">
          <div className="resume-step-card">
            <div className="resume-step-field">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="auth-input w-full"
                value={data.cover_letter_title ?? ''}
                onChange={(e) => update({ cover_letter_title: e.target.value })}
                required
              />
            </div>
            <div className="resume-step-field">
              <label className="form-label">Type</label>
              <select
                className="auth-input w-full"
                value={data.cover_letter_type ?? 'professional'}
                onChange={(e) => update({ cover_letter_type: e.target.value })}
              >
                {COVER_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="resume-step-section-title">Your details</h3>
          <div className="resume-step-card">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {PROFILE_KEYS.map((key) => (
                <div key={key} className="resume-step-field">
                  <label className="form-label">{key.replace(/_/g, ' ')}</label>
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    className="auth-input w-full"
                    value={(profile[key] ?? '') as string}
                    onChange={(e) => update({ profile: { ...profile, [key]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          <h3 className="resume-step-section-title">Recipient</h3>
          <div className="resume-step-card">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {RECIPIENT_KEYS.map((key) => (
                <div key={key} className="resume-step-field">
                  <label className="form-label">{key.replace(/_/g, ' ')}</label>
                  <input
                    type="text"
                    className="auth-input w-full"
                    value={(recipient[key] ?? '') as string}
                    onChange={(e) => update({ recipient: { ...recipient, [key]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          <h3 className="resume-step-section-title">Introduction</h3>
          <div className="resume-step-card">
            <div className="resume-step-field">
              <label className="form-label">Greeting</label>
              <input
                type="text"
                className="auth-input w-full"
                value={introduction.greet_text ?? ''}
                onChange={(e) => update({ introduction: { ...introduction, greet_text: e.target.value } })}
              />
            </div>
            <div className="resume-step-field">
              <label className="form-label">Intro paragraph</label>
              <textarea
                className="auth-input w-full"
                rows={3}
                value={introduction.intro_para ?? ''}
                onChange={(e) => update({ introduction: { ...introduction, intro_para: e.target.value } })}
              />
            </div>
          </div>

          <div className="resume-step-card">
            <div className="resume-step-field">
              <label className="form-label">Body</label>
              <textarea
                className="auth-input w-full"
                rows={8}
                value={data.body ?? ''}
                onChange={(e) => update({ body: e.target.value })}
              />
            </div>
          </div>

          <div className="resume-step-card">
            <div className="resume-step-field">
              <label className="form-label">Closing</label>
              <input
                type="text"
                className="auth-input w-full"
                value={closing.text ?? ''}
                onChange={(e) => update({ closing: { ...closing, text: e.target.value } })}
              />
            </div>
          </div>

          <div className="resume-step-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <button type="submit" className="btn-resume btn-resume-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/preview/${id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function EditCoverLetterPage() {
  return <EditContent />;
}
