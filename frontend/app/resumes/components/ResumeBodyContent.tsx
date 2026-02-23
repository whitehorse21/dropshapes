'use client';

import React from 'react';
import type { ResumeData } from '@/app/utils/resumeService';

const resumeContentStyles: React.CSSProperties = {
  padding: '24px',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  background: 'var(--surface)',
};

export default function ResumeBodyContent({
  resumeData,
  className,
  ref: refProp,
  ...rest
}: {
  resumeData: ResumeData;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const pi = resumeData.personalInfo || {};
  const name = [pi.firstName, pi.lastName].filter(Boolean).join(' ') || 'Resume';

  return (
    <div ref={refProp} className={className} style={resumeContentStyles} {...rest}>
      <h2 style={{ marginBottom: '8px' }}>{name}</h2>
      {resumeData.profession && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{resumeData.profession}</p>
      )}
      <p style={{ marginBottom: '8px' }}>{pi.email} {pi.phone && ` • ${pi.phone}`}</p>
      {pi.location && <p style={{ marginBottom: '16px' }}>{pi.location}</p>}
      {pi.linkedin && <p><a href={pi.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
      {pi.website && <p><a href={pi.website} target="_blank" rel="noopener noreferrer">Website</a></p>}

      {resumeData.summary && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Summary</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{resumeData.summary}</p>
        </div>
      )}

      {resumeData.experience?.filter((e) => e.company || e.role).length ? (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Experience</h3>
          {resumeData.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <strong>{e.role}</strong> at {e.company} {e.location && ` · ${e.location}`}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</p>
              {e.description && <p style={{ whiteSpace: 'pre-wrap' }}>{e.description}</p>}
            </div>
          ))}
        </div>
      ) : null}

      {resumeData.education?.filter((e) => e.institution || e.degree).length ? (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Education</h3>
          {resumeData.education.map((e, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <strong>{e.degree}</strong> {e.field && `in ${e.field}`} · {e.institution}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{e.startDate} – {e.endDate || 'Present'}</p>
            </div>
          ))}
        </div>
      ) : null}

      {resumeData.skills?.filter((s) => s.name).length ? (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Skills</h3>
          <p>{resumeData.skills.filter((s) => s.name).map((s) => `${s.name}${s.level ? ` (${s.level})` : ''}`).join(', ')}</p>
        </div>
      ) : null}

      {resumeData.languages?.filter((l) => l.name).length ? (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '8px' }}>Languages</h3>
          <p>{resumeData.languages.filter((l) => l.name).map((l) => `${l.name}${l.level ? ` – ${l.level}` : ''}`).join(', ')}</p>
        </div>
      ) : null}

      {resumeData.hobbies?.length ? (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '8px' }}>Hobbies</h3>
          <p>{resumeData.hobbies.join(', ')}</p>
        </div>
      ) : null}

      {resumeData.certifications?.filter((c) => c.name || c.organization).length ? (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '8px' }}>Certifications</h3>
          {resumeData.certifications.map((c, i) => (
            <p key={i}>{c.name} – {c.organization}</p>
          ))}
        </div>
      ) : null}

      {resumeData.custom_section?.filter((s) => s.title || s.items?.some((i) => i.name)).length ? (
        <div style={{ marginTop: '24px' }}>
          {resumeData.custom_section.map((sec, si) => (
            <div key={si} style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '8px' }}>{sec.title || 'Section'}</h3>
              {(sec.items || []).map((item, ii) => (
                <p key={ii}><strong>{item.name}</strong> {item.description && ` – ${item.description}`}</p>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
