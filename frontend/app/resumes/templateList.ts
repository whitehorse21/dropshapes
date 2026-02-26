/**
 * Resume template list for the builder UI.
 * Uses templates from frontend/app/templates/index.js (single source of truth).
 */

// @ts-expect-error JS module - templates have id, name, category, thumbnail, layout, hasSidebar
import { templates } from '@/app/templates';

export interface ResumeTemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
}

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  hasSidebar?: boolean;
  layout?: { type?: string };
}

function getDescription(t: TemplateRow): string {
  if (t.layout?.type === 'double') return t.hasSidebar ? 'Two-column layout with sidebar' : 'Two-column layout';
  return 'Single-column layout';
}

export const resumeTemplates: ResumeTemplateOption[] = (templates as TemplateRow[]).map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: getDescription(t),
  thumbnail: t.thumbnail || '',
}));
