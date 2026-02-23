/**
 * Resume state: localStorage + in-memory (no RxJS).
 * Matches backend ResumeDataCreate / format_structured_response shape.
 */

const RESUME_KEY = 'resumeData';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  address?: string;
  linkedin?: string;
  website?: string;
}

export interface ExperienceItem {
  id?: number;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description?: string;
  skills?: string[];
}

export interface EducationItem {
  id?: number;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface SkillItem {
  name: string;
  level: string;
}

export interface LanguageItem {
  name: string;
  level: string;
}

export interface CertificationItem {
  id?: number;
  name: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  certificateLink?: string;
}

export interface CustomSectionItem {
  name: string;
  description?: string;
}

export interface CustomSection {
  title: string;
  items: CustomSectionItem[];
}

export interface ResumeData {
  id?: number;
  resume_title: string;
  resume_type?: string;
  template_category?: string;
  profile_image?: string | null;
  personalInfo: PersonalInfo;
  profession: string;
  /** Optional job description (frontend-only, not sent to API) */
  jobDescription?: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  hobbies: string[];
  certifications: CertificationItem[];
  custom_section: CustomSection[];
}

export const defaultPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  address: '',
  linkedin: '',
  website: '',
};

export const defaultResumeData: ResumeData = {
  id: undefined,
  resume_title: 'New Resume',
  resume_type: '',
  template_category: 'classic',
  profile_image: null,
  personalInfo: { ...defaultPersonalInfo },
  profession: '',
  jobDescription: '',
  summary: '',
  experience: [
    {
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      skills: [],
    },
  ],
  education: [
    {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
    },
  ],
  skills: [{ name: '', level: '' }],
  languages: [{ name: '', level: '' }],
  hobbies: [],
  certifications: [
    {
      name: '',
      organization: '',
      startDate: '',
      endDate: '',
      certificateLink: '',
    },
  ],
  custom_section: [{ title: '', items: [{ name: '', description: '' }] }],
};

export function getResumeFromLocalDB(): ResumeData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    return data && typeof data === 'object' ? (data as unknown as ResumeData) : null;
  } catch {
    return null;
  }
}

export function saveResumeData(data: ResumeData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('resumeService saveResumeData', e);
  }
}

export function updateResumeData(partial: Partial<ResumeData>): ResumeData {
  const current = getResumeFromLocalDB() || defaultResumeData;
  const updated: ResumeData = {
    ...current,
    ...partial,
    personalInfo: { ...current.personalInfo, ...(partial.personalInfo || {}) },
  };
  saveResumeData(updated);
  return updated;
}

export function clearResumeData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch (e) {
    console.error('resumeService clearResumeData', e);
  }
}

/** Get merged resume data suitable for create: localStorage + fallback, merged with defaults. */
export function getResumeDataForCreate(fallback?: Partial<ResumeData> | null): ResumeData {
  const stored = getResumeFromLocalDB();
  const source = (stored ?? fallback ?? {}) as Partial<ResumeData>;
  const base = defaultResumeData;
  const basePi = defaultPersonalInfo ?? base.personalInfo ?? {};
  const sourcePi = source.personalInfo ?? {};
  return {
    ...base,
    ...source,
    personalInfo: { ...basePi, ...sourcePi },
    experience: Array.isArray(source.experience) ? source.experience : base.experience,
    education: Array.isArray(source.education) ? source.education : base.education,
    skills: Array.isArray(source.skills) ? source.skills : base.skills,
    languages: Array.isArray(source.languages) ? source.languages : base.languages,
    hobbies: Array.isArray(source.hobbies) ? source.hobbies : base.hobbies,
    certifications: Array.isArray(source.certifications) ? source.certifications : base.certifications,
    custom_section: Array.isArray(source.custom_section) ? source.custom_section : base.custom_section,
  };
}

/** Build payload for POST /resumes/json (ResumeDataCreate) */
export function buildResumeCreatePayload(data: ResumeData) {
  const hasCustomTitle = data.resume_title?.trim() && data.resume_title?.trim() !== 'New Resume';
  const resumeTitle = hasCustomTitle
    ? data.resume_title!.trim()
    : (data.profession?.trim() || 'Resume');
  return {
    resume_title: resumeTitle,
    resume_type: data.resume_type || 'TemplateProfessional',
    template_category: data.template_category || 'classic',
    profile_image: data.profile_image || undefined,
    personalInfo: {
      firstName: data.personalInfo?.firstName ?? '',
      lastName: data.personalInfo?.lastName ?? '',
      email: data.personalInfo?.email ?? '',
      phone: data.personalInfo?.phone ?? undefined,
      location: data.personalInfo?.location ?? undefined,
      address: data.personalInfo?.address ?? undefined,
      linkedin: data.personalInfo?.linkedin ?? undefined,
      website: data.personalInfo?.website ?? undefined,
    },
    profession: data.profession || undefined,
    summary: data.summary || undefined,
    experience: (data.experience || []).filter((e) => e.company?.trim() || e.role?.trim()).map((e) => ({
      company: e.company || '',
      role: e.role || '',
      startDate: e.startDate || '',
      endDate: e.endDate || undefined,
      current: e.current ?? false,
      location: e.location || undefined,
      description: e.description || undefined,
      skills: e.skills || [],
    })),
    education: (data.education || []).filter((e) => e.institution?.trim() || e.degree?.trim()).map((e) => ({
      institution: e.institution || '',
      degree: e.degree || '',
      field: e.field || undefined,
      startDate: e.startDate || '',
      endDate: e.endDate || undefined,
      current: e.current ?? false,
    })),
    skills: (data.skills || []).filter((s) => s.name?.trim()).map((s) => ({ name: s.name, level: s.level || 'Intermediate' })),
    languages: (data.languages || []).filter((l) => l.name?.trim()).map((l) => ({ name: l.name, level: l.level || 'Fluent' })),
    hobbies: (data.hobbies || []).filter(Boolean),
    certifications: (data.certifications || []).filter((c) => c.name?.trim() || c.organization?.trim()).map((c) => ({
      name: c.name || '',
      organization: c.organization || '',
      startDate: c.startDate || undefined,
      endDate: c.endDate || undefined,
      certificateLink: c.certificateLink || undefined,
    })),
    custom_section: (data.custom_section || []).filter((s) => s.title?.trim() || (s.items && s.items.some((i) => i.name?.trim()))).map((s) => ({
      title: s.title || '',
      items: (s.items || []).map((i) => ({ name: i.name || '', description: i.description || undefined })),
    })),
  };
}

/** Normalize API response (format_structured_response) to ResumeData for forms */
export function apiResumeToFormData(api: Record<string, unknown>): ResumeData {
  const profile = api.profile as Record<string, unknown> | undefined;
  const personalInfo = (profile?.personalInfo || api.personalInfo) as PersonalInfo | undefined;
  const work = api.work_history as { experience?: ExperienceItem[] } | undefined;
  const experience = work?.experience ?? (api.experience as ExperienceItem[] | undefined) ?? [];
  const edu = api.education as { education?: EducationItem[] } | undefined;
  const education = edu?.education ?? (Array.isArray(api.education) ? api.education : []) as EducationItem[];
  const sk = api.skills as { skills?: SkillItem[] } | undefined;
  const skills = sk?.skills ?? (api.skills as SkillItem[] | undefined) ?? [];
  const lang = api.languages as { languages?: LanguageItem[] } | undefined;
  const languages = lang?.languages ?? (api.languages as LanguageItem[] | undefined) ?? [];
  const sum = api.summary as { summary?: string } | undefined;
  const summary = typeof sum?.summary === 'string' ? sum.summary : (api.summary as string) ?? '';
  const hob = api.hobbies as { hobbies?: string[] } | undefined;
  const hobbies = hob?.hobbies ?? (api.hobbies as string[] | undefined) ?? [];
  const cert = api.certifications as { certifications?: CertificationItem[] } | undefined;
  const certifications = cert?.certifications ?? (api.certifications as CertificationItem[] | undefined) ?? [];
  const custom = api.custom_section as { custom_section?: CustomSection[] } | undefined;
  const custom_section = custom?.custom_section ?? (Array.isArray(api.custom_section) ? api.custom_section : []) as CustomSection[];

  return {
    id: api.id as number | undefined,
    resume_title: (api.resume_title as string) ?? defaultResumeData.resume_title,
    resume_type: api.resume_type as string | undefined,
    template_category: (api.template_category as string) ?? 'classic',
    profile_image: api.profile_image as string | null | undefined,
    personalInfo: personalInfo ? { ...defaultPersonalInfo, ...personalInfo } : { ...defaultPersonalInfo },
    profession: (profile?.profession as string) ?? (api.profession as string) ?? '',
    summary,
    experience: experience.length ? experience : defaultResumeData.experience,
    education: education.length ? education : defaultResumeData.education,
    skills: skills.length ? skills : defaultResumeData.skills,
    languages: languages.length ? languages : defaultResumeData.languages,
    hobbies,
    certifications: certifications.length ? certifications : defaultResumeData.certifications,
    custom_section: custom_section.length ? custom_section : defaultResumeData.custom_section,
  };
}
