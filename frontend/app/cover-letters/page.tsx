'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';
import CoverLetterCard from '@/app/cover-letters/components/CoverLetterCard';
import {
  buildCoverLetterPayload,
  defaultCoverLetterData,
  type CoverLetterData,
} from '@/app/utils/coverLetterService';
import { Plus } from 'lucide-react';

interface CoverLetter {
  id: number;
  cover_letter_title?: string;
  cover_letter_type?: string;
  cover_template_category?: string;
  status?: string;
  recipient?: {
    company_name?: string;
    job_title?: string;
    hiring_manager_name?: string;
  };
  introduction?: { greet_text?: string; intro_para?: string };
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

function CoverLettersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<CoverLetter[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<{ success: boolean; data: CoverLetter[] }>(ApiEndpoints.coverLetters);
      setList(res.data?.data ?? []);
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

  const handleView = (id: number) => {
    router.push(`/cover-letters/preview/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/cover-letters/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this cover letter?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.coverLetters.replace(/\/$/, '')}/${id}/`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, '');
      const res = await axiosInstance.get<{ success: boolean; data: Record<string, unknown> }>(`${baseUrl}/${id}/`);
      const letter = res.data?.data;
      if (!letter || typeof letter !== 'object') {
        toast.error('Could not load cover letter to duplicate');
        return;
      }
      const normalized: CoverLetterData = {
        ...defaultCoverLetterData,
        ...letter,
        profile: { ...defaultCoverLetterData.profile, ...(letter.profile as object) },
        recipient: { ...defaultCoverLetterData.recipient, ...(letter.recipient as object) },
        introduction: { ...defaultCoverLetterData.introduction, ...(letter.introduction as object) },
        closing: { ...defaultCoverLetterData.closing, ...(letter.closing as object) },
        cover_style: { ...defaultCoverLetterData.cover_style, ...(letter.cover_style as object) },
      } as CoverLetterData;
      const payload = buildCoverLetterPayload(normalized);
      const created = await axiosInstance.post(`${baseUrl}/`, payload);
      const newId = (created.data as { data?: { id?: number }; id?: number })?.data?.id ?? (created.data as { id?: number })?.id;
      if (newId) {
        toast.success('Cover letter duplicated');
        router.push(`/cover-letters/preview/${newId}`);
      } else {
        load();
      }
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  return (
    <section
      id="view-cover-letters"
      className="view-section active-view"
      aria-label="Cover Letters"
    >
      <div className="tool-page-wrap cover-letters-page">
        <header className="header-minimal">
          <h1>Cover Letters</h1>
          <p>Create and manage your cover letters. Choose a template and tailor each letter to the role.</p>
        </header>

        <div className="tool-page-nav tool-page-nav--cover-letters">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
          <Link
            href="/cover-letters/new"
            className="btn-resume btn-resume-primary"
            aria-label="Create new cover letter"
          >
            <Plus aria-hidden />
            New cover letter
          </Link>
        </div>

        {loading ? (
          <div className="cover-letters-loading">
            <div className="cover-letters-loading-spinner" aria-hidden />
            <p>Loading cover letters…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="cover-letters-empty">
            <p>No cover letters yet</p>
            <p>Create one to get started.</p>
            <Link href="/cover-letters/new" className="btn-resume btn-resume-primary">
              <Plus aria-hidden />
              Create your first cover letter
            </Link>
          </div>
        ) : (
          <ul className="cover-letters-list-grid" role="list">
            {list.map((letter) => (
              <li key={letter.id}>
                <CoverLetterCard
                  coverLetter={letter}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function CoverLettersPage() {
  return <CoverLettersContent />;
}

export { CoverLettersContent };
