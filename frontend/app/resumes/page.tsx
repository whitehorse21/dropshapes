'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import { useAuth } from '@/app/context/AuthContext';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';

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
