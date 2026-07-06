/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pool: {
          dark: '#0a0e17',
          felt: '#126252',
          cyan: '#00f0ff',
          purple: '#bd00ff',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
