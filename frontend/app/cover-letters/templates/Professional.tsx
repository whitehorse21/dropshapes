'use client';

import React from 'react';
import type { CoverLetterData } from '@/app/utils/coverLetterService';
import { getCoverLetterFontFamily } from '@/app/utils/coverLetterFont';

const dateStr = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function TemplateProfessional({ data }: { data: CoverLetterData }) {
  const { profile = {}, recipient = {}, introduction = {}, body = '', closing = {} } = data;
  const font = getCoverLetterFontFamily(data.cover_style?.font);

  return (
    <div
      className="cover-letter-tpl cover-letter-tpl-professional"
      style={{ fontFamily: font, minHeight: '11in', color: '#1a1a1a' }}
    >
      <div className="cover-letter-tpl-pro-header">
        <h1>{profile.full_name || 'Your Name'}</h1>
        <div className="cover-letter-tpl-pro-contact">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {(profile.linkedin_profile || profile.portfolio_website) && (
            <p>
              {profile.portfolio_website && <a href={profile.portfolio_website}>Portfolio</a>}
              {profile.portfolio_website && profile.linkedin_profile && ' · '}
              {profile.linkedin_profile && <a href={profile.linkedin_profile}>LinkedIn</a>}
            </p>
          )}
        </div>
      </div>

      <div className="cover-letter-tpl-date">{dateStr}</div>

      <div className="cover-letter-tpl-recipient">
        {recipient.hiring_manager_name && <p className="font-semibold">{recipient.hiring_manager_name}</p>}
        {recipient.job_title && <p><strong>Re: Application for {recipient.job_title} Position</strong></p>}
        {recipient.company_name && <p className="font-semibold">{recipient.company_name}</p>}
        {recipient.company_address && <p>{recipient.company_address}</p>}
      </div>

      <div className="cover-letter-tpl-greeting">
        <p>{introduction.greet_text || `Dear ${recipient.hiring_manager_name || 'Hiring Manager'},`}</p>
      </div>

      {introduction.intro_para && (
        <div className="cover-letter-tpl-intro">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      <div className="cover-letter-tpl-body">
        {body ? <div dangerouslySetInnerHTML={{ __html: body }} /> : null}
      </div>

      <div className="cover-letter-tpl-closing">
        {closing.text && <p>{closing.text}</p>}
        <div className="cover-letter-tpl-signature-block">
          <div className="cover-letter-tpl-signature-line" />
          <p className="cover-letter-tpl-signature">{profile.full_name || 'Your Name'}</p>
        </div>
      </div>
    </div>
  );
}
