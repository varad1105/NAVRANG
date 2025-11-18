/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        festive: {
          orange: '#ff6b35',
          yellow: '#f7931e',
          red: '#c41e3a',
          green: '#228b22',
          purple: '#6b46c1',
          gold: '#ffd700',
        }
      },
      fontFamily: {
        'festive': ['Georgia', 'serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #ff6b35, 0 0 10px #ff6b35' },
          '100%': { boxShadow: '0 0 20px #ff6b35, 0 0 30px #ff6b35' },
        }
      }
    },
  },
  plugins: [],
}
