export const coverLetterSteps = [
  { name: 'details', label: 'Title & Your Details' },
  { name: 'recipient', label: 'Recipient' },
  { name: 'content', label: 'Content' },
  { name: 'preview', label: 'Preview' },
] as const;

export type CoverLetterStepName = (typeof coverLetterSteps)[number]['name'];
