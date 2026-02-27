'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  getCoverLetterFromLocalDB,
  updateCoverLetterData,
  defaultCoverLetterData,
  saveCoverLetterData,
  buildCoverLetterPayload,
  clearCoverLetterData,
  type CoverLetterData,
} from '@/app/utils/coverLetterService';
import { coverLetterSteps } from '@/app/cover-letters/coverLetterSteps';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';
import CoverLetterTemplateRenderer from '@/app/cover-letters/templates';

export default function CoverLetterStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const step = params?.step as string;

  const [coverData, setCoverData] = useState<CoverLetterData>(defaultCoverLetterData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const stored = getCoverLetterFromLocalDB();
    if (stored) setCoverData(stored);
  }, [step]);

  const currentIndex = coverLetterSteps.findIndex((s) => s.name === step);
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex === coverLetterSteps.length - 1;

  const getDataForValidation = (): CoverLetterData => {
    const stored = getCoverLetterFromLocalDB();
    const base = defaultCoverLetterData;
    const merged = stored
      ? { ...base, ...stored }
      : { ...base, ...coverData };
    return merged;
  };

  const validateCurrentStep = (): string | null => {
    const data = getDataForValidation();

    switch (step) {
      case 'details': {
        const title = (data.cover_letter_title ?? '').toString().trim();
        if (!title) return 'Please enter a cover letter title.';
        const name = (data.profile?.full_name ?? '').toString().trim();
        const email = (data.profile?.email ?? '').toString().trim();
        if (!name) return 'Please enter your full name in Your Details.';
        if (!email) return 'Please enter your email in Your Details.';
        return null;
      }
      case 'recipient': {
        const company = (data.recipient?.company_name ?? '').toString().trim();
        if (!company) return 'Please enter the company name.';
        return null;
      }
      case 'content':
        return null;
      case 'preview':
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) {
      toast.error(error);
      return;
    }
    if (currentIndex < coverLetterSteps.length - 1) {
      router.push(`/cover-letters/new/${coverLetterSteps[currentIndex + 1].name}`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      router.push(`/cover-letters/new/${coverLetterSteps[currentIndex - 1].name}`);
    } else {
      router.push('/cover-letters/new');
    }
  };

  const handleCreate = async () => {
    if (isSubmitting) return;

    const stored = getCoverLetterFromLocalDB();
    const source = (stored ?? coverData) as CoverLetterData;
    const data: CoverLetterData = {
      ...defaultCoverLetterData,
      ...source,
    };

    if (!(data.cover_letter_title ?? '').trim()) {
      toast.error('Please enter a cover letter title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildCoverLetterPayload(data);
      const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, '');
      const res = await axiosInstance.post(`${baseUrl}/`, payload);
      const body = res.data as { id?: number; data?: { id?: number } };
      const createdId = body?.id ?? body?.data?.id;
      if (createdId) {
        clearCoverLetterData();
        toast.success('Cover letter created!');
        router.push(`/cover-letters/preview/${createdId}`);
      } else {
        console.error('Create cover letter: unexpected response', res.data);
        toast.error('Unexpected response from server. Please try again.');
      }
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { detail?: string | string[] }; status?: number };
        message?: string;
      };
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.join(', ')
        : typeof detail === 'string'
          ? detail
          : err.message || 'Failed to create cover letter';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData = ((): CoverLetterData => {
    const stored = getCoverLetterFromLocalDB();
    if (!stored) return coverData;
    return { ...defaultCoverLetterData, ...stored };
  })();

  if (currentIndex < 0) {
    return (
      <div className="view-section active-view" style={{ padding: '24px' }}>
        <p>Invalid step.</p>
        <Link
          href="/cover-letters/new"
          className="btn-resume"
          style={{ display: 'inline-flex', marginTop: '12px' }}
        >
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="view-section active-view resume-step-layout cover-letter-step-layout">
      <aside className="resume-step-aside">
        <div className="resume-step-progress" aria-live="polite">
          Step {currentIndex + 1} of {coverLetterSteps.length}
        </div>
        <button type="button" className="btn-resume resume-step-back" onClick={handlePrev}>
          ← Back
        </button>
        <nav className="resume-step-nav" aria-label="Cover letter steps">
          {coverLetterSteps.map((s, i) => {
            const isActive = s.name === step;
            const isDone = i < currentIndex;
            return (
              <button
                key={s.name}
                type="button"
                className={`resume-step-nav-btn ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                onClick={() => router.push(`/cover-letters/new/${s.name}`)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="resume-step-nav-num">{i + 1}</span>
                <span className="resume-step-nav-label">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="resume-step-main">
        <div className="resume-step-body">{children}</div>
        <div className="resume-step-footer">
          {!isFirstStep ? (
            <button type="button" className="btn-resume" onClick={handlePrev}>
              Previous
            </button>
          ) : (
            <span />
          )}
          <div className="resume-step-footer-actions">
            <button
              type="button"
              className="btn-resume"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            {!isLastStep ? (
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={handleCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Cover Letter'}
              </button>
            )}
          </div>
        </div>
      </main>

      {showPreview && (
        <div
          className="resume-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Cover letter preview"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="resume-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-preview-header">
              <h3>Preview</h3>
              <button
                type="button"
                className="resume-preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <CoverLetterTemplateRenderer data={previewData} />
          </div>
        </div>
      )}
    </div>
  );
}
