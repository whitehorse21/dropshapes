/**
 * Map font name from cover_style to CSS font-family.
 */
const fontFamilyMap: Record<string, string> = {
  roboto: 'var(--font-roboto), "Roboto", sans-serif',
  'open-sans': 'var(--font-open-sans), "Open Sans", sans-serif',
  inter: 'var(--font-inter), "Inter", sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  georgia: 'Georgia, serif',
  'times new roman': '"Times New Roman", Times, serif',
};

export function getCoverLetterFontFamily(font: string | undefined): string {
  if (!font || typeof font !== 'string') return 'Georgia, serif';
  const key = font.toLowerCase().trim();
  return fontFamilyMap[key] || font;
}
