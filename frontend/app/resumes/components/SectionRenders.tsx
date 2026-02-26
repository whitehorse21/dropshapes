'use client';

import React from 'react';

export interface SectionStyle {
  sectionTitleColor?: string;
  fontSizes?: { name?: string; profession?: string; sectionTitle?: string; body?: string };
  profilePicture?: boolean;
  profilePictureAlignment?: string;
  datePosition?: string;
  sidebarBg?: string;
  sidebarColor?: string;
  skillColors?: Record<string, string>;
  tagBg?: string;
  tagColor?: string;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const sectionRenderers: Record<
  string,
  (props: { title?: string; data: unknown; style: SectionStyle; isInline?: boolean }) => React.ReactNode
> = {
  header: ({ data, style }) => {
    const d = data as { firstName?: string; lastName?: string; profession?: string; profile_image?: string | null };
    const alignment = style.profilePictureAlignment || 'center';
    let containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
    };
    let imgStyle: React.CSSProperties = {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
    };
    let contentStyle: React.CSSProperties = { textAlign: 'center' };
    if (alignment === 'left') {
      containerStyle.flexDirection = 'row';
      contentStyle.textAlign = 'left';
      imgStyle.marginRight = '20px';
    } else if (alignment === 'right') {
      containerStyle.flexDirection = 'row-reverse';
      contentStyle.textAlign = 'right';
      imgStyle.marginLeft = '20px';
    } else {
      containerStyle.flexDirection = 'column';
      imgStyle.marginBottom = '10px';
    }
    const name = [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Resume';
    const imgSrc = d.profile_image || undefined;
    return (
      <div className="resume-tpl-header-section" style={containerStyle}>
        {style.profilePicture && imgSrc && (
          <img src={imgSrc} alt="Profile" className="resume-tpl-profile-pic" style={imgStyle} />
        )}
        <div style={contentStyle} className="resume-tpl-header-info">
          <h1 style={{ margin: 0, fontWeight: 700 }}>{name}</h1>
          {d.profession && <div style={{ marginTop: '4px' }}>{d.profession}</div>}
        </div>
      </div>
    );
  },

  contact: ({ title = 'Contact', data, style, isInline = false }) => {
    const d = data as {
      location?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
    };
    return (
      <div className={isInline ? 'resume-tpl-contact-inline' : 'resume-tpl-contact-section'}>
        {!isInline && (
          <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
            {title}
          </h2>
        )}
        {isInline ? (
          <div className="resume-tpl-contact-inline-inner">
            {d.location && <span>{d.location}</span>}
            {d.phone && <span>{d.phone}</span>}
            {d.email && <span>{d.email}</span>}
            {d.website && (
              <span>
                <a href={d.website} style={{ color: 'inherit' }} target="_blank" rel="noopener noreferrer">
                  {d.website}
                </a>
              </span>
            )}
          </div>
        ) : (
          <>
            {d.location && <div>Location: {d.location}</div>}
            {d.address && <div>Address: {d.address}</div>}
            {d.phone && <div>Phone: {d.phone}</div>}
            {d.email && <div>Email: {d.email}</div>}
            {d.website && (
              <div>
                Website: <a href={d.website} target="_blank" rel="noopener noreferrer">{d.website}</a>
              </div>
            )}
          </>
        )}
      </div>
    );
  },

  summary: ({ title, data, style }) => (
    <div className="resume-tpl-section">
      <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
        {title}
      </h2>
      <p className="resume-tpl-body">{String(data || '')}</p>
    </div>
  ),

  experience: ({ title, data, style }) => {
    const items = (Array.isArray(data) ? data : []) as Array<{
      role?: string;
      company?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    const datePos = style.datePosition === 'right';
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        {items.map((item, i) => (
          <div key={i} className="resume-tpl-item">
            {datePos ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <div>
                  <strong>{item.role}</strong>
                  {(item.company || item.location) && (
                    <> | {[item.company, item.location].filter(Boolean).join(', ')}</>
                  )}
                </div>
                <div className="resume-tpl-dates">
                  {formatDate(item.startDate)} – {item.current ? 'Present' : formatDate(item.endDate) || 'Present'}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{item.role}</strong>
                  {(item.company || item.location) && (
                    <> | {[item.company, item.location].filter(Boolean).join(', ')}</>
                  )}
                </div>
                <div className="resume-tpl-dates">
                  {formatDate(item.startDate)} – {item.current ? 'Present' : formatDate(item.endDate) || 'Present'}
                </div>
              </>
            )}
            {item.description && <p className="resume-tpl-body" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>}
          </div>
        ))}
      </div>
    );
  },

  education: ({ title, data, style }) => {
    const items = (Array.isArray(data) ? data : []) as Array<{
      degree?: string;
      institution?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }>;
    const datePos = style.datePosition === 'right';
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        {items.map((item, i) => (
          <div key={i} className="resume-tpl-item">
            {datePos ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <div>
                  <strong>{item.degree}</strong>, {item.institution}
                </div>
                <div className="resume-tpl-dates">
                  {formatDate(item.startDate)} – {item.current ? 'Present' : formatDate(item.endDate) || 'Present'}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{item.degree}</strong>, {item.institution}
                </div>
                <div className="resume-tpl-dates">
                  {formatDate(item.startDate)} – {item.current ? 'Present' : formatDate(item.endDate) || 'Present'}
                </div>
              </>
            )}
            {item.field && <p className="resume-tpl-body">{item.field}</p>}
          </div>
        ))}
      </div>
    );
  },

  skills: ({ title, data, style }) => {
    const items = (Array.isArray(data) ? data : []) as Array<{ name?: string; level?: string }>;
    const valid = items.filter((s) => s?.name?.trim());
    if (!valid.length) return null;
    const getWidth = (level?: string) => {
      const l = (level || '').toLowerCase();
      if (l === 'expert') return '100%';
      if (l === 'advanced') return '66%';
      return '33%';
    };
    const skillColors = style.skillColors || {};
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        <div className="resume-tpl-skills-list">
          {valid.map((skill, i) => (
            <div key={i} className="resume-tpl-skill">
              <span>{skill.name}</span>
              {skill.level && (
                <div className="resume-tpl-skill-bar">
                  <div
                    className="resume-tpl-skill-level"
                    style={{
                      width: getWidth(skill.level),
                      backgroundColor: skillColors[skill.level.toLowerCase()] || '#95a5a6',
                      height: '100%',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },

  languages: ({ title, data, style }) => {
    const items = (Array.isArray(data) ? data : []) as Array<{ name?: string; level?: string }>;
    const valid = items.filter((l) => l?.name?.trim());
    if (!valid.length) return null;
    const getWidth = (level?: string) => {
      const l = (level || '').toLowerCase();
      if (['expert', 'native'].includes(l)) return '100%';
      if (l === 'advanced') return '66%';
      return '33%';
    };
    const skillColors = style.skillColors || {};
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        <div className="resume-tpl-languages-list">
          {valid.map((lang, i) => (
            <div key={i} className="resume-tpl-language">
              <span>{lang.name}</span>
              {lang.level && (
                <div className="resume-tpl-language-bar">
                  <div
                    className="resume-tpl-language-level"
                    style={{
                      width: getWidth(lang.level),
                      backgroundColor: skillColors[lang.level.toLowerCase()] || '#95a5a6',
                      height: '100%',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },

  hobbies: ({ title, data, style }) => {
    const tags = (Array.isArray(data) ? data : []) as string[];
    if (!tags.length) return null;
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        <div className="resume-tpl-tags">
          {tags.map((tag, i) => (
            <span key={i} className="resume-tpl-tag" style={{ background: style.tagBg, color: style.tagColor }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  },

  certifications: ({ title, data, style }) => {
    const items = (Array.isArray(data) ? data : []) as Array<{ name?: string; organization?: string; endDate?: string }>;
    if (!items.length) return null;
    return (
      <div className="resume-tpl-section">
        <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
          {title}
        </h2>
        <ul className="resume-tpl-list">
          {items.map((item, i) => (
            <li key={i} style={{ display: style.datePosition === 'right' ? 'flex' : 'block', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span>{item.name} – {item.organization}</span>
              {item.endDate && <span className="resume-tpl-dates">{formatDate(item.endDate)}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  },

  custom_section: ({ data, style }) => {
    const sections = (Array.isArray(data) ? data : []) as Array<{ title?: string; items?: Array<{ name?: string; description?: string }> }>;
    if (!sections.length) return null;
    return (
      <div className="resume-tpl-section">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="resume-tpl-section-title" style={{ color: style.sectionTitleColor || '#000' }}>
              {section.title || 'Section'}
            </h2>
            {(section.items || []).map((item, i) => (
              <div key={i} className="resume-tpl-item">
                <strong>{item.name}</strong>
                {item.description && <>: {item.description}</>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export function getSectionData(sectionKey: string, resumeData: {
  personalInfo?: Record<string, unknown>;
  profession?: string;
  profile_image?: string | null;
  summary?: string;
  experience?: unknown[];
  education?: unknown[];
  skills?: unknown[];
  languages?: unknown[];
  hobbies?: string[];
  certifications?: unknown[];
  custom_section?: unknown[];
}) {
  const pi = resumeData.personalInfo || {};
  if (sectionKey === 'contact') return pi;
  if (sectionKey === 'header') {
    return {
      firstName: pi.firstName,
      lastName: pi.lastName,
      profession: resumeData.profession,
      profile_image: resumeData.profile_image ?? undefined,
    };
  }
  const key = sectionKey === 'custom_section' ? 'custom_section' : sectionKey;
  const raw = (resumeData as Record<string, unknown>)[key];
  if (raw !== undefined) return raw;
  return null;
}

export function renderSection(
  sectionKey: string,
  resumeData: Parameters<typeof getSectionData>[1],
  style: SectionStyle,
  layout?: { sectionPlacement?: { contact?: Record<string, { mode?: string }> }; type?: string }
): React.ReactNode {
  const data = getSectionData(sectionKey, resumeData);
  if (data === null || data === undefined) return null;
  const placement = layout?.sectionPlacement?.contact?.[layout?.type || 'single'];
  const isInlineContact = sectionKey === 'contact' && placement?.mode === 'inline';
  const title = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const renderer = sectionRenderers[sectionKey];
  if (!renderer) return null;
  return renderer({
    title,
    data,
    style,
    isInline: sectionKey === 'contact' ? isInlineContact : undefined,
  });
}
