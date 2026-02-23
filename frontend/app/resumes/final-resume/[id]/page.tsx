'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import {
  getResumeFromLocalDB,
  saveResumeData,
  updateResumeData,
  apiResumeToFormData,
  buildResumeCreatePayload,
  type ResumeData,
} from '@/app/utils/resumeService';
import { toast } from 'react-hot-toast';
import ResumeBodyContent from '@/app/resumes/components/ResumeBodyContent';

function FinalResumeContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const local = getResumeFromLocalDB();
    if (local?.id === Number(id)) {
      setResumeData(local);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await axiosInstance.get(`${endpoints.resumes}/${id}`);
        const normalized = apiResumeToFormData(res.data as Record<string, unknown>);
        setResumeData(normalized);
        saveResumeData(normalized);
        updateResumeData(normalized);
      } catch {
        toast.error('Resume not found');
        router.push('/resumes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleSaveDraft = async () => {
    const data = getResumeFromLocalDB() || resumeData;
    if (!data?.id) return;
    setSaving(true);
    try {
      const payload = buildResumeCreatePayload(data);
      await axiosInstance.put(`${endpoints.resumes}/${data.id}/update-structured`, payload);
      toast.success('Draft saved');
      setResumeData(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (resumeData?.id) {
      saveResumeData(resumeData);
      router.push(`/resumes/new/personal?redirect=final&id=${resumeData.id}`);
    }
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  const handleTitleChange = (value: string) => {
    if (!resumeData) return;
    const next = { ...resumeData, resume_title: value };
    setResumeData(next);
    updateResumeData(next);
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

  const pi = resumeData.personalInfo || {};
  const name = [pi.firstName, pi.lastName].filter(Boolean).join(' ') || 'Resume';
  const displayTitle = resumeData.resume_title || name;

  return (
    <section className="view-section active-view" aria-label="Resume">
      <div className="resume-preview-page">
        <header className="resume-no-print resume-preview-header">
          <div className="resume-preview-title-wrap">
            {editingTitle ? (
              <input
                type="text"
                className="auth-input resume-preview-title-input"
                value={resumeData.resume_title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                autoFocus
                aria-label="Resume title"
              />
            ) : (
              <h1
                className="resume-preview-title resume-preview-title-editable"
                onClick={() => setEditingTitle(true)}
                title="Click to edit title"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(true)}
              >
                {displayTitle}
              </h1>
            )}
          </div>
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
              <button type="button" className="btn-resume" onClick={handleEdit} aria-label="Edit resume in builder">
                Edit
              </button>
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
                onClick={handleSaveDraft}
                disabled={saving}
                aria-label={saving ? 'Saving' : 'Save draft'}
              >
                {saving ? 'Saving...' : 'Save draft'}
              </button>
            </div>
          </div>
        </header>

        <div className="resume-preview-body" ref={printRef}>
          <ResumeBodyContent resumeData={resumeData} />
        </div>
      </div>
    </section>
  );
}

export default function FinalResumePage() {
  return (
    <AuthWrapper>
      <FinalResumeContent />
    </AuthWrapper>
  );
}
