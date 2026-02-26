'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import { useAuth } from '@/app/context/AuthContext';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';
import { resumeTemplates } from './templateList';
import { clearResumeData, updateResumeData, defaultResumeData } from '@/app/utils/resumeService';

interface ResumeListItem {
  id: number;
  resume_title?: string;
  updated_at?: string;
  created_at?: string;
  template_category?: string;
}

function ResumesPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string | null>(null);

  const templateCategories = useMemo(() => {
    const cats = Array.from(new Set(resumeTemplates.map((t) => t.category)));
    return [{ key: null, label: 'All templates', count: resumeTemplates.length }, ...cats.map((c) => ({ key: c, label: c, count: resumeTemplates.filter((t) => t.category === c).length }))];
  }, []);

  const filteredTemplates = useMemo(
    () => (selectedTemplateCategory ? resumeTemplates.filter((t) => t.category === selectedTemplateCategory) : resumeTemplates),
    [selectedTemplateCategory]
  );

  const handleUseTemplate = (template: import('./templateList').ResumeTemplateOption) => {
    clearResumeData();
    updateResumeData({
      ...defaultResumeData,
      template_category: template.id,
      resume_type: template.category,
    });
    router.push('/resumes/new/profession');
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(endpoints.resumes, { params: { limit: 50 } });
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setResumes(data);
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number }; message?: string };
      if (axErr.response?.status === 401) {
        router.push('/');
        return;
      }
      setError('Failed to load resumes. Please try again.');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchResumes();
    else setLoading(false);
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchResumes();
    setRefreshing(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeletingId(resumeId);
    try {
      await axiosInstance.delete(`${endpoints.resumes}/${resumeId}`);
      toast.success('Resume deleted');
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch {
      toast.error('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicatingId(resumeId);
    try {
      const res = await axiosInstance.get(`${endpoints.resumes}/${resumeId}`);
      const { apiResumeToFormData, buildResumeCreatePayload } = await import('@/app/utils/resumeService');
      const formData = apiResumeToFormData(res.data as Record<string, unknown>);
      const payload = buildResumeCreatePayload({ ...formData, id: undefined, resume_title: `${formData.resume_title || 'Resume'} (copy)` });
      const createRes = await axiosInstance.post(`${endpoints.resumes}/json`, payload);
      const created = createRes.data as { id?: number };
      if (created?.id) {
        toast.success('Resume duplicated');
        await fetchResumes();
      } else {
        toast.error('Failed to duplicate resume');
      }
    } catch {
      toast.error('Failed to duplicate resume');
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <section id="view-resumes" className="view-section active-view" aria-label="Resumes">
      <div className="resumes-page-content">
        <header className="header-minimal">
          <h1>My Resumes</h1>
          <p>Create and manage your resumes</p>
        </header>
        <div className="resumes-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')}>
            ← Back to Home
          </button>
          <button type="button" className="btn-resume" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="resumes-page-actions resumes-page-actions--center">
          <button
            type="button"
            className="btn-resume btn-resume-primary"
            onClick={() => router.push('/resumes/new')}
            aria-label="Create new resume"
          >
            Create New Resume
          </button>
        </div>

        {loading ? (
          <div className="resumes-loading" style={{ color: 'var(--text-secondary)' }}>
            Loading your resumes...
          </div>
        ) : error ? (
          <div className="resumes-error">{error}</div>
        ) : resumes.length === 0 ? (
          <div className="resumes-empty-state">
            <p>No resumes yet</p>
            <p>Create a professional resume by choosing a template and filling in your details.</p>
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={() => router.push('/resumes/new')}
            >
              Create your first resume
            </button>
          </div>
        ) : (
          <div className="resumes-list-grid">
            {[...resumes]
              .sort((a, b) => new Date((b.updated_at || b.created_at || 0) as string).getTime() - new Date((a.updated_at || a.created_at || 0) as string).getTime())
              .map((resume) => (
                <article key={resume.id} className="resumes-list-card">
                  <h3>{resume.resume_title || `Resume #${resume.id}`}</h3>
                  <div className="resumes-list-card-meta">
                    {resume.template_category && (
                      <span style={{ display: 'block', marginBottom: '0.25rem' }}>{resume.template_category}</span>
                    )}
                    <span>Updated {formatDate(resume.updated_at)}</span>
                  </div>
                  <div className="resumes-list-card-actions">
                    <button
                      type="button"
                      className="btn-resume"
                      onClick={() => router.push(`/resumes/final-resume/${resume.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-resume"
                      onClick={() => router.push(`/resumes/preview/${resume.id}`)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className="btn-resume"
                      onClick={(e) => handleDuplicate(resume.id, e)}
                      disabled={duplicatingId === resume.id}
                    >
                      {duplicatingId === resume.id ? 'Duplicating...' : 'Duplicate'}
                    </button>
                    <button
                      type="button"
                      className="btn-resume btn-resume-danger"
                      onClick={(e) => handleDelete(resume.id, e)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}

        {/* Template selection — same as old frontend, UI matches this app */}
        <div className="resumes-templates-section" style={{ marginTop: '2.5rem' }}>
          <header className="header-minimal" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Resume templates</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Choose a template to start a new resume.
            </p>
          </header>
          <div className="resumes-template-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {templateCategories.map((cat) => (
              <button
                key={cat.key ?? 'all'}
                type="button"
                className="btn-resume"
                style={{
                  ...(selectedTemplateCategory === cat.key || (selectedTemplateCategory === null && cat.key === null)
                    ? { background: 'var(--accent)', color: 'var(--bg)' }
                    : {}),
                }}
                onClick={() => setSelectedTemplateCategory(cat.key)}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
          <div
            className="resumes-templates-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredTemplates.map((template) => (
              <article
                key={template.id}
                className="resumes-list-card resumes-template-card"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {template.thumbnail ? (
                  <div className="resumes-template-card-thumb">
                    <img src={template.thumbnail} alt="" />
                  </div>
                ) : null}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{template.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {template.description}
                  </p>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent)',
                    }}
                  >
                    {template.category}
                  </span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-resume btn-resume-primary"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use template
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResumesPage() {
  return (
    <AuthWrapper>
      <ResumesPageContent />
    </AuthWrapper>
  );
}
