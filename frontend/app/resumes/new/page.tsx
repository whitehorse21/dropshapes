'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearResumeData, updateResumeData, defaultResumeData } from '@/app/utils/resumeService';
import { resumeTemplates, type ResumeTemplateOption } from '../templateList';

function NewResumeContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = resumeTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: ResumeTemplateOption) => {
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
      <div className="resumes-page-content resumes-new-content">
        <div className="header-minimal">
          <h1>Choose Your Template</h1>
          <p>Select a template to start building your resume.</p>
        </div>
        <div className="resumes-new-back">
          <button type="button" className="btn-resume" onClick={() => router.push('/resumes')}>
            Back to Resumes
          </button>
        </div>
        <div className="resume-template-search">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="auth-input"
            aria-label="Search templates"
          />
        </div>
        <div className="resumes-templates-grid resumes-new-templates-grid">
          {filtered.map((template) => (
            <button
              key={template.id}
              type="button"
              className="resumes-template-option"
              onClick={() => handleSelectTemplate(template)}
            >
              {template.thumbnail ? (
                <div className="resumes-template-option-thumb">
                  <img src={template.thumbnail} alt="" />
                </div>
              ) : null}
              <div className="resumes-template-option-body">
                <span className="resumes-template-option-name">{template.name}</span>
                <p className="resumes-template-option-desc">{template.description}</p>
                <span className="resumes-template-option-meta">{template.category}</span>
              </div>
              <span className="resumes-template-option-cta">Select →</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="resumes-template-no-match">No templates match your search.</p>}
      </div>
    </section>
  );
}

export default function NewResumePage() {
  return <NewResumeContent />;
}
