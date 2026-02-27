'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';

interface Discussion {
  id: number;
  title: string;
  content: string;
  author_name?: string;
  date?: string;
  created_at?: string;
  comment_count?: number;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params?.id as string;
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDiscussion = async () => {
    if (!discussionId) return;
    setError('');
    try {
      const response = await axiosInstance.get(ApiEndpoints.discussion(discussionId));
      setDiscussion(response.data as Discussion);
    } catch (err) {
      console.error('Error fetching discussion:', err);
      try {
        const listRes = await axiosInstance.get(ApiEndpoints.discussions);
        const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data as { items?: Discussion[] })?.items ?? [];
        const found = list.find((d: Discussion) => String(d.id) === discussionId);
        if (found) setDiscussion(found);
        else setError('Discussion not found.');
      } catch {
        setError('Failed to load discussion. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [discussionId]);

  if (loading) {
    return (
      <section id="view-education-discussion-detail" className="view-section active-view" aria-label="Discussion">
        <div className="tool-page-wrap education-page">
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading discussion…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !discussion) {
    return (
      <section id="view-education-discussion-detail" className="view-section active-view" aria-label="Discussion">
        <div className="tool-page-wrap education-page">
          <header className="header-minimal">
            <h1>Discussion</h1>
          </header>
          <div className="education-message education-message--error">{error || 'Discussion not found.'}</div>
          <div className="tool-page-nav">
            <button type="button" onClick={() => { setError(''); setLoading(true); fetchDiscussion(); }} className="btn-resume btn-resume-primary">Try Again</button>
            <Link href="/education/discussions" className="btn-resume">Back to Discussions</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="view-education-discussion-detail" className="view-section active-view" aria-label="Discussion">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Discussion</h1>
          <p>View and join the conversation</p>
        </header>

        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/education/discussions')} aria-label="Back to Discussions">
            ← Back to Discussions
          </button>
          <Link href="/education/discussions" className="btn-resume btn-resume-primary">Back to Discussions list</Link>
        </div>

        <article className="education-article">
          <h2 className="education-article__title">{discussion.title}</h2>
          <div className="education-article__meta">
            <span>Posted by {discussion.author_name || 'Anonymous'}</span>
            <span>{new Date(discussion.date || discussion.created_at || '').toLocaleDateString()}</span>
          </div>
          <div className="education-article__content">{discussion.content}</div>
          <div className="education-article__comments">
            <h3>Comments ({discussion.comment_count ?? 0})</h3>
            <p className="education-empty">Comment section can be expanded here (e.g. list comments by discussion).</p>
          </div>
        </article>
      </div>
    </section>
  );
}
