export const resumeSteps = [
  { name: 'profession', label: 'Profession' },
  { name: 'personal', label: 'Personal Info' },
  { name: 'experience', label: 'Experience' },
  { name: 'education', label: 'Education' },
  { name: 'extra', label: 'Extras' },
  { name: 'custom', label: 'Custom Section' },
] as const;

export type ResumeStepName = (typeof resumeSteps)[number]['name'];

export const resumeTemplates = [
  { id: 'classic', name: 'Classic', category: 'Classic', description: 'Clean and professional' },
  { id: 'modern', name: 'Modern', category: 'Modern', description: 'Contemporary layout' },
];
