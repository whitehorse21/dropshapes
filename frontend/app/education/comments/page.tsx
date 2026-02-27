'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { formatDateTime } from '../utils/helpers';
import { Pencil, Trash2 } from 'lucide-react';

interface Comment {
  id: number;
  name: string;
  comment: string;
  discussion_id: number;
  date_time?: string;
}

interface Discussion {
  id: number;
  title: string;
}

export default function EducationCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin] = useState(true);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [formData, setFormData] = useState({ name: '', comment: '', discussion_id: '' });

  const fetchDiscussions = async () => {
    try {
      const response = await axiosInstance.get(ApiEndpoints.discussions);
      const data = Array.isArray(response.data) ? response.data : (response.data as { items?: Discussion[] })?.items ?? [];
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
    }
  };

  const fetchComments = async (discussionId: number | null = null) => {
    try {
      setLoading(true);
      const url = discussionId
        ? ApiEndpoints.commentsByDiscussion(discussionId)
        : ApiEndpoints.comments;
      const response = await axiosInstance.get(url);
      const data = response.data as { items?: Comment[] };
      setComments(data?.items ?? []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  useEffect(() => {
    fetchComments(selectedDiscussionId);
  }, [selectedDiscussionId]);

  const handleDiscussionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedDiscussionId(val);
    setFormData((prev) => ({ ...prev, discussion_id: e.target.value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      comment: '',
      discussion_id: selectedDiscussionId ? String(selectedDiscussionId) : '',
    });
    setEditingComment(null);
  };

  const handleEdit = (comment: Comment) => {
    setFormData({
      name: comment.name,
      comment: comment.comment,
      discussion_id: String(comment.discussion_id),
    });
    setEditingComment(comment);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData, discussion_id: parseInt(formData.discussion_id, 10) };
      if (editingComment) {
        await axiosInstance.put(`${ApiEndpoints.comments}${editingComment.id}`, payload);
        setSuccess('Comment updated successfully!');
      } else {
        await axiosInstance.post(ApiEndpoints.comments, payload);
        setSuccess('Comment added successfully!');
      }
      resetForm();
      setShowAddForm(false);
      fetchComments(selectedDiscussionId);
    } catch (err) {
      console.error('Error saving comment:', err);
      setError('Failed to save comment. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.comments}${id}`);
      setSuccess('Comment deleted successfully!');
      fetchComments(selectedDiscussionId);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const getDiscussionTitle = (id: number) => discussions.find((d) => d.id === id)?.title ?? 'Unknown';

  return (
    <section id="view-education-comments" className="view-section active-view" aria-label="Comments Management">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Comments Management</h1>
          <p>Manage comments on discussions</p>
        </header>

        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/education')} aria-label="Back to Education">
            ← Back to Education
          </button>
          {isAdmin && (
            <button
              type="button"
              className="btn-resume btn-resume-primary"
              onClick={() => { setShowAddForm(!showAddForm); if (!showAddForm) resetForm(); }}
            >
              {showAddForm ? 'Cancel' : 'Add Comment'}
            </button>
          )}
          <Link href="/education" className="btn-resume btn-resume-primary">Back to Education</Link>
        </div>

        {error && <div className="education-message education-message--error" role="alert">{error}</div>}
        {success && <div className="education-message education-message--success" role="status">{success}</div>}

        {showAddForm && (
          <div className="education-form-card">
            <h2 className="education-section-title">{editingComment ? 'Edit Comment' : 'Add New Comment'}</h2>
            <form onSubmit={handleSubmit} className="education-form">
              <div className="education-form-group">
                <label className="education-form-label">Select Discussion</label>
                <select name="discussion_id" value={formData.discussion_id} onChange={handleInputChange} required className="auth-input">
                  <option value="">Select a discussion</option>
                  {discussions.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Comment</label>
                <textarea name="comment" value={formData.comment} onChange={handleInputChange} required rows={4} className="auth-input" />
              </div>
              <div className="education-form-actions">
                <button type="submit" className="btn-resume btn-resume-primary">{editingComment ? 'Update Comment' : 'Add Comment'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="education-form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="education-form-label">Filter by Discussion</label>
          <select
            value={selectedDiscussionId ?? ''}
            onChange={handleDiscussionChange}
            className="auth-input"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="">All Discussions</option>
            {discussions.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading comments…</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="education-empty">No comments found.</p>
        ) : (
          <div className="education-list">
            {comments.map((comment) => (
              <div key={comment.id} className="education-card">
                <div className="education-card__header">
                  <div>
                    <h3 className="education-card__title">{comment.name}</h3>
                    <p className="education-card__meta">{formatDateTime(comment.date_time)}</p>
                    <p className="education-card__meta">Discussion: {getDiscussionTitle(comment.discussion_id)}</p>
                  </div>
                  {isAdmin && (
                    <div className="education-card__actions">
                      <button type="button" onClick={() => handleEdit(comment)} className="education-card__action" aria-label="Edit"><Pencil size={18} /></button>
                      <button type="button" onClick={() => handleDelete(comment.id)} className="education-card__action education-card__action--danger" aria-label="Delete"><Trash2 size={18} /></button>
                    </div>
                  )}
                </div>
                <p className="education-card__body whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
