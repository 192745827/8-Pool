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
          dark: '#1e1f22',
          felt: '#126252',
          cyan: '#94a3b8',
          purple: '#bd00ff',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif']
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'translateX(-100%) skewX(12deg)' },
          '100%': { transform: 'translateX(200%) skewX(12deg)' },
        }
      },
      animation: {
        sweep: 'sweep 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
