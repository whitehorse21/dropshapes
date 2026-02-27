/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Cover letter templates (ensure Tailwind scans these for class names)
    './app/cover-letters/templates/**/*.{js,jsx,ts,tsx}',
    './app/cover-letters/templates/Modern/**/*.{js,jsx}',
    './app/cover-letters/templates/Classic/**/*.{js,jsx}',
  ],
  // Ensure Tailwind doesn't purge PrimeReact and Material UI classes
  safelist: [
    { pattern: /^p-/ },
    { pattern: /^pi-/ },
    { pattern: /^MuiBox/ },
    { pattern: /^MuiButton/ },
    { pattern: /^MuiGrid/ },
    { pattern: /^MuiCard/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        quantum: {
          purple: '#7877ff',
          pink: '#ff77c6',
          bg: '#0a0a0f',
          text: '#ffffff',
        },
      },
      boxShadow: {
        neumorphic: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
        'neumorphic-dark': '10px 10px 20px #1a1a1a, -10px -10px 20px #2c2c2c',
        quantum: '0 0 20px rgba(120, 119, 255, 0.3)',
        'quantum-hover': '0 15px 40px rgba(120, 119, 255, 0.4)',
      },
      backgroundImage: {
        'gradient-text': 'linear-gradient(90deg, #3b82f6, #2563eb)',
        'quantum-gradient': 'linear-gradient(135deg, #7877ff, #ff77c6)',
      },
      animation: {
        'quantum-float': 'quantumFloat 20s ease-in-out infinite',
        'particle-float': 'particleFloat 15s linear infinite',
        'text-shimmer': 'textShimmer 3s ease-in-out infinite',
        bounce: 'bounce 2s infinite',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'hologram-pulse': 'hologramPulse 8s infinite',
      },
      keyframes: {
        quantumFloat: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(5deg) scale(1.05)' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: 0 },
        },
        textShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(50px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        hologramPulse: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      });
    },
  ],
  darkMode: 'class',
  prefix: '',
  corePlugins: {
    preflight: true,
  },
};
