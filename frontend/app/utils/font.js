/**
 * Font helper for cover letter templates (compatible with old_frontend utils/font).
 */
const fontClassMap = {
  roboto: 'var(--font-roboto)',
  'open-sans': 'var(--font-open-sans)',
  inter: 'var(--font-inter)',
};

export function getFontClass(font) {
  if (!font || typeof font !== 'string') return 'Georgia, serif';
  const key = font.toLowerCase().trim();
  return fontClassMap[key] || font;
}
