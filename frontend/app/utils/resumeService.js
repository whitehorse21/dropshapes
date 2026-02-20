import { BehaviorSubject } from 'rxjs';

// Observables for state
export const $resume = new BehaviorSubject({});
export const $resumeStyle = new BehaviorSubject({});
export const $resumeSaveStatus = new BehaviorSubject('saved');

// Keys for local storage
const RESUME_KEY = 'resumeData';
const RESUME_STYLE_KEY = 'resumeStyle';
const RESUME_TEMPLATE_KEY = 'resumeTemplateType';

// Get resume data from localStorage
export const getResumeFromLocalDB = () => {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(RESUME_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error reading resume data:', err);
    return {};
  }
};

// Save resume data
export const saveResumeData = (data) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(data));
    $resume.next(data);
    $resumeSaveStatus.next('saved');
  } catch (err) {
    console.error('Error saving resume data:', err);
    $resumeSaveStatus.next('error');
  }
};

// Update resume data
export const updateResumeData = (newData) => {
  if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
    console.warn('Invalid data passed to updateResumeData:', newData);
    return $resume.getValue();
  }

  const current = $resume.getValue();
  const updated = { ...current, ...newData };

  saveResumeData(updated);
  return updated;
};

export const updateResume = updateResumeData;

// Select template type
export const selectResumeTemplate = (templateType) => {
  if (typeof window === 'undefined') return;

  try {
    const templateData = {
      resumeTemplateType: templateType,
      selectedAt: new Date().toISOString(),
    };
    localStorage.setItem(RESUME_TEMPLATE_KEY, JSON.stringify(templateData));
  } catch (err) {
    console.error('Error saving resume template type:', err);
  }
};

// Update resume style
export const updateResumeStyle = (styleData) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RESUME_STYLE_KEY, JSON.stringify(styleData));
    $resumeStyle.next(styleData);

    const styleElement = document.getElementById('resume-dynamic-style');
    const css = generateResumeCSS(styleData);

    if (styleElement) {
      styleElement.textContent = css;
    } else {
      const newStyle = document.createElement('style');
      newStyle.id = 'resume-dynamic-style';
      newStyle.textContent = css;
      document.head.appendChild(newStyle);
    }
  } catch (err) {
    console.error('Error updating resume style:', err);
  }
};

// Convert style object to CSS string
const generateResumeCSS = (styleData) => {
  const {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    color,
    backgroundColor,
  } = styleData;

  return `
    .resume-template {
      ${fontFamily ? `font-family: ${fontFamily};` : ''}
      ${fontSize ? `font-size: ${fontSize}px;` : ''}
      ${fontWeight ? `font-weight: ${fontWeight};` : ''}
      ${lineHeight ? `line-height: ${lineHeight};` : ''}
      ${color ? `color: ${color};` : ''}
      ${backgroundColor ? `background-color: ${backgroundColor};` : ''}
    }

    .resume-template * {
      ${fontFamily ? `font-family: inherit;` : ''}
    }
  `;
};

// Get resume template info
export const getResumeTemplateData = () => {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(RESUME_TEMPLATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error reading resume template type:', err);
    return null;
  }
};

// Get style data
export const getResumeStyle = () => {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(RESUME_STYLE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error reading resume style:', err);
    return {};
  }
};

// Clear everything
export const clearResumeData = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RESUME_KEY);
    localStorage.removeItem(RESUME_STYLE_KEY);
    localStorage.removeItem(RESUME_TEMPLATE_KEY);

    $resume.next({});
    $resumeStyle.next({});
    $resumeSaveStatus.next('saved');
  } catch (err) {
    console.error('Error clearing resume data:', err);
  }
};

// Initialize observables on load
if (typeof window !== 'undefined') {
  const resume = getResumeFromLocalDB();
  if (Object.keys(resume).length > 0) $resume.next(resume);

  const style = getResumeStyle();
  if (Object.keys(style).length > 0) {
    $resumeStyle.next(style);
    updateResumeStyle(style);
  }
}
