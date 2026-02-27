'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { $coverLetter } from '@/app/utils/coverLetterObservable';
import {
  getCoverLetterFromLocalDB,
  defaultCoverLetterData,
  buildCoverLetterPayload,
  updateCoverLetterData,
} from '@/app/utils/coverLetterService';
import type { CoverLetterData } from '@/app/utils/coverLetterService';
import { createSteps } from '@/app/cover-letters/createSteps';
import CoverLetterTemplateRenderer from '@/app/cover-letters/templates';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';
import { Loader, X } from 'lucide-react';

const COVER_LETTER_STORAGE_KEY = 'coverLetterData';

export default function CreateCoverLetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const currentStep = (params?.step as string) || 'profession';

  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>(() => {
    if (typeof window === 'undefined') return defaultCoverLetterData;
    const stored = getCoverLetterFromLocalDB();
    return stored && Object.keys(stored).length > 0
      ? { ...defaultCoverLetterData, ...stored }
      : defaultCoverLetterData;
  });
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(COVER_LETTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<CoverLetterData>;
        if (parsed && Object.keys(parsed).length > 0) {
          const merged = { ...defaultCoverLetterData, ...parsed };
          $coverLetter.next(merged);
          setCoverLetterData(merged);
          return;
        }
      } catch {
        // ignore
      }
    }
    updateCoverLetterData(defaultCoverLetterData);
  }, []);

  useEffect(() => {
    const sub = $coverLetter.subscribe((data) => {
      setCoverLetterData(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(COVER_LETTER_STORAGE_KEY, JSON.stringify(data));
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const getCurrentStepIndex = () =>
    createSteps.findIndex((s) => s.name === currentStep);
  const isFirstStep = getCurrentStepIndex() === 0;
  const isLastStep = getCurrentStepIndex() === createSteps.length - 1;

  const handleNext = () => {
    const idx = getCurrentStepIndex();
    if (idx < createSteps.length - 1) {
      router.push(`/cover-letters/create/${createSteps[idx + 1].name}`);
    }
  };

  const handlePrevious = () => {
    const idx = getCurrentStepIndex();
    if (idx > 0) {
      router.push(`/cover-letters/create/${createSteps[idx - 1].name}`);
    } else {
      router.push('/cover-letters/new');
    }
  };

  const handleSubmitCoverLetter = async () => {
    const data = $coverLetter.getValue();
    const payload = buildCoverLetterPayload({
      ...defaultCoverLetterData,
      ...data,
    });
    const hasId = data?.id && String(data.id).trim() !== '';

    try {
      setSubmitting(true);
      const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, '');
      if (hasId) {
        await axiosInstance.put(`${baseUrl}/${data!.id}/`, payload);
        toast.success('Cover letter updated!');
        router.push(`/cover-letters/preview/${data!.id}`);
        return;
      }
      const res = await axiosInstance.post(`${baseUrl}/`, payload);
      const body = res.data as { data?: { id?: number }; id?: number };
      const newId = body?.data?.id ?? body?.id;
      if (newId) {
        const updated = { ...data, id: newId } as CoverLetterData;
        $coverLetter.next(updated);
        toast.success('Draft saved!');
        router.push(`/cover-letters/preview/${newId}`);
        return;
      }
      router.push('/cover-letters');
    } catch (error) {
      console.error(error);
      toast.error('Error saving cover letter');
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = getCurrentStepIndex();
  if (stepIndex < 0) {
    return (
      <div className="cover-letter-create min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Invalid step.</p>
          <Link
            href="/cover-letters/new"
            className="cover-letter-create__nav-btn cover-letter-create__nav-btn--next mt-4 inline-block"
          >
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cover-letter-create">
      <aside className="cover-letter-create__sidebar" aria-label="Steps">
        <p className="cover-letter-create__step-indicator">
          STEP {stepIndex + 1} OF {createSteps.length}
        </p>
        <Link
          href="/cover-letters/new"
          className="cover-letter-create__sidebar-back"
          aria-label="Back to templates"
        >
          <span className="cover-letter-create__sidebar-back-arrow" aria-hidden>←</span>
          <span>Back</span>
        </Link>
        <nav className="cover-letter-create__steps" aria-label="Steps">
          {createSteps.map(({ name, label }, index) => {
            const isActive = name === currentStep;
            const isCompleted = stepIndex > index;
            const stepNumClass =
              isActive
                ? 'cover-letter-create__step-num cover-letter-create__step-num--active'
                : isCompleted
                  ? 'cover-letter-create__step-num cover-letter-create__step-num--done'
                  : 'cover-letter-create__step-num cover-letter-create__step-num--pending';
            const stepCardClass =
              isActive
                ? 'cover-letter-create__step-card cover-letter-create__step-card--active'
                : 'cover-letter-create__step-card';
            return (
              <button
                key={name}
                type="button"
                onClick={() => router.push(`/cover-letters/create/${name}`)}
                className={stepCardClass}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${label}${isCompleted ? ', completed' : ''}`}
              >
                <span className={stepNumClass}>{index + 1}</span>
                <span className="cover-letter-create__step-label">{label}</span>
              </button>
            );
          })}
        </nav>

        <aside className="cover-letter-create__preview" aria-label="Preview">
          <div className="cover-letter-create__preview-card">
            <p className="cover-letter-create__preview-label">Preview</p>
            <div
              className="cover-letter-create__preview-viewport"
              aria-hidden
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowFullPreview(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowFullPreview(true)}
                className="cover-letter-create__preview-panel cover-letter-create__preview-paper origin-top-left overflow-hidden rounded-lg cursor-pointer"
                style={{
                  transform: 'scale(var(--preview-scale, 0.314))',
                  transformOrigin: 'top left',
                  width: 'calc(100% / var(--preview-scale, 0.314))',
                }}
              >
                <CoverLetterTemplateRenderer data={coverLetterData} />
              </div>
            </div>
            <p className="cover-letter-create__preview-hint">Click to expand</p>
          </div>
        </aside>
      </aside>

      <div className="cover-letter-create__content">
        <main className="cover-letter-create__main">
          <div className="cover-letter-create__card">
            <h2 className="cover-letter-create__card-title">
              {createSteps.find((s) => s.name === currentStep)?.label}
            </h2>
            {children}
            <div className="cover-letter-create__nav">
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="cover-letter-create__nav-btn cover-letter-create__nav-btn--prev"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="cover-letter-create__nav-btn cover-letter-create__nav-btn--next"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitCoverLetter}
                  disabled={submitting}
                  className="cover-letter-create__nav-btn cover-letter-create__nav-btn--finish"
                >
                  {submitting ? <Loader className="inline w-5 h-5 animate-spin" aria-hidden /> : 'Finish'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {showFullPreview && (
        <div
          className="cover-letter-create__fullscreen-overlay"
          onClick={() => setShowFullPreview(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full screen preview"
        >
          <button
            type="button"
            className="cover-letter-create__fullscreen-close"
            onClick={() => setShowFullPreview(false)}
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="cover-letter-create__fullscreen-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cover-letter-create__modal-template-wrap">
              <CoverLetterTemplateRenderer data={coverLetterData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
