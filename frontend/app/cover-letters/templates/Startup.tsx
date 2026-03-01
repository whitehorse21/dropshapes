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

const dateStr = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function TemplateStartup({ data }: { data: CoverLetterData }) {
  const {
    profile = {} as CoverLetterProfile,
    recipient = {} as CoverLetterRecipient,
    introduction = {} as CoverLetterIntroduction,
    body = '',
    closing = {} as CoverLetterClosing,
  } = data;
  const font = getCoverLetterFontFamily(data.cover_style?.font);
  const phone = profile.phone_number || (profile as unknown as Record<string, string>).phone;

  return (
    <div
      className="cover-letter-tpl cover-letter-tpl-startup"
      style={{ fontFamily: font, minHeight: '11in', color: '#1a1a1a' }}
    >
      <div className="cover-letter-tpl-startup-letterhead">
        <div className="cover-letter-tpl-startup-name">{profile.full_name || 'Your Name'}</div>
        <div className="cover-letter-tpl-startup-contact">
          {phone && <span>{phone}</span>}
          {profile.email && <><span> • </span><span>{profile.email}</span></>}
        </div>
      </div>

      <div className="cover-letter-tpl-startup-date">{dateStr}</div>

      {(recipient.hiring_manager_name || recipient.company_name) && (
        <div className="cover-letter-tpl-startup-recipient">
          {recipient.hiring_manager_name && <><span>{recipient.hiring_manager_name}</span><br /></>}
          {recipient.company_name && <span>{recipient.company_name}</span>}
        </div>
      )}

      {recipient.hiring_manager_name && (
        <div className="cover-letter-tpl-greeting">
          <p>Hey {recipient.hiring_manager_name}!</p>
        </div>
      )}

      {introduction.intro_para && (
        <div className="cover-letter-tpl-intro">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      {body && (
        <div className="cover-letter-tpl-body" dangerouslySetInnerHTML={{ __html: body }} />
      )}

      {closing.text && <div className="cover-letter-tpl-closing"><p>{closing.text}</p></div>}

      <div className="cover-letter-tpl-startup-signature">
        <div className="cover-letter-tpl-startup-signature-name">{profile.full_name || 'Your Name'}</div>
        <div className="cover-letter-tpl-startup-signature-title">{recipient.job_title || 'Professional'}</div>
      </div>
    </div>
  );
}
