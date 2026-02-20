import { BehaviorSubject } from 'rxjs';

// Observables for state
export const $coverLetter = new BehaviorSubject({});
export const $coverLetterStyle = new BehaviorSubject({});
export const $coverLetterSaveStatus = new BehaviorSubject('saved');

// Keys for local storage
const COVER_LETTER_KEY = 'coverLetterData';
const COVER_LETTER_STYLE_KEY = 'coverLetterStyle';
const COVER_LETTER_TEMPLATE_KEY = 'coverLetterTemplateType';

// Get cover letter data from localStorage
export const getCoverLetterFromLocalDB = () => {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(COVER_LETTER_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error reading cover letter data:', err);
    return {};
  }
};

// Save cover letter data
export const saveCoverLetterData = (data) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COVER_LETTER_KEY, JSON.stringify(data));
    $coverLetter.next(data);
    $coverLetterSaveStatus.next('saved');
  } catch (err) {
    console.error('Error saving cover letter data:', err);
    $coverLetterSaveStatus.next('error');
  }
};

// Update cover letter data
export const updateCoverLetterData = (newData) => {
  console.log("new data ", newData);
  
  if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
    console.warn('Invalid data passed to updateCoverLetterData:', newData);
    return $coverLetter.getValue();
  }
  

  const current = $coverLetter.getValue();
  const updated = { ...current, ...newData };

  saveCoverLetterData(updated);
  return updated;
};

// Clear cover letter data
export const clearCoverLetterData = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(COVER_LETTER_KEY);
    localStorage.removeItem(COVER_LETTER_STYLE_KEY);
    localStorage.removeItem(COVER_LETTER_TEMPLATE_KEY);
    $coverLetter.next({});
    $coverLetterStyle.next({});
    $coverLetterSaveStatus.next('saved');
  } catch (err) {
    console.error('Error clearing cover letter data:', err);
  }
};

// Get cover letter style
export const getCoverLetterStyleFromLocalDB = () => {
  if (typeof window === 'undefined') return {};

  try {
    const style = localStorage.getItem(COVER_LETTER_STYLE_KEY);
    return style ? JSON.parse(style) : {};
  } catch (err) {
    console.error('Error reading cover letter style:', err);
    return {};
  }
};

// Save cover letter style
export const saveCoverLetterStyle = (style) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COVER_LETTER_STYLE_KEY, JSON.stringify(style));
    $coverLetterStyle.next(style);
  } catch (err) {
    console.error('Error saving cover letter style:', err);
  }
};

// Update cover letter style
export const updateCoverLetterStyle = (newStyle) => {
  const current = $coverLetterStyle.getValue();
  const updated = { ...current, ...newStyle };
  saveCoverLetterStyle(updated);
  return updated;
};

// Get template type
export const getCoverLetterTemplateFromLocalDB = () => {
  if (typeof window === 'undefined') return '';

  try {
    return localStorage.getItem(COVER_LETTER_TEMPLATE_KEY) || '';
  } catch (err) {
    console.error('Error reading cover letter template:', err);
    return '';
  }
};

// Save template type
export const saveCoverLetterTemplate = (template) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COVER_LETTER_TEMPLATE_KEY, template);
  } catch (err) {
    console.error('Error saving cover letter template:', err);
  }
};

// Initialize cover letter data on app load
export const initializeCoverLetterData = () => {
  const storedData = getCoverLetterFromLocalDB();
  const storedStyle = getCoverLetterStyleFromLocalDB();
  
  if (Object.keys(storedData).length > 0) {
    $coverLetter.next(storedData);
  }
  
  if (Object.keys(storedStyle).length > 0) {
    $coverLetterStyle.next(storedStyle);
  }
};
