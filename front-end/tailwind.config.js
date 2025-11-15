/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for dark mode
        background: {
          DEFAULT: '#ffffff',
          dark: '#111827',
        },
        foreground: {
          DEFAULT: '#111827',
          dark: '#f9fafb',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          dark: '#1f2937',
          foreground: {
            DEFAULT: '#6b7280',
            dark: '#9ca3af',
          }
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#60a5fa',
        },
      },
      fontFamily: {
        gabarito: ['Gabarito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}