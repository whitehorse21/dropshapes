'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { Pencil, Trash2 } from 'lucide-react';

interface Discussion {
  id: number;
  title: string;
  content: string;
  author_name?: string;
  date?: string;
  created_at?: string;
  comment_count?: number;
}

export default function EducationDiscussionsPage() {
  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [isAdmin] = useState(true);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', posted_by: '' });

  const fetchDiscussions = async () => {
    try {
      const response = await axiosInstance.get(ApiEndpoints.discussions);
      const data = Array.isArray(response.data) ? response.data : (response.data as { items?: Discussion[] })?.items ?? [];
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions');
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', posted_by: '' });
    setEditingDiscussion(null);
  };

  const handleEdit = (discussion: Discussion) => {
    setFormData({
      title: discussion.title,
      content: discussion.content,
      posted_by: discussion.author_name ?? '',
    });
    setEditingDiscussion(discussion);
    setShowNewDiscussion(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { title: formData.title, content: formData.content, author_name: formData.posted_by };
      if (editingDiscussion) {
        await axiosInstance.put(ApiEndpoints.discussion(editingDiscussion.id), payload);
        setSuccess('Discussion updated successfully!');
      } else {
        await axiosInstance.post(ApiEndpoints.discussions, payload);
        setSuccess('Discussion posted successfully!');
      }
      resetForm();
      setShowNewDiscussion(false);
      fetchDiscussions();
    } catch (err) {
      console.error('Error saving discussion:', err);
      setError('Failed to save discussion. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;
    try {
      await axiosInstance.delete(ApiEndpoints.discussion(id));
      setSuccess('Discussion deleted successfully!');
      fetchDiscussions();
    } catch (err) {
      console.error('Error deleting discussion:', err);
      setError('Failed to delete discussion. Please try again.');
    }
  };

  return (
    <section id="view-education-discussions" className="view-section active-view" aria-label="Discussions">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Discussions</h1>
          <p>Forum threads and course discussions</p>
        </header>

        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/education')} aria-label="Back to Education">
            ← Back to Education
          </button>
          <button
            type="button"
            className="btn-resume btn-resume-primary"
            onClick={() => { setShowNewDiscussion(!showNewDiscussion); if (!showNewDiscussion) resetForm(); }}
          >
            {showNewDiscussion ? 'Hide Form' : editingDiscussion ? 'Edit Discussion' : 'New Discussion'}
          </button>
          {isAdmin && (
            <Link href="/education/comments" className="btn-resume btn-resume-primary">Manage Comments</Link>
          )}
          <Link href="/education" className="btn-resume btn-resume-primary">Back to Education home</Link>
        </div>

        {error && <div className="education-message education-message--error" role="alert">{error}</div>}
        {success && <div className="education-message education-message--success" role="status">{success}</div>}

        {showNewDiscussion && (
          <form onSubmit={handleSubmit} className="education-form-card">
            <div className="education-form">
              <div className="education-form-group">
                <label className="education-form-label">Discussion Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Author Name</label>
                <input type="text" name="posted_by" value={formData.posted_by} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Content</label>
                <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={4} className="auth-input" />
              </div>
              <div className="education-form-actions">
                <button type="button" onClick={() => { setShowNewDiscussion(false); resetForm(); }} className="btn-resume">Cancel</button>
                <button type="submit" className="btn-resume btn-resume-primary">{editingDiscussion ? 'Update Discussion' : 'Post Discussion'}</button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading discussions…</p>
          </div>
        ) : discussions.length === 0 ? (
          <p className="education-empty">No discussions available yet.</p>
        ) : (
          <div className="education-list">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="education-card">
                <div className="education-card__header">
                  <div>
                    <h3 className="education-card__title">{discussion.title}</h3>
                    <p className="education-card__meta">
                      Started by {discussion.author_name || 'Anonymous'} • {new Date(discussion.date || discussion.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="education-card__header-right">
                    <span className="education-badge">{discussion.comment_count ?? 0} {(discussion.comment_count ?? 0) === 1 ? 'reply' : 'replies'}</span>
                    {isAdmin && (
                      <div className="education-card__actions">
                        <button type="button" onClick={() => handleEdit(discussion)} className="education-card__action" aria-label="Edit"><Pencil size={18} /></button>
                        <button type="button" onClick={() => handleDelete(discussion.id)} className="education-card__action education-card__action--danger" aria-label="Delete"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="education-card__body">{discussion.content}</p>
                <div className="education-card__footer">
                  <Link href={`/education/discussions/${discussion.id}`} className="btn-resume btn-resume-primary">Join Discussion</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
