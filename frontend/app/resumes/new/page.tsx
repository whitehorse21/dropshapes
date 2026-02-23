'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import { clearResumeData, updateResumeData, defaultResumeData } from '@/app/utils/resumeService';
import { resumeTemplates } from '../resumeSteps';

function NewResumeContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = resumeTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: (typeof resumeTemplates)[0]) => {
    clearResumeData();
    updateResumeData({
      ...defaultResumeData,
      template_category: template.id,
      resume_type: template.category,
    });
    router.push('/resumes/new/profession');
  };

  return (
    <section className="view-section active-view" aria-label="New Resume">
      <div className="home-content-wrapper" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="header-minimal">
          <h1>Choose Your Template</h1>
          <p>Select a template to start building your resume.</p>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="auth-input"
            style={{ maxWidth: '400px' }}
          />
        </div>
        <div className="grid-minimal" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filtered.map((template) => (
            <button
              key={template.id}
              type="button"
              className="tool-pill"
              style={{
                display: 'block',
                textAlign: 'left',
                padding: '24px',
                cursor: 'pointer',
                border: '2px solid var(--border)',
              }}
              onClick={() => handleSelectTemplate(template)}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{template.name}</span>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{template.description}</p>
              <span style={{ marginTop: '12px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--accent)' }}>Select →</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No templates match your search.</p>}
        <div style={{ marginTop: '24px' }}>
          <button type="button" className="btn-resume" onClick={() => router.push('/resumes')}>
            Back to Resumes
          </button>
        </div>
      </div>
    </section>
  );
}

export default function NewResumePage() {
  return (
    <AuthWrapper>
      <NewResumeContent />
    </AuthWrapper>
  );
}
