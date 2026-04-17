/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vesper: {
          50: '#f8f7ff',
          100: '#f0ecff',
          200: '#e2d9ff',
          300: '#c9b3ff',
          400: '#a878ff',
          500: '#8b4eff',
          600: '#7b2cbf',
          700: '#6b21a8',
          800: '#581c87',
          900: '#3d0f6b',
        },
      },
    },
  },
  plugins: [],
}
