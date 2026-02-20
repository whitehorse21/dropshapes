const fontClassMap = {
  roboto: "var(--font-roboto)",
  "open-sans": "var(--font-open-sans)",
  inter: "var(--font-inter)",
};

export function getFontClass(font) {
  return fontClassMap[font] || "sans-serif";
}