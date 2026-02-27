'use client';

import React from 'react';
import type { CoverLetterData } from '@/app/utils/coverLetterService';
import CoverLetterBodyContent from '@/app/cover-letters/components/CoverLetterBodyContent';
import CoverLetterPreview from './CoverLetterPreview';
import { getTemplateComponent } from './templateRegistry';

/**
 * Normalize API/state data so templates receive the exact shape old_frontend Preview.jsx expects.
 * Templates use: profile.full_name, profile.phone_number, profile.phone, profile.email,
 * profile.location, profile.linkedin, profile.website; recipient.*; introduction.greet_text,
 * introduction.intro_para; body (string); closing.text.
 */
function normalizeForOldTemplates(data: CoverLetterData): Record<string, unknown> {
  const profile = data.profile ?? {};
  const recipient = data.recipient ?? {};
  const introduction = data.introduction ?? {};
  const closing = data.closing ?? {};
  const p = profile as unknown as Record<string, unknown>;
  const r = recipient as unknown as Record<string, unknown>;
  const intro = introduction as unknown as Record<string, unknown>;
  const clos = closing as unknown as Record<string, unknown>;

  return {
    ...data,
    profile: {
      ...profile,
      full_name: String(p.full_name ?? p.fullname ?? p.fullName ?? ''),
      email: String(p.email ?? ''),
      phone_number: String(p.phone_number ?? p.phone ?? ''),
      phone: String(p.phone_number ?? p.phone ?? ''),
      location: String(p.location ?? ''),
      linkedin_profile: String(p.linkedin_profile ?? p.linkedin ?? ''),
      linkedin: String(p.linkedin_profile ?? p.linkedin ?? ''),
      portfolio_website: String(p.portfolio_website ?? p.website ?? ''),
      website: String(p.portfolio_website ?? p.website ?? ''),
    },
    recipient: {
      ...recipient,
      company_name: String(r.company_name ?? ''),
      hiring_manager_name: String(r.hiring_manager_name ?? ''),
      job_title: String(r.job_title ?? ''),
      company_address: String(r.company_address ?? ''),
    },
    introduction: {
      ...introduction,
      greet_text: String(intro.greet_text ?? 'Dear Hiring Manager,'),
      intro_para: String(intro.intro_para ?? ''),
    },
    body: typeof data.body === 'string' ? data.body : '',
    closing: {
      ...closing,
      text: String(clos.text ?? 'Sincerely,'),
    },
    cover_style: data.cover_style ?? { font: 'Arial', color: '#000000' },
  };
}

/**
 * Resolve selectedTemplate: either already a component name (e.g. "TemplateModernCorporate")
 * or a slug (e.g. "modern-corporate") that we map via getTemplateComponent.
 */
function resolveSelectedTemplate(coverTemplateCategory: string): string {
  if (!coverTemplateCategory || typeof coverTemplateCategory !== 'string') return 'TemplateModernCorporate';
  const s = coverTemplateCategory.trim();
  // If it looks like a component name (PascalCase, e.g. TemplateModernCorporate or StartupTemplate), use it
  if (/^[A-Z][a-zA-Z0-9]+$/.test(s) || s.startsWith('Template') || s.endsWith('Template')) {
    return s;
  }
  return getTemplateComponent(s) || 'TemplateModernCorporate';
}

interface CoverLetterTemplateRendererProps {
  data: CoverLetterData | null;
  className?: string;
}

/**
 * Renders the cover letter using the template selected when the letter was created
 * (stored in data.cover_template_category). Uses old_frontend templates via CoverLetterPreview.
 */
export default function CoverLetterTemplateRenderer({ data, className = '' }: CoverLetterTemplateRendererProps) {
  if (!data) {
    return (
      <div className={className}>
        <CoverLetterBodyContent data={null} />
      </div>
    );
  }

  const selectedTemplate = resolveSelectedTemplate(data.cover_template_category || '');
  const coverLetterData = normalizeForOldTemplates(data);
  const font = data.cover_style?.font ?? 'Arial';

  return (
    <div className={`cover-letter-template-wrapper ${className}`}>
      <CoverLetterPreview
        coverLetterData={coverLetterData}
        selectedTemplate={selectedTemplate}
        font={font}
      />
    </div>
  );
}
