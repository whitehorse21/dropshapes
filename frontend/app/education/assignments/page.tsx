'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { Pencil, Trash2 } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  summary: string;
  due_date: string;
  unit: number;
  status: string;
}

export default function EducationAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdmin] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
    unit: 0,
    summary: '',
    status: 'pending',
  });

  const fetchAssignments = async () => {
    try {
      const response = await axiosInstance.get(ApiEndpoints.assignments);
      const data = response.data as { items?: Assignment[] };
      setAssignments(data?.items ?? []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'unit' ? Number(value) || 0 : value }));
  };

  const resetForm = () => {
    setFormData({ title: '', due_date: '', unit: 0, summary: '', status: 'pending' });
    setEditingAssignment(null);
  };

  const handleEdit = (assignment: Assignment) => {
    const due_date = assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : '';
    setFormData({
      title: assignment.title,
      due_date,
      unit: assignment.unit,
      summary: assignment.summary,
      status: assignment.status,
    });
    setEditingAssignment(assignment);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const apiData = { ...formData, due_date: new Date(formData.due_date).toISOString() };
      if (editingAssignment) {
        await axiosInstance.put(`${ApiEndpoints.assignments}${editingAssignment.id}`, apiData);
        setSuccess('Assignment updated successfully!');
      } else {
        await axiosInstance.post(ApiEndpoints.assignments, apiData);
        setSuccess('Assignment added successfully!');
      }
      resetForm();
      setShowAddForm(false);
      fetchAssignments();
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError('Failed to save assignment. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.assignments}${id}`);
      setSuccess('Assignment deleted successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment. Please try again.');
    }
  };

  const filtered = statusFilter === 'all' ? assignments : assignments.filter((a) => a.status === statusFilter);

  return (
    <section id="view-education-assignments" className="view-section active-view" aria-label="Assignments">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Assignments</h1>
          <p>Tasks and submissions for your course</p>
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
              {showAddForm ? 'Hide Form' : editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
            </button>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="auth-input"
            style={{ width: 'auto', minWidth: '140px' }}
            aria-label="Filter by status"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <Link href="/education" className="btn-resume btn-resume-primary">Back to Education home</Link>
        </div>

        {error && <div className="education-message education-message--error" role="alert">{error}</div>}
        {success && <div className="education-message education-message--success" role="status">{success}</div>}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="education-form-card">
            <div className="education-form">
              <div className="education-form-group">
                <label className="education-form-label">Assignment Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Summary</label>
                <textarea name="summary" value={formData.summary} onChange={handleInputChange} required rows={3} className="auth-input" />
              </div>
              <div className="education-form-row">
                <div className="education-form-group">
                  <label className="education-form-label">Due Date</label>
                  <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} required className="auth-input" />
                </div>
                <div className="education-form-group">
                  <label className="education-form-label">Unit ID</label>
                  <input type="number" name="unit" value={formData.unit || ''} onChange={handleInputChange} placeholder="e.g. 1" required className="auth-input" />
                </div>
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="auth-input">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="education-form-actions">
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="btn-resume">Cancel</button>
                <button type="submit" className="btn-resume btn-resume-primary">{editingAssignment ? 'Update Assignment' : 'Create Assignment'}</button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading assignments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="education-empty">No assignments {statusFilter !== 'all' ? 'with this status' : ''} yet.</p>
        ) : (
          <div className="education-list">
            {filtered.map((assignment) => (
              <div key={assignment.id} className="education-card">
                <div className="education-card__header">
                  <div>
                    <h3 className="education-card__title">{assignment.title}</h3>
                    <p className="education-card__meta">Unit ID: {assignment.unit}</p>
                  </div>
                  <div className="education-card__header-right">
                    <span className="education-badge">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    {isAdmin && (
                      <div className="education-card__actions">
                        <button type="button" onClick={() => handleEdit(assignment)} className="education-card__action" aria-label="Edit"><Pencil size={18} /></button>
                        <button type="button" onClick={() => handleDelete(assignment.id)} className="education-card__action education-card__action--danger" aria-label="Delete"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="education-card__body">{assignment.summary}</p>
                <div className="education-card__footer">
                  <span className={`education-status education-status--${assignment.status}`}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                  <div className="education-card__buttons">
                    <button type="button" className="btn-resume">View Details</button>
                    <button type="button" className="btn-resume btn-resume-primary">Submit Assignment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
