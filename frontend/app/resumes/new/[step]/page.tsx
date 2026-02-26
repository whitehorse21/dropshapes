'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getResumeFromLocalDB,
  updateResumeData,
  defaultResumeData,
  defaultPersonalInfo,
  type ResumeData,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type LanguageItem,
  type CertificationItem,
  type CustomSection,
} from '@/app/utils/resumeService';
import { resumeSteps } from '@/app/resumes/resumeSteps';

const PROFESSIONS = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Marketing Specialist',
  'Financial Analyst', 'Teacher', 'Nurse', 'Graphic Designer', 'Project Manager', 'Business Analyst',
  'Sales Manager', 'HR Specialist', 'Operations Manager', 'Content Writer', 'DevOps Engineer',
];

export default function ResumeStepPage() {
  const params = useParams();
  const step = params?.step as string;
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  useEffect(() => {
    const stored = getResumeFromLocalDB();
    if (stored) {
      const basePersonal = defaultPersonalInfo ?? defaultResumeData?.personalInfo ?? {};
      setResumeData({
        ...defaultResumeData,
        ...stored,
        personalInfo: { ...basePersonal, ...stored?.personalInfo },
      });
    }
  }, []);

  const sync = (partial: Partial<ResumeData>) => {
    const next = { ...resumeData, ...partial };
    if (partial.personalInfo) next.personalInfo = { ...(resumeData?.personalInfo ?? defaultPersonalInfo), ...partial.personalInfo };
    setResumeData(next);
    updateResumeData(next);
  };

  if (!resumeSteps.some((s) => s.name === step)) {
    return (
      <div className="resume-step-content">
        <p className="resume-step-subtitle">Invalid step.</p>
      </div>
    );
  }

  // —— Profession ——
  if (step === 'profession') {
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Choose your profession</h2>
          <p className="resume-step-subtitle">This helps tailor your resume content and suggestions.</p>
        </div>
        <div className="resume-pill-grid">
          {PROFESSIONS.map((p) => (
            <button
              key={p}
              type="button"
              className={`tool-pill ${(resumeData?.profession ?? '') === p ? 'active' : ''}`}
              onClick={() => sync({ profession: p })}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="resume-step-field" style={{ marginTop: '1rem' }}>
          <label className="form-label">Or type your own</label>
          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            value={resumeData?.profession ?? ''}
            onChange={(e) => sync({ profession: e.target.value })}
            className="auth-input"
            style={{ maxWidth: '320px' }}
          />
        </div>
        <div className="resume-step-card" style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Job description (optional)</label>
          <textarea
            className="auth-input w-full"
            rows={3}
            placeholder="E.g., Responsible for developing web apps, maintaining APIs..."
            value={resumeData?.jobDescription ?? ''}
            onChange={(e) => sync({ jobDescription: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // —— Personal ——
  if (step === 'personal') {
    const pi = { ...defaultPersonalInfo, ...(resumeData?.personalInfo ?? {}) };
    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'address', 'linkedin', 'website'] as const;
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Personal information</h2>
          <p className="resume-step-subtitle">Required fields: first name, last name, and email.</p>
        </div>
        <div className="resume-step-card">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {personalFields.map((field) => (
              <div key={field} className="resume-step-field">
                <label className="form-label">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  className="auth-input w-full"
                  value={(pi[field] ?? '') as string}
                  onChange={(e) => sync({ personalInfo: { ...pi, [field]: e.target.value } })}
                  placeholder={field === 'email' ? 'you@example.com' : ''}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="resume-step-card">
          <label className="form-label">Professional summary</label>
          <textarea
            className="auth-input w-full"
            rows={4}
            value={resumeData?.summary ?? ''}
            onChange={(e) => sync({ summary: e.target.value })}
            placeholder="Brief professional summary"
          />
        </div>
      </div>
    );
  }

  // —— Experience ——
  if (step === 'experience') {
    const exp = resumeData?.experience ?? [];
    const updateExp = (index: number, patch: Partial<ExperienceItem>) => {
      const next = [...exp];
      next[index] = { ...next[index], ...patch };
      sync({ experience: next });
    };
    const addExp = () => sync({ experience: [...exp, { company: '', role: '', startDate: '', endDate: '', current: false, location: '', description: '', skills: [] }] });
    const removeExp = (index: number) => sync({ experience: exp.filter((_, i) => i !== index) });
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Work experience</h2>
          <p className="resume-step-subtitle">Add at least one role. Company, role, and start date are required.</p>
        </div>
        {exp.map((e, i) => (
          <div key={i} className="resume-step-card">
            <div className="resume-step-card-header">
              <span>#{i + 1}</span>
              {exp.length > 1 && <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeExp(i)}>Remove</button>}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="resume-step-field">
                <label className="form-label">Company</label>
                <input className="auth-input w-full" placeholder="Company name" value={e.company} onChange={(ev) => updateExp(i, { company: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Role / Job title</label>
                <input className="auth-input w-full" placeholder="e.g. Software Engineer" value={e.role} onChange={(ev) => updateExp(i, { role: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Location (optional)</label>
                <input className="auth-input w-full" placeholder="City, Country" value={e.location || ''} onChange={(ev) => updateExp(i, { location: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Dates</label>
                <div className="resume-step-inline-row">
                  <input type="date" className="auth-input" style={{ flex: '1', minWidth: '140px' }} placeholder="Start" value={e.startDate || ''} onChange={(ev) => updateExp(i, { startDate: ev.target.value })} />
                  <input type="date" className="auth-input" style={{ flex: '1', minWidth: '140px' }} placeholder="End" value={e.endDate || ''} onChange={(ev) => updateExp(i, { endDate: ev.target.value })} />
                  <label><input type="checkbox" checked={e.current ?? false} onChange={(ev) => updateExp(i, { current: ev.target.checked, endDate: ev.target.checked ? 'Present' : '' })} /> Current</label>
                </div>
              </div>
              <div className="resume-step-field">
                <label className="form-label">Description (optional)</label>
                <textarea className="auth-input w-full" rows={3} placeholder="Key responsibilities and achievements" value={e.description || ''} onChange={(ev) => updateExp(i, { description: ev.target.value })} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addExp}>+ Add experience</button>
      </div>
    );
  }

  // —— Education ——
  if (step === 'education') {
    const edu = resumeData?.education ?? [];
    const updateEdu = (index: number, patch: Partial<EducationItem>) => {
      const next = [...edu];
      next[index] = { ...next[index], ...patch };
      sync({ education: next });
    };
    const addEdu = () => sync({ education: [...edu, { institution: '', degree: '', field: '', startDate: '', endDate: '', current: false }] });
    const removeEdu = (index: number) => sync({ education: edu.filter((_, i) => i !== index) });
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Education</h2>
          <p className="resume-step-subtitle">Add at least one entry. Institution, degree, and start date are required.</p>
        </div>
        {edu.map((e, i) => (
          <div key={i} className="resume-step-card">
            <div className="resume-step-card-header">
              <span>#{i + 1}</span>
              {edu.length > 1 && <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeEdu(i)}>Remove</button>}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="resume-step-field">
                <label className="form-label">Institution</label>
                <input className="auth-input w-full" placeholder="School or university" value={e.institution} onChange={(ev) => updateEdu(i, { institution: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Degree</label>
                <input className="auth-input w-full" placeholder="e.g. Bachelor of Science" value={e.degree} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Field of study (optional)</label>
                <input className="auth-input w-full" placeholder="e.g. Computer Science" value={e.field || ''} onChange={(ev) => updateEdu(i, { field: ev.target.value })} />
              </div>
              <div className="resume-step-field">
                <label className="form-label">Dates</label>
                <div className="resume-step-inline-row">
                  <input type="date" className="auth-input" style={{ flex: '1', minWidth: '140px' }} value={e.startDate || ''} onChange={(ev) => updateEdu(i, { startDate: ev.target.value })} />
                  <input type="date" className="auth-input" style={{ flex: '1', minWidth: '140px' }} value={e.endDate || ''} onChange={(ev) => updateEdu(i, { endDate: ev.target.value })} />
                  <label><input type="checkbox" checked={e.current ?? false} onChange={(ev) => updateEdu(i, { current: ev.target.checked })} /> Current</label>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addEdu}>+ Add education</button>
      </div>
    );
  }

  // —— Extra (skills, languages, hobbies, certifications) ——
  if (step === 'extra') {
    const skills = resumeData?.skills ?? [];
    const languages = resumeData?.languages ?? [];
    const hobbies = resumeData?.hobbies ?? [];
    const certs = resumeData?.certifications ?? [];

    const updateSkill = (i: number, patch: Partial<SkillItem>) => {
      const next = [...skills];
      next[i] = { ...next[i], ...patch };
      sync({ skills: next });
    };
    const addSkill = () => sync({ skills: [...skills, { name: '', level: '' }] });
    const removeSkill = (i: number) => sync({ skills: skills.filter((_, j) => j !== i) });

    const updateLang = (i: number, patch: Partial<LanguageItem>) => {
      const next = [...languages];
      next[i] = { ...next[i], ...patch };
      sync({ languages: next });
    };
    const addLang = () => sync({ languages: [...languages, { name: '', level: '' }] });
    const removeLang = (i: number) => sync({ languages: languages.filter((_, j) => j !== i) });

    const addHobby = (h: string) => { if (h.trim()) sync({ hobbies: [...hobbies, h.trim()] }); };
    const removeHobby = (i: number) => sync({ hobbies: hobbies.filter((_, j) => j !== i) });

    const updateCert = (i: number, patch: Partial<CertificationItem>) => {
      const next = [...certs];
      next[i] = { ...next[i], ...patch };
      sync({ certifications: next });
    };
    const addCert = () => sync({ certifications: [...certs, { name: '', organization: '', startDate: '', endDate: '', certificateLink: '' }] });
    const removeCert = (i: number) => sync({ certifications: certs.filter((_, j) => j !== i) });

    const [newHobby, setNewHobby] = useState('');
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Skills, languages & more</h2>
          <p className="resume-step-subtitle">Optional. Add skills, languages, hobbies, and certifications.</p>
        </div>
        <h3 className="resume-step-section-title">Skills</h3>
        {skills.map((s, i) => (
          <div key={i} className="resume-step-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <input className="auth-input" style={{ flex: '1', minWidth: '120px' }} placeholder="Skill" value={s.name} onChange={(e) => updateSkill(i, { name: e.target.value })} />
              <input className="auth-input" style={{ flex: '1', minWidth: '100px' }} placeholder="Level" value={s.level} onChange={(e) => updateSkill(i, { level: e.target.value })} />
              <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeSkill(i)}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addSkill}>+ Add skill</button>

        <h3 className="resume-step-section-title">Languages</h3>
        {languages.map((l, i) => (
          <div key={i} className="resume-step-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <input className="auth-input" style={{ flex: '1', minWidth: '120px' }} placeholder="Language" value={l.name} onChange={(e) => updateLang(i, { name: e.target.value })} />
              <input className="auth-input" style={{ flex: '1', minWidth: '100px' }} placeholder="Level" value={l.level} onChange={(e) => updateLang(i, { level: e.target.value })} />
              <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeLang(i)}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addLang}>+ Add language</button>

        <h3 className="resume-step-section-title">Hobbies</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <input className="auth-input" style={{ flex: '1', minWidth: '160px' }} placeholder="Add hobby" value={newHobby} onChange={(e) => setNewHobby(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (addHobby(newHobby), setNewHobby(''))} />
          <button type="button" className="btn-resume" onClick={() => { addHobby(newHobby); setNewHobby(''); }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {hobbies.map((h, i) => (
            <span key={i} className="resume-step-tag">
              {h} <button type="button" onClick={() => removeHobby(i)} aria-label="Remove">×</button>
            </span>
          ))}
        </div>

        <h3 className="resume-step-section-title">Certifications</h3>
        {certs.map((c, i) => (
          <div key={i} className="resume-step-card">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input className="auth-input w-full" placeholder="Certification name" value={c.name} onChange={(e) => updateCert(i, { name: e.target.value })} />
              <input className="auth-input w-full" placeholder="Organization" value={c.organization} onChange={(e) => updateCert(i, { organization: e.target.value })} />
              <input className="auth-input w-full" placeholder="Certificate link (optional)" value={c.certificateLink || ''} onChange={(e) => updateCert(i, { certificateLink: e.target.value })} />
              <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeCert(i)}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addCert}>+ Add certification</button>
      </div>
    );
  }

  // —— Custom section ——
  if (step === 'custom') {
    const custom = resumeData?.custom_section ?? [];
    const updateSection = (i: number, patch: Partial<CustomSection>) => {
      const next = [...custom];
      next[i] = { ...next[i], ...patch };
      sync({ custom_section: next });
    };
    const updateItem = (secIdx: number, itemIdx: number, patch: { name?: string; description?: string }) => {
      const next = [...custom];
      const items = [...(next[secIdx].items || [])];
      items[itemIdx] = { ...items[itemIdx], ...patch };
      next[secIdx] = { ...next[secIdx], items };
      sync({ custom_section: next });
    };
    const addSection = () => sync({ custom_section: [...custom, { title: '', items: [{ name: '', description: '' }] }] });
    const addItem = (secIdx: number) => {
      const next = [...custom];
      next[secIdx] = { ...next[secIdx], items: [...(next[secIdx].items || []), { name: '', description: '' }] };
      sync({ custom_section: next });
    };
    const removeSection = (i: number) => sync({ custom_section: custom.filter((_, j) => j !== i) });
    const removeItem = (secIdx: number, itemIdx: number) => {
      const next = [...custom];
      const items = (next[secIdx].items || []).filter((_, j) => j !== itemIdx);
      next[secIdx] = { ...next[secIdx], items };
      sync({ custom_section: next });
    };
    return (
      <div className="resume-step-content">
        <div className="resume-step-header">
          <h2 className="resume-step-title">Custom sections</h2>
          <p className="resume-step-subtitle">Add optional sections (e.g. Projects, Publications, Volunteering).</p>
        </div>
        {custom.map((sec, si) => (
          <div key={si} className="resume-step-card">
            <div className="resume-step-field">
              <label className="form-label">Section title</label>
              <input className="auth-input w-full" placeholder="e.g. Projects" value={sec.title} onChange={(e) => updateSection(si, { title: e.target.value })} />
            </div>
            {(sec.items || []).map((item, ii) => (
              <div key={ii} className="resume-step-card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <input className="auth-input w-full" placeholder="Item name" value={item.name} onChange={(e) => updateItem(si, ii, { name: e.target.value })} />
                  <input className="auth-input w-full" placeholder="Description" value={item.description || ''} onChange={(e) => updateItem(si, ii, { description: e.target.value })} />
                  <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeItem(si, ii)}>Remove item</button>
                </div>
              </div>
            ))}
            <div className="resume-step-actions">
              <button type="button" className="btn-resume" onClick={() => addItem(si)}>+ Item</button>
              <button type="button" className="btn-resume btn-resume-danger" onClick={() => removeSection(si)}>Remove section</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-resume" onClick={addSection}>+ Add section</button>
      </div>
    );
  }

  return null;
}
