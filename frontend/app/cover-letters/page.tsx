'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';

interface CoverLetter {
  id: number;
  cover_letter_title: string;
  cover_letter_type?: string;
  cover_template_category?: string;
  recipient?: { company_name?: string; job_title?: string; hiring_manager_name?: string };
  created_at?: string;
  updated_at?: string;
}

function CoverLettersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<CoverLetter[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<{ success: boolean; data: CoverLetter[] }>(ApiEndpoints.coverLetters);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load cover letters');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this cover letter?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.coverLetters.replace(/\/$/, '')}/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

  return (
    <section id="view-cover-letters" className="view-section active-view" aria-label="Cover Letters">
      <div className="tool-page-wrap cover-letters-page">
        <div className="header-minimal">
          <h1>Cover Letters</h1>
          <p>Create and manage your cover letters.</p>
        </div>
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
          <Link href="/cover-letters/new" className="btn-resume btn-resume-primary">
            New cover letter
          </Link>
        </div>

        <div className="tool-page-card">
          {loading ? (
            <p className="cl-loading">Loading cover letters…</p>
          ) : list.length === 0 ? (
            <p className="cl-empty">No cover letters yet. Create one to get started.</p>
          ) : (
            <ul className="cl-list">
              {list.map((letter) => (
                <li key={letter.id} className="cl-card">
                  <div className="cl-card-main">
                    <h3 className="cl-card-title">{letter.cover_letter_title || 'Untitled'}</h3>
                    <p className="cl-card-meta">
                      {letter.recipient?.company_name && <span>{letter.recipient.company_name}</span>}
                      {letter.recipient?.job_title && <span> • {letter.recipient.job_title}</span>}
                      {letter.cover_template_category && <span> • {letter.cover_template_category}</span>}
                    </p>
                    <p className="cl-card-date">Updated {formatDate(letter.updated_at || letter.created_at)}</p>
                  </div>
                  <div className="cl-card-actions">
                    <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/preview/${letter.id}`)}>
                      Preview
                    </button>
                    <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/edit/${letter.id}`)}>
                      Edit
                    </button>
                    <button type="button" className="btn-resume btn-resume-danger" onClick={() => handleDelete(letter.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CoverLettersPage() {
  return (
    <CoverLettersContent />
  );
}
