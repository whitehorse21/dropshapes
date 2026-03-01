/**
 * Cover letter state: localStorage + types.
 * Matches backend CoverLetterCreate / CoverLetterUpdate shape.
 */

const COVER_LETTER_KEY = 'coverLetterData';

export interface CoverLetterProfile {
  full_name: string;
  email: string;
  phone_number: string;
  location: string;
  linkedin_profile: string;
  portfolio_website: string;
}

export interface CoverLetterRecipient {
  company_name: string;
  hiring_manager_name: string;
  job_title: string;
  company_address: string;
}

export interface CoverLetterIntroduction {
  greet_text: string;
  intro_para: string;
}

export interface CoverLetterClosing {
  text: string;
}

export interface CoverLetterStyle {
  font: string;
  color: string;
}

export interface CoverLetterData {
  id?: number;
  cover_letter_title: string;
  cover_letter_type: string;
  cover_template_category: string;
  profile: CoverLetterProfile;
  recipient: CoverLetterRecipient;
  introduction: CoverLetterIntroduction;
  body: string;
  closing: CoverLetterClosing;
  cover_style: CoverLetterStyle;
}

export const defaultProfile: CoverLetterProfile = {
  full_name: '',
  email: '',
  phone_number: '',
  location: '',
  linkedin_profile: '',
  portfolio_website: '',
};

export const defaultRecipient: CoverLetterRecipient = {
  company_name: '',
  hiring_manager_name: '',
  job_title: '',
  company_address: '',
};

export const defaultIntroduction: CoverLetterIntroduction = {
  greet_text: 'Dear Hiring Manager,',
  intro_para: '',
};

export const defaultClosing: CoverLetterClosing = {
  text: 'Sincerely,',
};

export const defaultCoverStyle: CoverLetterStyle = {
  font: 'Arial',
  color: '#000000',
};

export const defaultCoverLetterData: CoverLetterData = {
  cover_letter_title: '',
  cover_letter_type: 'professional',
  cover_template_category: 'professional',
  profile: { ...defaultProfile },
  recipient: { ...defaultRecipient },
  introduction: { ...defaultIntroduction },
  body: '',
  closing: { ...defaultClosing },
  cover_style: { ...defaultCoverStyle },
};

export function getCoverLetterFromLocalDB(): CoverLetterData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COVER_LETTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CoverLetterData;
    return {
      ...defaultCoverLetterData,
      ...parsed,
      profile: { ...defaultProfile, ...parsed.profile },
      recipient: { ...defaultRecipient, ...parsed.recipient },
      introduction: { ...defaultIntroduction, ...parsed.introduction },
      closing: { ...defaultClosing, ...parsed.closing },
      cover_style: { ...defaultCoverStyle, ...parsed.cover_style },
    };
  } catch {
    return null;
  }
}

export function saveCoverLetterData(data: CoverLetterData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COVER_LETTER_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function updateCoverLetterData(updates: Partial<CoverLetterData>): void {
  const current = getCoverLetterFromLocalDB();
  const next = current
    ? { ...current, ...updates }
    : { ...defaultCoverLetterData, ...updates };
  saveCoverLetterData(next);
}

export function clearCoverLetterData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COVER_LETTER_KEY);
  } catch {
    // ignore
  }
}

/** Ensure object has only string values for API (Pydantic expects no null/undefined). */
function toPlainStrings<T extends object>(
  defaults: T,
  source: Partial<T> | null | undefined
): Record<keyof T, string> {
  const out = {} as Record<keyof T, string>;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const v = source?.[key] ?? (defaults as Record<keyof T, unknown>)[key];
    out[key] = typeof v === 'string' ? v : '';
  }
  return out;
}

/** Build payload for POST create (and PUT update). All nested fields are plain strings for backend. */
export function buildCoverLetterPayload(data: CoverLetterData): Record<string, unknown> {
  return {
    cover_letter_title: String(data.cover_letter_title ?? '').trim() || 'New Cover Letter',
    cover_letter_type: String(data.cover_letter_type ?? 'professional').trim() || 'professional',
    cover_template_category: String(data.cover_template_category ?? 'professional').trim() || 'professional',
    profile: toPlainStrings(defaultProfile, data.profile),
    recipient: toPlainStrings(defaultRecipient, data.recipient),
    introduction: toPlainStrings(defaultIntroduction, data.introduction),
    body: String(data.body ?? ''),
    closing: toPlainStrings(defaultClosing, data.closing),
    cover_style: toPlainStrings(defaultCoverStyle, data.cover_style),
  };
}
