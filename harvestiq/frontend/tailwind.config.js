/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe5cb',
          300: '#8dd1a7',
          400: '#5bb67d',
          500: '#369b5c',
          600: '#277d47',
          700: '#20643a',
          800: '#1d5030',
          900: '#194228',
        },
        accent: {
          50: '#fef7ed',
          100: '#fdecd4',
          200: '#fad5a8',
          300: '#f6b871',
          400: '#f19338',
          500: '#ed7611',
          600: '#de5d07',
          700: '#b84608',
          800: '#93370e',
          900: '#762f0f',
        }
      }
    },
  },
  plugins: [],
}