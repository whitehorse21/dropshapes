'use client';

import { useEffect, useState } from 'react';
import FormField from '../FormField';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

const PROFESSION_STORAGE_KEY = 'coverLetter_selectedProfession';
const JOB_DESC_STORAGE_KEY = 'coverLetter_jobDescription';

interface CoverLetterProfessionProps {
  coverLetterData: CoverLetterData;
  onUpdate: (updates: Partial<CoverLetterData>) => void;
}

export default function CoverLetterProfession({
  coverLetterData,
  onUpdate,
}: CoverLetterProfessionProps) {
  const [profession, setProfession] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setProfession(localStorage.getItem(PROFESSION_STORAGE_KEY) ?? '');
    setJobDescription(localStorage.getItem(JOB_DESC_STORAGE_KEY) ?? '');
  }, []);

  const handleTitleChange = (value: string) => {
    const title = value || 'New Cover Letter';
    onUpdate({ cover_letter_title: title });
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFESSION_STORAGE_KEY, value || '');
    }
  };

  const handleProfessionChange = (value: string) => {
    setProfession(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFESSION_STORAGE_KEY, value);
    }
  };

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(JOB_DESC_STORAGE_KEY, value);
    }
  };

  return (
    <div className="cover-letter-create-step-content">
      <h5 className="text-xl font-semibold mb-4">Profession & Title</h5>
      <form className="space-y-6 w-full min-w-0">
        <FormField
          label="Cover letter title"
          name="cover_letter_title"
          value={coverLetterData.cover_letter_title ?? 'New Cover Letter'}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Software Engineer at Acme Inc"
          className="min-w-0"
        />
        <FormField
          label="Profession / role (for AI suggestions)"
          name="profession"
          value={profession}
          onChange={(e) => handleProfessionChange(e.target.value)}
          placeholder="e.g. Software Engineer"
          helperText="Used when improving sections with AI"
          className="min-w-0"
        />
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-2">Job description (optional, for AI)</label>
          <textarea
            className="w-full min-w-0 px-4 py-3 rounded-lg resize-none box-border form-field-input"
            rows={4}
            placeholder="Paste job description to help AI tailor your content..."
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            onBlur={(e) => {
              if (typeof window !== 'undefined') {
                localStorage.setItem(JOB_DESC_STORAGE_KEY, e.target.value);
              }
            }}
          />
        </div>
      </form>
    </div>
  );
}
