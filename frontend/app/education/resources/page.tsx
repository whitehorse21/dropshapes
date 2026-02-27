'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { Pencil, Trash2, FileText, Link as LinkIcon } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  type: string;
  created_at?: string;
}

export default function EducationResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '', type: 'video' });

  const loadResources = async () => {
    try {
      const response = await axiosInstance.get(ApiEndpoints.resources);
      const data = response.data as { items?: Resource[] };
      setResources(data?.items ?? []);
    } catch (err) {
      console.error('Error loading resources:', err);
      setError('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', videoUrl: '', type: 'video' });
    setEditingResource(null);
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      description: resource.description ?? '',
      videoUrl: resource.videoUrl ?? '',
      type: resource.type ?? 'video',
    });
    setEditingResource(resource);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingResource) {
        await axiosInstance.put(`${ApiEndpoints.resources}${editingResource.id}`, formData);
        setSuccess('Resource updated successfully!');
      } else {
        await axiosInstance.post(ApiEndpoints.resources, formData);
        setSuccess('Resource added successfully!');
      }
      resetForm();
      setShowAddForm(false);
      loadResources();
    } catch (err) {
      console.error('Error saving resource:', err);
      setError('Failed to save resource. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axiosInstance.delete(`${ApiEndpoints.resources}${id}`);
      setSuccess('Resource deleted successfully!');
      loadResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const videoResources = resources.filter((r) => r.type === 'video');

  return (
    <section id="view-education-resources" className="view-section active-view" aria-label="Resources">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Resources</h1>
          <p>Learning materials and files for your course</p>
        </header>

        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/education')} aria-label="Back to Education">
            ← Back to Education
          </button>
          {isAdmin && (
            <button type="button" className="btn-resume btn-resume-primary" onClick={() => { setShowAddForm(!showAddForm); if (!showAddForm) resetForm(); }}>
              {showAddForm ? 'Hide Form' : editingResource ? 'Edit Resource' : 'Add New Resource'}
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
                <label className="education-form-label">Resource Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="auth-input">
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Video / Resource URL</label>
                <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} required placeholder="https://www.youtube.com/watch?v=..." className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="auth-input" />
              </div>
              <div className="education-form-actions">
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="btn-resume">Cancel</button>
                <button type="submit" className="btn-resume btn-resume-primary">{editingResource ? 'Update Resource' : 'Add Resource'}</button>
              </div>
            </div>
          </form>
        )}

        <h2 className="education-section-title">Resources</h2>

        {loading ? (
          <div className="education-loading">
            <div className="education-loading-spinner" aria-hidden />
            <p>Loading resources…</p>
          </div>
        ) : resources.length === 0 ? (
          <p className="education-empty">No resources available yet.</p>
        ) : (
          <>
            {videoResources.length > 0 && (
              <div className="education-resources-grid">
                {videoResources.map((resource, index) => (
                  <VideoCard key={resource.id} resource={resource} animationDelay={index * 0.1} />
                ))}
              </div>
            )}
            <div className="education-list">
              {resources.map((resource) => (
                <div key={resource.id} className="education-card education-card--resource">
                  <div className="education-card__header">
                    <div className="education-card__icon">
                      {resource.type === 'video' && <span className="education-resource-icon" aria-hidden />}
                      {resource.type === 'document' && <FileText size={24} className="education-resource-icon-svg" />}
                      {resource.type === 'link' && <LinkIcon size={24} className="education-resource-icon-svg" />}
                    </div>
                    <div className="education-card__header-text">
                      <h3 className="education-card__title">{resource.title}</h3>
                      {resource.created_at && <p className="education-card__meta">{new Date(resource.created_at).toLocaleDateString()}</p>}
                    </div>
                    {isAdmin && (
                      <div className="education-card__actions">
                        <button type="button" onClick={() => handleEdit(resource)} className="education-card__action" aria-label="Edit"><Pencil size={18} /></button>
                        <button type="button" onClick={() => handleDelete(resource.id)} className="education-card__action education-card__action--danger" aria-label="Delete"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                  <p className="education-card__body">{resource.description}</p>
                  {resource.videoUrl && (
                    <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer" className="education-link">View Resource</a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <VideoModal />
    </section>
  );
}
