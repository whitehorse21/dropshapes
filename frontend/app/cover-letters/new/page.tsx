'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearCoverLetterData,
  defaultCoverLetterData,
  type CoverLetterData,
} from '@/app/utils/coverLetterService';
import { $coverLetter } from '@/app/utils/coverLetterObservable';
import { coverLetterTemplates, type CoverLetterTemplateOption } from '../templateList';

/** Template name to component name (matches old frontend and CoverLetterPreview). */
function toComponentName(name: string, category: string): string {
  const clean = name.replace(/\s+/g, '');
  return category.toLowerCase() === 'classic' ? `${clean}Template` : `Template${clean}`;
}

function NewCoverLetterContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = coverLetterTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: CoverLetterTemplateOption) => {
    clearCoverLetterData();
    const componentName = toComponentName(template.name, template.category);
    const initial: CoverLetterData = {
      ...defaultCoverLetterData,
      cover_template_category: componentName,
      cover_letter_type: 'professional',
    };
    $coverLetter.next(initial);
    router.push('/cover-letters/create/profession');
  };

  return (
    <section id="view-cover-letters-new" className="view-section active-view" aria-label="New Cover Letter">
      <div className="tool-page-wrap cover-letters-page">
        <div className="resumes-page-content resumes-new-content cover-letters-new-content">
          <div className="header-minimal">
            <h1>Choose Your Template</h1>
            <p>Select a cover letter template to get started.</p>
          </div>
          <div className="resumes-new-back">
            <button
              type="button"
              className="btn-resume"
              onClick={() => router.push('/cover-letters')}
            >
              Back to Cover Letters
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
                <div className="resumes-template-option-thumb">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        const placeholder = el.nextElementSibling;
                        if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="cover-letter-template-thumb-placeholder"
                    style={{ display: template.thumbnail ? 'none' : 'flex' }}
                    aria-hidden
                  >
                    <span>{template.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="resumes-template-option-body">
                  <span className="resumes-template-option-name">{template.name}</span>
                  <p className="resumes-template-option-desc">{template.description}</p>
                  <span className="resumes-template-option-meta">{template.category}</span>
                </div>
                <span className="resumes-template-option-cta">Select →</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="resumes-template-no-match">No templates match your search.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function NewCoverLetterPage() {
  return <NewCoverLetterContent />;
}
