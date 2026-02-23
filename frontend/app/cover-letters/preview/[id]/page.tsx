'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';

interface CoverLetterData {
  id: number;
  cover_letter_title: string;
  cover_letter_type?: string;
  cover_template_category?: string;
  profile?: Record<string, string>;
  recipient?: Record<string, string>;
  introduction?: { greet_text?: string; intro_para?: string };
  body?: string;
  closing?: { text?: string };
}

function PreviewContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CoverLetterData | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    axiosInstance.get<{ success: boolean; data: CoverLetterData }>(`${ApiEndpoints.coverLetters.replace(/\/$/, '')}/${id}`)
      .then((res) => { if (!cancelled) setData(res.data.data); })
      .catch(() => { if (!cancelled) toast.error('Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="tool-page-wrap"><p className="cl-loading">Loading…</p></div>;
  if (!data) return <div className="tool-page-wrap"><p className="cl-empty">Cover letter not found.</p><button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>Back to list</button></div>;

  return (
    <section id="view-cover-letter-preview" className="view-section active-view" aria-label="Cover letter preview">
      <div className="tool-page-wrap">
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>← Back to list</button>
          <button type="button" className="btn-resume" onClick={() => router.push(`/cover-letters/edit/${id}`)}>Edit</button>
        </div>
        <div className="tool-page-card cl-preview">
          <h1 className="cl-preview-title">{data.cover_letter_title}</h1>
          {data.recipient && (
            <p className="cl-preview-meta">
              {data.recipient.company_name && <span>{data.recipient.company_name}</span>}
              {data.recipient.hiring_manager_name && <span> • {data.recipient.hiring_manager_name}</span>}
              {data.recipient.job_title && <span> • {data.recipient.job_title}</span>}
            </p>
          )}
          {data.introduction?.greet_text && <p className="cl-preview-greet">{data.introduction.greet_text}</p>}
          {data.introduction?.intro_para && <div className="cl-preview-intro" dangerouslySetInnerHTML={{ __html: data.introduction.intro_para }} />}
          {data.body && <div className="cl-preview-body" dangerouslySetInnerHTML={{ __html: data.body }} />}
          {data.closing?.text && <p className="cl-preview-close">{data.closing.text}</p>}
          {data.profile?.full_name && <p className="cl-preview-signature">{data.profile.full_name}</p>}
        </div>
      </div>
    </section>
  );
}

export default function CoverLetterPreviewPage() {
  return (
    <AuthWrapper>
      <PreviewContent />
    </AuthWrapper>
  );
}
