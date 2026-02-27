'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getCoverLetterFromLocalDB,
  updateCoverLetterData,
  defaultCoverLetterData,
  defaultProfile,
  defaultRecipient,
  defaultIntroduction,
  defaultClosing,
  defaultCoverStyle,
  type CoverLetterData,
} from '@/app/utils/coverLetterService';
import { coverLetterSteps } from '@/app/cover-letters/coverLetterSteps';
import CoverLetterTemplateRenderer from '@/app/cover-letters/templates';

const COVER_TYPES = ['professional', 'academic', 'creative'] as const;

export default function CoverLetterStepPage() {
  const params = useParams();
  const step = params?.step as string;
  const [coverData, setCoverData] = useState<CoverLetterData | null>(null);

  useEffect(() => {
    const stored = getCoverLetterFromLocalDB();
    if (stored) {
      setCoverData({
        ...defaultCoverLetterData,
        ...stored,
        profile: { ...defaultProfile, ...(stored.profile ?? {}) },
        recipient: { ...defaultRecipient, ...(stored.recipient ?? {}) },
        introduction: { ...defaultIntroduction, ...(stored.introduction ?? {}) },
        closing: { ...defaultClosing, ...(stored.closing ?? {}) },
      });
    } else {
      setCoverData({ ...defaultCoverLetterData });
    }
  }, [step]);

  const raw = coverData ?? defaultCoverLetterData;
  const data: CoverLetterData = {
    ...defaultCoverLetterData,
    ...raw,
    profile: { ...defaultProfile, ...(raw?.profile ?? {}) },
    recipient: { ...defaultRecipient, ...(raw?.recipient ?? {}) },
    introduction: { ...defaultIntroduction, ...(raw?.introduction ?? {}) },
    closing: { ...defaultClosing, ...(raw?.closing ?? {}) },
    cover_style: { ...defaultCoverStyle, ...(raw?.cover_style ?? {}) },
  };

  const sync = (partial: Partial<CoverLetterData>) => {
    const next = { ...data, ...partial };
    if (partial.profile) next.profile = { ...(data.profile ?? defaultProfile), ...partial.profile };
    if (partial.recipient) next.recipient = { ...(data.recipient ?? defaultRecipient), ...partial.recipient };
    if (partial.introduction) next.introduction = { ...(data.introduction ?? defaultIntroduction), ...partial.introduction };
    if (partial.closing) next.closing = { ...(data.closing ?? defaultClosing), ...partial.closing };
    if (partial.cover_style) next.cover_style = { ...(data.cover_style ?? defaultCoverStyle), ...partial.cover_style };
    setCoverData(next);
    updateCoverLetterData(next);
  };

  if (!coverLetterSteps.some((s) => s.name === step)) {
    return (
      <div className="resume-step-content">
        <p className="resume-step-subtitle">Invalid step.</p>
      </div>
    );
  }

  // —— Details (title, type, your details) ——
  if (step === 'details') {
    const profile = { ...defaultProfile, ...(data.profile ?? {}) };
    const profileKeys = ['full_name', 'email', 'phone_number', 'location', 'linkedin_profile', 'portfolio_website'] as const;
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Title & Your Details</h2>
          <p className="resume-step-subtitle">Give your cover letter a title and add your contact information.</p>
        </div>
        <div className="resume-step-card">
          <div className="resume-step-field">
            <label className="form-label">Cover letter title</label>
            <input
              type="text"
              className="auth-input w-full"
              placeholder="e.g. Software Engineer at Acme Inc"
              value={data.cover_letter_title ?? ''}
              onChange={(e) => sync({ cover_letter_title: e.target.value })}
            />
          </div>
          <div className="resume-step-field">
            <label className="form-label">Type</label>
            <select
              className="auth-input w-full"
              value={data.cover_letter_type ?? 'professional'}
              onChange={(e) => sync({ cover_letter_type: e.target.value })}
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
            {profileKeys.map((key) => (
              <div key={key} className="resume-step-field">
                <label className="form-label">{key.replace(/_/g, ' ')}</label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  className="auth-input w-full"
                  value={(profile[key] ?? '') as string}
                  onChange={(e) => sync({ profile: { ...profile, [key]: e.target.value } })}
                  placeholder={key === 'email' ? 'you@example.com' : ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // —— Recipient ——
  if (step === 'recipient') {
    const recipient = { ...defaultRecipient, ...(data.recipient ?? {}) };
    const recipientKeys = ['company_name', 'hiring_manager_name', 'job_title', 'company_address'] as const;
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Recipient</h2>
          <p className="resume-step-subtitle">Who is this cover letter for?</p>
        </div>
        <div className="resume-step-card">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {recipientKeys.map((key) => (
              <div key={key} className="resume-step-field">
                <label className="form-label">{key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  className="auth-input w-full"
                  value={(recipient[key] ?? '') as string}
                  onChange={(e) => sync({ recipient: { ...recipient, [key]: e.target.value } })}
                  placeholder={key === 'company_address' ? 'Street, City, State, ZIP' : ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // —— Content (intro, body, closing) ——
  if (step === 'content') {
    const intro = { ...defaultIntroduction, ...(data.introduction ?? {}) };
    const closing = { ...defaultClosing, ...(data.closing ?? {}) };
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Content</h2>
          <p className="resume-step-subtitle">Write your greeting, introduction, main body, and closing.</p>
        </div>
        <div className="resume-step-card">
          <div className="resume-step-field">
            <label className="form-label">Greeting</label>
            <input
              type="text"
              className="auth-input w-full"
              placeholder="Dear Hiring Manager,"
              value={intro.greet_text ?? ''}
              onChange={(e) => sync({ introduction: { ...intro, greet_text: e.target.value } })}
            />
          </div>
          <div className="resume-step-field">
            <label className="form-label">Intro paragraph</label>
            <textarea
              className="auth-input w-full"
              rows={3}
              placeholder="Brief introduction and why you're applying"
              value={intro.intro_para ?? ''}
              onChange={(e) => sync({ introduction: { ...intro, intro_para: e.target.value } })}
            />
          </div>
        </div>
        <div className="resume-step-card">
          <div className="resume-step-field">
            <label className="form-label">Body</label>
            <textarea
              className="auth-input w-full"
              rows={8}
              placeholder="Main content: your experience, skills, and why you're a fit"
              value={data.body ?? ''}
              onChange={(e) => sync({ body: e.target.value })}
            />
          </div>
        </div>
        <div className="resume-step-card">
          <div className="resume-step-field">
            <label className="form-label">Closing</label>
            <input
              type="text"
              className="auth-input w-full"
              placeholder="Sincerely,"
              value={closing.text ?? ''}
              onChange={(e) => sync({ closing: { ...closing, text: e.target.value } })}
            />
          </div>
        </div>
      </div>
    );
  }

  // —— Preview ——
  if (step === 'preview') {
    const stored = getCoverLetterFromLocalDB();
    const rawPreview = stored ?? data;
    const previewData: CoverLetterData = {
      ...defaultCoverLetterData,
      ...rawPreview,
      profile: { ...defaultProfile, ...(rawPreview?.profile ?? {}) },
      recipient: { ...defaultRecipient, ...(rawPreview?.recipient ?? {}) },
      introduction: { ...defaultIntroduction, ...(rawPreview?.introduction ?? {}) },
      closing: { ...defaultClosing, ...(rawPreview?.closing ?? {}) },
      cover_style: { ...defaultCoverStyle, ...(rawPreview?.cover_style ?? {}) },
    };
    return (
      <div className="resume-step-content cover-letter-preview-step">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Preview</h2>
          <p className="resume-step-subtitle">Review your cover letter below. Click Create Cover Letter to save.</p>
        </div>
        <div className="cover-letter-preview-document">
          <CoverLetterTemplateRenderer data={previewData} />
        </div>
      </div>
    );
  }

  return null;
}
