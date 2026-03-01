'use client';

import React from 'react';
import type {
  CoverLetterData,
  CoverLetterProfile,
  CoverLetterRecipient,
  CoverLetterIntroduction,
  CoverLetterClosing,
} from '@/app/utils/coverLetterService';
import { getCoverLetterFontFamily } from '@/app/utils/coverLetterFont';

export default function TemplateModernCorporate({
  data,
}: {
  data: CoverLetterData;
}) {
  const {
    profile = {} as CoverLetterProfile,
    recipient = {} as CoverLetterRecipient,
    introduction = {} as CoverLetterIntroduction,
    body = '',
    closing = {} as CoverLetterClosing,
  } = data;
  const font = getCoverLetterFontFamily(data.cover_style?.font);

  return (
    <div
      className="cover-letter-tpl cover-letter-tpl-modern-corporate"
      style={{ fontFamily: font, minHeight: '11in', color: '#1a1a1a' }}
    >
      <div className="cover-letter-tpl-header">
        <h1>{profile.full_name || 'Your Name'}</h1>
        <div className="cover-letter-tpl-contact">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {profile.location && <p>{profile.location}</p>}
        </div>
      </div>

      <div className="cover-letter-tpl-recipient">
        <p className="cover-letter-tpl-recipient-name">{recipient.hiring_manager_name || 'Hiring Manager'}</p>
        {recipient.job_title && <p>{recipient.job_title}</p>}
        <p>{recipient.company_name || 'Company Name'}</p>
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
        <p>{closing.text || 'Sincerely,'}</p>
        <p className="cover-letter-tpl-signature">{profile.full_name || 'Your Name'}</p>
      </div>
    </div>
  );
}
