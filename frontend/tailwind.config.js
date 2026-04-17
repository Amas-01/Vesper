/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode Vesper Purple - Primary Brand Color
        vesper: {
          50: '#f5f3ff',
          100: '#ebe5ff',
          200: '#d8c7ff',
          300: '#c4a3ff',
          400: '#a366ff',
          500: '#8b4dd1', // Primary - darker purple for dark UI
          600: '#6b3a9f',
          700: '#552d7a',
          800: '#3d1f57',
          900: '#2a1340',
        },
        // Dark Mode - Neutral Background Colors
        'slate-dark': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      backgroundColor: {
        'dark-bg': '#0f0f1f',
        'dark-surface': '#1a1a2e',
        'dark-surface-alt': '#16213e',
        'dark-card': '#252540',
      },
      textColor: {
        'dark-text': '#e4e6eb',
        'dark-text-secondary': '#8892a1',
      },
      borderColor: {
        'dark-border': '#2d2d44',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
