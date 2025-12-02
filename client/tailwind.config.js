/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7B2CBF',
        secondary: '#FF9800',
        surface: '#FFFFFF',
        background: '#FFF9E6',
      },
    },
  },
  plugins: [],
};
