'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { apiResumeToFormData, type ResumeData } from '@/app/utils/resumeService';
import ResumeBodyContent from '@/app/resumes/components/ResumeBodyContent';

function PreviewContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`${endpoints.resumes}/${id}`);
        setResumeData(apiResumeToFormData(res.data as Record<string, unknown>));
      } catch {
        router.push('/resumes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (loading || !resumeData) {
    return (
      <section className="view-section active-view" aria-label="Loading resume">
        <div className="resume-preview-loading">
          <div className="resume-preview-loading-spinner" aria-hidden="true" />
          <p className="resume-preview-loading-text">Loading resume...</p>
        </div>
      </section>
    );
  }

  const pageTitle = resumeData.resume_title || 'Resume Preview';

  return (
    <section className="view-section active-view" aria-label="Resume preview">
      <div className="resume-preview-page">
        <header className="resume-no-print resume-preview-header">
          <h1 className="resume-preview-title">{pageTitle}</h1>
          <div className="resume-preview-toolbar">
            <div className="resume-preview-toolbar-left">
              <button
                type="button"
                className="btn-resume"
                onClick={() => router.push('/resumes')}
                aria-label="Back to resumes list"
              >
                ← Back to list
              </button>
            </div>
            <div className="resume-preview-toolbar-right">
              <button
                type="button"
                className="btn-resume"
                onClick={handlePrint}
                aria-label="Print or save as PDF"
              >
                Print / Save as PDF
              </button>
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={() => router.push(`/resumes/final-resume/${id}`)}
                aria-label="Edit this resume"
              >
                Edit resume
              </button>
            </div>
          </div>
        </header>

        <div className="resume-preview-body">
          <ResumeBodyContent resumeData={resumeData} />
        </div>
      </div>
    </section>
  );
}

export default function PreviewPage() {
  return (
    <AuthWrapper>
      <PreviewContent />
    </AuthWrapper>
  );
}
