/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1020', // page background
        surface: '#111827', // cards
        brand: { DEFAULT: '#8B5CF6', hover: '#7C3AED' }, // electric violet
        accent: '#22D3EE', // cyan
        muted: '#94A3B8', // secondary text
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(139,92,246,0.4), 0 8px 30px -8px rgba(139,92,246,0.35)',
      },
    },
  },
  plugins: [],
};
