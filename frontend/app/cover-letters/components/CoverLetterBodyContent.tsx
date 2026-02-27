'use client';

import React from 'react';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

interface CoverLetterBodyContentProps {
  data: CoverLetterData | null;
  className?: string;
  /** 'document' = paper-style layout for preview step; default = minimal */
  variant?: 'default' | 'document';
}

export default function CoverLetterBodyContent({
  data,
  className = '',
  variant = 'default',
}: CoverLetterBodyContentProps) {
  if (!data) {
    return (
      <div className={`cover-letter-render ${className}`}>
        <p>No cover letter data.</p>
      </div>
    );
  }

  const style = data.cover_style ?? { font: 'Arial', color: '#1a1a1a' };
  const fontFamily = style.font || 'Georgia, serif';
  const color = style.color || '#1a1a1a';

  const profile = data.profile ?? {};
  const recipient = data.recipient ?? {};
  const introduction = data.introduction ?? { greet_text: 'Dear Hiring Manager,', intro_para: '' };
  const closing = data.closing ?? { text: 'Sincerely,' };

  const hasLetterhead =
    variant === 'document' &&
    (profile.full_name || profile.email || profile.phone_number || profile.location);

  const containerClass = [
    'cover-letter-render',
    variant === 'document' ? 'cover-letter-render--document' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties = {
    fontFamily,
    color,
    lineHeight: 1.65,
    fontSize: '11pt',
  };

  return (
    <div className={containerClass} style={containerStyle}>
      {variant === 'document' && (
        <div className="cover-letter-render__paper">
          <div className="cover-letter-render__inner">
            {hasLetterhead && (
              <header className="cover-letter-render__letterhead">
                {profile.full_name && (
                  <div className="cover-letter-render__letterhead-name">{profile.full_name}</div>
                )}
                <div className="cover-letter-render__letterhead-contact">
                  {profile.email && <span>{profile.email}</span>}
                  {profile.phone_number && <span>{profile.phone_number}</span>}
                  {profile.location && <span>{profile.location}</span>}
                  {(profile.linkedin_profile || profile.portfolio_website) && (
                    <span>
                      {profile.linkedin_profile && <a href={profile.linkedin_profile} rel="noopener noreferrer" target="_blank">LinkedIn</a>}
                      {profile.linkedin_profile && profile.portfolio_website && ' · '}
                      {profile.portfolio_website && <a href={profile.portfolio_website} rel="noopener noreferrer" target="_blank">Portfolio</a>}
                    </span>
                  )}
                </div>
              </header>
            )}

            <h1 className="cover-letter-render__title">
              {data.cover_letter_title || 'Cover Letter'}
            </h1>

            {(recipient.company_name ||
              recipient.hiring_manager_name ||
              recipient.job_title ||
              recipient.company_address) && (
              <div className="cover-letter-render__recipient">
                {recipient.company_name && <div>{recipient.company_name}</div>}
                {recipient.hiring_manager_name && <div>{recipient.hiring_manager_name}</div>}
                {recipient.job_title && <div>{recipient.job_title}</div>}
                {recipient.company_address && (
                  <div className="cover-letter-render__address">{recipient.company_address}</div>
                )}
              </div>
            )}

            <div className="cover-letter-render__body">
              {introduction.greet_text && (
                <p className="cover-letter-render__greeting">{introduction.greet_text}</p>
              )}

              {introduction.intro_para && (
                <p className="cover-letter-render__intro">{introduction.intro_para}</p>
              )}

              {data.body && (
                <div
                  className="cover-letter-render__main"
                  dangerouslySetInnerHTML={{ __html: data.body }}
                />
              )}

              {closing.text && <p className="cover-letter-render__closing">{closing.text}</p>}

              {profile.full_name && (
                <p className="cover-letter-render__signature">{profile.full_name}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {variant !== 'document' && (
        <>
          <h1 className="cover-letter-render__title" style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 700 }}>
            {data.cover_letter_title || 'Cover Letter'}
          </h1>
          {(recipient.company_name || recipient.hiring_manager_name || recipient.job_title || recipient.company_address) && (
            <div style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
              {recipient.company_name && <div>{recipient.company_name}</div>}
              {recipient.hiring_manager_name && <div>{recipient.hiring_manager_name}</div>}
              {recipient.job_title && <div>{recipient.job_title}</div>}
              {recipient.company_address && <div style={{ whiteSpace: 'pre-wrap' }}>{recipient.company_address}</div>}
            </div>
          )}
          {introduction.greet_text && <p style={{ marginBottom: '12px' }}>{introduction.greet_text}</p>}
          {introduction.intro_para && <p style={{ marginBottom: '16px' }}>{introduction.intro_para}</p>}
          {data.body && (
            <div className="cover-letter-body" style={{ marginBottom: '20px', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: data.body }} />
          )}
          {closing.text && <p style={{ marginTop: '20px', marginBottom: '8px' }}>{closing.text}</p>}
          {profile.full_name && <p style={{ marginTop: '16px', fontWeight: 600 }}>{profile.full_name}</p>}
        </>
      )}
    </div>
  );
}
