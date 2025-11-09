/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        borderColor: {
          'border': 'hsl(var(--border))',
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          gabarito: ["Gabarito", "sans-serif"],
        }
      },
    },
    plugins: [],
  }