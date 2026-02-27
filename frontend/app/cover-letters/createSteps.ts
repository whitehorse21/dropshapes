/**
 * Steps matching old_frontend: profession, profile, introduction, body, closing.
 */
export const createSteps = [
  { name: 'profession', label: 'Profession' },
  { name: 'profile', label: 'Profile' },
  { name: 'introduction', label: 'Introduction' },
  { name: 'body', label: 'Body' },
  { name: 'closing', label: 'Closing' },
] as const;

export type CreateStepName = (typeof createSteps)[number]['name'];
