'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';

function EditContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    axiosInstance.get<{ success: boolean; data: { cover_letter_title?: string; body?: string } }>(`${ApiEndpoints.coverLetters.replace(/\/$/, '')}/${id}`)
      .then((res) => {
        if (!cancelled) {
          setTitle(res.data.data?.cover_letter_title || '');
          setBody(res.data.data?.body || '');
          setLoadState('ready');
        }
      })
      .catch(() => { if (!cancelled) setLoadState('error'); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(`${ApiEndpoints.coverLetters.replace(/\/$/, '')}/${id}`, {
        cover_letter_title: title,
        body: body || undefined,
      });
      toast.success('Saved');
      router.push(`/cover-letters/preview/${id}`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (loadState === 'loading') return <div className="tool-page-wrap"><p className="cl-loading">Loading…</p></div>;
  if (loadState === 'error') return <div className="tool-page-wrap"><p className="cl-empty">Failed to load.</p><button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>Back</button></div>;

  return (
    <section id="view-cover-letter-edit" className="view-section active-view" aria-label="Edit cover letter">
      <div className="tool-page-wrap">
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>← Back to list</button>
          <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/preview/${id}`)}>Preview</button>
        </div>
        <form onSubmit={handleSave} className="tool-page-card cl-form">
          <div className="add-task-form-row">
            <label className="form-label">Title</label>
            <input type="text" className="auth-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Body</label>
            <textarea className="auth-input" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="tts-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn-resume btn-resume-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/preview/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function EditCoverLetterPage() {
  return (
    <AuthWrapper>
      <EditContent />
    </AuthWrapper>
  );
}
