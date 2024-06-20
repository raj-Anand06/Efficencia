/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  fontFamily: {
    'abc': ["Freeman", "sans-serif"],
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["lemonade","coffee","dark","lofi" ],
  },
  colors: {
    customGradient1: '#ff6596',
    customGradient2: '#60bef8',
    customGradient3: '#d88cff',
    custom1: '#1D232A',
  },

}