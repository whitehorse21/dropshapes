/**
 * Cover letter template list for template selection.
 * Uses coverLetterTemplatesMetadata.js as source.
 */

import { coverLetterTemplateMetaData } from '@/app/utils/coverLetterTemplatesMetadata';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export interface CoverLetterTemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  isPremium?: boolean;
}

interface MetaRow {
  name: string;
  description: string;
  image: string;
  category: string;
  isPremium?: boolean;
}

export const coverLetterTemplates: CoverLetterTemplateOption[] = (
  coverLetterTemplateMetaData as MetaRow[]
).map((t) => ({
  id: slugify(t.name),
  name: t.name,
  category: t.category,
  description: t.description,
  thumbnail: t.image || '',
  isPremium: t.isPremium,
}));
