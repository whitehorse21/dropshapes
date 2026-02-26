'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
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
  const resumeContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeContentRef,
    documentTitle: resumeData?.resume_title || 'Resume',
    copyStyles: true,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-tpl-container {
        width: 100% !important; max-width: 8.27in !important; min-height: 11.7in !important;
        margin: 0 !important; padding: 0.5in !important; box-shadow: none !important;
        background: #fff !important; color: #000 !important;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .resume-tpl-content-with-sidebar {
        display: flex !important; flex-direction: row !important;
        gap: 16px !important; width: 100% !important;
      }
      .resume-tpl-sidebar {
        width: 30% !important; min-width: 30% !important; flex-shrink: 0 !important;
        padding: 12px !important; box-sizing: border-box !important;
      }
      .resume-tpl-main { flex: 1 !important; min-width: 0 !important; padding: 0 !important; }
      .resume-tpl-section-title { font-weight: 700; border-bottom: 1px solid #d9d9d9; padding-bottom: 4px; margin: 0 0 8px; }
      .resume-tpl-section { margin-bottom: 16px; }
      .resume-tpl-item { margin-top: 8px; }
      .resume-tpl-header-info h1 { margin: 0; font-weight: 700; }
      .resume-tpl-contact-inline, .resume-tpl-contact-inline-inner { display: flex; flex-wrap: wrap; gap: 12px; }
      .resume-tpl-skills-list, .resume-tpl-languages-list { display: flex; flex-direction: column; gap: 6px; }
      .resume-tpl-skill-bar, .resume-tpl-language-bar { background: #f1f3f5; border-radius: 4px; height: 8px; margin-top: 2px; overflow: hidden; }
      .resume-tpl-tags { display: flex; flex-wrap: wrap; gap: 6px; }
      .resume-tpl-list { margin: 4px 0 0; padding-left: 18px; }
    `,
  });

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

  const handleTitleChange = (value: string) => {
    if (!resumeData) return;
    const next = { ...resumeData, resume_title: value };
    setResumeData(next);
    updateResumeData(next);
  };

  if (loading || !resumeData) {
    return (
      <section
        id="view-final-resume"
        className="view-section active-view"
        aria-label="Loading resume"
      >
        <div className="resumes-page-content">
          <div className="resume-preview-loading">
            <div className="resume-preview-loading-spinner" aria-hidden="true" />
            <p className="resume-preview-loading-text">Loading resume...</p>
          </div>
        </div>
      </section>
    );
  }

  const pi = resumeData.personalInfo || {};
  const name = [pi.firstName, pi.lastName].filter(Boolean).join(' ') || 'Resume';
  const displayTitle = resumeData.resume_title || name;

  return (
    <section
      id="view-final-resume"
      className="view-section active-view"
      aria-label="Resume"
    >
      <div className="resumes-page-content">
        <header className="resume-no-print header-minimal">
          {editingTitle ? (
            <input
              type="text"
              className="resume-preview-title-input"
              value={resumeData.resume_title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              aria-label="Resume title"
            />
          ) : (
            <h1
              className="resume-preview-title-editable"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(true)}
            >
              {displayTitle}
            </h1>
          )}
          <p>View, edit, and export your resume</p>
        </header>

        <div className="resume-preview-toolbar resume-no-print">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push('/resumes')}
            aria-label="Back to resumes list"
          >
            ← Back to list
          </button>
          <button
            type="button"
            className="btn-resume"
            onClick={handleEdit}
            aria-label="Edit resume in builder"
          >
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

        <div className="resume-preview-body">
          <ResumeBodyContent ref={resumeContentRef} resumeData={resumeData} />
        </div>
      </div>
    </section>
  );
}

export default function FinalResumePage() {
  return <FinalResumeContent />;
}
