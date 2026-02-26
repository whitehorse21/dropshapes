export const resumeSteps = [
  { name: 'profession', label: 'Profession' },
  { name: 'personal', label: 'Personal Info' },
  { name: 'experience', label: 'Experience' },
  { name: 'education', label: 'Education' },
  { name: 'extra', label: 'Extras' },
  { name: 'custom', label: 'Custom Section' },
] as const;

export type ResumeStepName = (typeof resumeSteps)[number]['name'];
