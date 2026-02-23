/**
 * Re-exports from the TypeScript resume service.
 * Kept so imports and tooling that resolve to .js still work.
 * For types, import from '@/app/utils/resumeService' in .ts/.tsx files (resolves to .ts).
 */
export {
  getResumeFromLocalDB,
  saveResumeData,
  updateResumeData,
  clearResumeData,
  defaultResumeData,
  defaultPersonalInfo,
  buildResumeCreatePayload,
  getResumeDataForCreate,
  apiResumeToFormData,
} from './resumeService.ts';
