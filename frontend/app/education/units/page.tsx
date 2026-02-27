'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { Pencil, Trash2 } from 'lucide-react';

interface CourseUnit {
  id: number;
  title: string;
  description?: string | null;
  module?: string;
  points?: string;
  created_at?: string;
}

const MODULE_OPTIONS = [
  { value: '1', label: 'First Module' },
  { value: '2', label: 'Second Module' },
  { value: '3', label: 'Third Module' },
  { value: '4', label: 'Fourth Module' },
];

export default function EducationUnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin] = useState(true);
  const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', points: '', module: '' });

  const fetchUnits = async () => {
    try {
      const response = await axiosInstance.get(ApiEndpoints.courseUnits);
      const data = response.data as { items?: CourseUnit[] };
      setUnits(data?.items ?? []);
    } catch (err) {
      console.error('Error fetching course units:', err);
      setError('Failed to load course units');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const groupedUnits = units.reduce<Record<string, CourseUnit[]>>((acc, unit) => {
    const mod = unit.module ?? '0';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(unit);
    return acc;
  }, {});
  const sortedModules = Object.keys(groupedUnits).sort((a, b) => Number(a) - Number(b));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', points: '', module: '' });
    setEditingUnit(null);
  };

  const handleEdit = (unit: CourseUnit) => {
    setFormData({
      title: unit.title,
      description: unit.description ?? '',
      points: unit.points ?? '',
      module: unit.module ?? '',
    });
    setEditingUnit(unit);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingUnit) {
        await axiosInstance.put(`${ApiEndpoints.courseUnits}${editingUnit.id}`, formData);
        setSuccess('Course unit updated successfully!');
      } else {
        await axiosInstance.post(ApiEndpoints.courseUnits, formData);
        setSuccess('Course unit added successfully!');
      }
      resetForm();
      setShowAddForm(false);
      fetchUnits();
    } catch (err) {
      console.error('Error saving course unit:', err);
      setError('Failed to save course unit. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course unit?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.courseUnits}${id}`);
      setSuccess('Course unit deleted successfully!');
      fetchUnits();
    } catch (err) {
      console.error('Error deleting course unit:', err);
      setError('Failed to delete course unit. Please try again.');
    }
  };

  return (
    <section id="view-education-units" className="view-section active-view" aria-label="Course Units">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Course Units</h1>
          <p>Browse and access your course modules</p>
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
              {showAddForm ? 'Hide Form' : editingUnit ? 'Edit Unit' : 'Add Unit'}
            </button>
          )}
          <Link href="/education" className="btn-resume btn-resume-primary">Back to Education home</Link>
        </div>

        {error && <div className="education-message education-message--error" role="alert">{error}</div>}
        {success && <div className="education-message education-message--success" role="status">{success}</div>}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="education-form-card">
            <div className="education-form">
              <div className="education-form-group">
                <label className="education-form-label">Unit Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Points (comma separated)</label>
                <textarea name="points" value={formData.points} onChange={handleInputChange} required rows={3} placeholder="Introduction to React, Components, Props & State" className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Module</label>
                <select name="module" value={formData.module} onChange={handleInputChange} required className="auth-input">
                  <option value="" disabled hidden>Select Module</option>
                  {MODULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="education-form-actions">
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="btn-resume">Cancel</button>
                <button type="submit" className="btn-resume btn-resume-primary">{editingUnit ? 'Update Unit' : 'Create Unit'}</button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading course units…</p>
          </div>
        ) : units.length === 0 ? (
          <p className="education-empty">No course units available yet.</p>
        ) : (
          sortedModules.map((module) => (
            <div key={module} className="education-units-module">
              <h2 className="education-section-title">Module {module}</h2>
              <div className="education-units-grid">
                {groupedUnits[module].map((unit, index) => (
                  <div key={unit.id} className="education-unit-card education-unit-card--full">
                    {isAdmin && (
                      <div className="education-unit-card__actions">
                        <button type="button" onClick={() => handleEdit(unit)} className="education-unit-card__action" aria-label="Edit"><Pencil size={18} /></button>
                        <button type="button" onClick={() => handleDelete(unit.id)} className="education-unit-card__action education-unit-card__action--danger" aria-label="Delete"><Trash2 size={18} /></button>
                      </div>
                    )}
                    <h3 className="education-unit-title">Unit {index + 1}: {unit.title}</h3>
                    <p className="education-unit-desc">{unit.description}</p>
                    {unit.points && (
                      <ul className="education-unit-points">
                        {unit.points.split(',').map((topic, i) => (
                          <li key={i}>{topic.trim()}</li>
                        ))}
                      </ul>
                    )}
                    {unit.created_at && (
                      <p className="education-unit-meta">Created: {new Date(unit.created_at).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
