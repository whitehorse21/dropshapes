'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { toast } from 'react-hot-toast';

const defaultProfile = {
  full_name: '',
  email: '',
  phone_number: '',
  location: '',
  linkedin_profile: '',
  portfolio_website: '',
};
const defaultRecipient = {
  company_name: '',
  hiring_manager_name: '',
  job_title: '',
  company_address: '',
};
const defaultIntroduction = { greet_text: 'Dear Hiring Manager,', intro_para: '' };
const defaultClosing = { text: 'Sincerely,' };
const defaultCoverStyle = { font: 'Arial', color: '#000000' };

function NewCoverLetterContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('professional');
  const [category, setCategory] = useState('modern');
  const [profile, setProfile] = useState(defaultProfile);
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [introduction, setIntroduction] = useState(defaultIntroduction);
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState(defaultClosing);
  const [coverStyle, setCoverStyle] = useState(defaultCoverStyle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(ApiEndpoints.coverLetters.replace(/\/$/, '') + '/', {
        cover_letter_title: title.trim(),
        cover_letter_type: type,
        cover_template_category: category,
        profile,
        recipient,
        introduction,
        body: body || ' ',
        closing,
        cover_style: coverStyle,
      });
      toast.success('Cover letter created');
      router.push('/cover-letters');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to create';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="view-cover-letters-new" className="view-section active-view" aria-label="New Cover Letter">
      <div className="tool-page-wrap">
        <div className="header-minimal">
          <h1>New cover letter</h1>
          <p>Fill in the details below to create a cover letter.</p>
        </div>
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>
            ← Back to list
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tool-page-card cl-form">
          <div className="add-task-form-row">
            <label className="form-label">Title</label>
            <input type="text" className="auth-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Software Engineer at Acme" required />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Type</label>
            <select className="auth-input add-task-date-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Template category</label>
            <input type="text" className="auth-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. modern" required />
          </div>
          <h3 className="pn-list-title">Your details</h3>
          {(['full_name', 'email', 'phone_number', 'location', 'linkedin_profile', 'portfolio_website'] as const).map((key) => (
            <div key={key} className="add-task-form-row">
              <label className="form-label">{key.replace(/_/g, ' ')}</label>
              <input type="text" className="auth-input" value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <h3 className="pn-list-title">Recipient</h3>
          {(['company_name', 'hiring_manager_name', 'job_title', 'company_address'] as const).map((key) => (
            <div key={key} className="add-task-form-row">
              <label className="form-label">{key.replace(/_/g, ' ')}</label>
              <input type="text" className="auth-input" value={recipient[key]} onChange={(e) => setRecipient((r) => ({ ...r, [key]: e.target.value }))} />
            </div>
          ))}
          <h3 className="pn-list-title">Introduction</h3>
          <div className="add-task-form-row">
            <label className="form-label">Greeting</label>
            <input type="text" className="auth-input" value={introduction.greet_text} onChange={(e) => setIntroduction((i) => ({ ...i, greet_text: e.target.value }))} />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Intro paragraph</label>
            <textarea className="auth-input" rows={3} value={introduction.intro_para} onChange={(e) => setIntroduction((i) => ({ ...i, intro_para: e.target.value }))} />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Body</label>
            <textarea className="auth-input" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Main content of your cover letter" />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Closing</label>
            <input type="text" className="auth-input" value={closing.text} onChange={(e) => setClosing((c) => ({ ...c, text: e.target.value }))} />
          </div>
          <div className="tts-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn-resume btn-resume-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create cover letter'}
            </button>
            <button type="button" className="btn-resume" onClick={() => router.push('/cover-letters')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function NewCoverLetterPage() {
  return (
    <NewCoverLetterContent />
  );
}
