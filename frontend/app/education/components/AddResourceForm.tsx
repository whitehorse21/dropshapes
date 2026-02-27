'use client';

import React, { useState } from 'react';

interface AddResourceFormProps {
  onSubmit: (data: { title: string; description: string; videoUrl: string }) => void;
  onClose: () => void;
}

export default function AddResourceForm({ onSubmit, onClose }: AddResourceFormProps) {
  const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="education-add-resource-form">
      <h2 className="education-section-title">Add Resource</h2>
      <form onSubmit={handleSubmit} className="education-form">
        <div className="education-form-group">
          <label className="education-form-label">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="auth-input"
          />
        </div>
        <div className="education-form-group">
          <label className="education-form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="auth-input"
          />
        </div>
        <div className="education-form-group">
          <label className="education-form-label">Resource URL (optional)</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://www.example.com/"
            className="auth-input"
          />
        </div>
        <div className="education-form-actions">
          <button type="submit" className="btn-resume btn-resume-primary">
            Add
          </button>
          <button type="button" onClick={onClose} className="btn-resume">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
