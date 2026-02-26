'use client';

import React from 'react';
import type { ResumeData } from '@/app/utils/resumeService';
import { renderSection, type SectionStyle } from './SectionRenders';

// Template shape from frontend/app/templates/index.js
interface TemplateLayout {
  type?: string;
  columns?: {
    main?: string[];
    sidebar?: string[];
    widths?: number[];
  };
  sectionPlacement?: Record<string, Record<string, { mode?: string; target?: string }>>;
}

interface TemplateStyle {
  fontFamily?: string;
  sidebarBg?: string;
  sidebarColor?: string;
  sectionTitleColor?: string;
  fontSizes?: { name?: string; profession?: string; sectionTitle?: string; body?: string };
  skillColors?: Record<string, string>;
  tagBg?: string;
  tagColor?: string;
  datePosition?: string;
  profilePicture?: boolean;
  profilePictureAlignment?: string;
}

interface TemplateDef {
  id: string;
  hasSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  layout?: TemplateLayout;
  style?: TemplateStyle;
}

// @ts-expect-error - templates is JS module with full layout/style
import { templates } from '@/app/templates';

const templatesList: TemplateDef[] = templates as TemplateDef[];

function getTemplate(templateId: string | undefined): TemplateDef | null {
  if (!templateId) return templatesList[0] || null;
  const found = templatesList.find((t) => t.id === templateId);
  return found || templatesList[0] || null;
}

const TemplateResumeRenderer = React.forwardRef<HTMLDivElement, {
  resumeData: ResumeData;
  className?: string;
}>(
  function TemplateResumeRendererInner({ resumeData, className, ...rest }, ref) {
  const templateId = resumeData.template_category || 'classic';
  const template = getTemplate(templateId);
  const containerRef = ref;

  if (!template) {
    return (
      <div ref={containerRef} className={className}>
        <p>Template not found.</p>
      </div>
    );
  }

  const { layout, style: templateStyle } = template;
  const hasSidebar = template.hasSidebar && (layout?.columns?.sidebar?.length ?? 0) > 0;
  const sidebarPosition = template.sidebarPosition || 'left';
  const mainOrder = layout?.columns?.main ?? [];
  const sidebarOrder = layout?.columns?.sidebar ?? [];

  const style: SectionStyle = {
    ...templateStyle,
    profilePicture: templateStyle?.profilePicture ?? true,
    profilePictureAlignment: templateStyle?.profilePictureAlignment ?? 'center',
    datePosition: templateStyle?.datePosition ?? 'right',
  };

  const fontSizes = templateStyle?.fontSizes ?? {};
  const bodySize = fontSizes.body || '12pt';

  const renderSections = (sectionKeys: string[]) =>
    sectionKeys.map((key) => {
      const node = renderSection(key, resumeData as Parameters<typeof renderSection>[1], style, layout);
      if (!node) return null;
      return <React.Fragment key={key}>{node}</React.Fragment>;
    });

  return (
    <div
      ref={containerRef}
      className={`resume-tpl-container ${hasSidebar ? 'resume-tpl-with-sidebar' : ''} resume-tpl-sidebar-${sidebarPosition} ${className ?? ''}`}
      style={{
        fontFamily: templateStyle?.fontFamily || 'Georgia, serif',
        fontSize: bodySize,
        backgroundColor: '#fff',
        color: '#000',
        ['--resume-tpl-name' as string]: fontSizes.name || '24pt',
        ['--resume-tpl-profession' as string]: fontSizes.profession || '16pt',
        ['--resume-tpl-section-title' as string]: fontSizes.sectionTitle || '14pt',
        ['--resume-tpl-body' as string]: bodySize,
      }}
    >
      {hasSidebar ? (
        <div className="resume-tpl-content-with-sidebar">
          {sidebarPosition === 'left' && (
            <aside
              className="resume-tpl-sidebar"
              style={{
                background: templateStyle?.sidebarBg || '#f8f8f8',
                color: templateStyle?.sidebarColor || '#000',
              }}
            >
              {renderSections(sidebarOrder)}
            </aside>
          )}
          <main className="resume-tpl-main">
            {renderSections(mainOrder)}
          </main>
          {sidebarPosition === 'right' && (
            <aside
              className="resume-tpl-sidebar"
              style={{
                background: templateStyle?.sidebarBg || '#f8f8f8',
                color: templateStyle?.sidebarColor || '#000',
              }}
            >
              {renderSections(sidebarOrder)}
            </aside>
          )}
        </div>
      ) : (
        <div className="resume-tpl-main resume-tpl-single-column">
          {renderSections([...mainOrder, ...sidebarOrder])}
        </div>
      )}
    </div>
  );
});

export default TemplateResumeRenderer;
