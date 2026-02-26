'use client';

import React from 'react';
import type { ResumeData } from '@/app/utils/resumeService';
import TemplateResumeRenderer from './TemplateResumeRenderer';

const resumeContentStyles: React.CSSProperties = {
  padding: '24px',
  border: '1px solid var(--glass-border)',
  borderRadius: '12px',
  background: 'var(--card-bg)',
};

/**
 * Renders resume content following the selected template (template_category).
 * Uses TemplateResumeRenderer so layout, sidebar, and style match the template
 * (modern, classic, minimalStandard, executiveStandardSidebar) as in old_frontend.
 */
const ResumeBodyContent = React.forwardRef<HTMLDivElement, {
  resumeData: ResumeData;
  className?: string;
}>(
  function ResumeBodyContentInner({ resumeData, className, ...rest }, ref) {
    return (
      <div className={className} style={resumeContentStyles} {...rest}>
        <TemplateResumeRenderer resumeData={resumeData} ref={ref} />
      </div>
    );
  }
);

ResumeBodyContent.displayName = 'ResumeBodyContent';

export default ResumeBodyContent;
