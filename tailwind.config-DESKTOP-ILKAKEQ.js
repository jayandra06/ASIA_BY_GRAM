/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff', // Pure white
        surface: '#f8f8f8',    // Very light grey for contrast
        primary: '#FFC107',    // Gold Yellow (Main brand color now)
        secondary: '#000000',  // Pure Black for text
        gold: {
          400: '#FFC107',
          500: '#FFB300',
          600: '#FFA000',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b', // Keep dark for some contrast elements if needed
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        asian: ['Cinzel', 'serif'], // Mapping Cinzel to 'asian' class for easy switch
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #E53935 0deg, #D4AF37 180deg, #E53935 360deg)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
          '50%': { boxShadow: '0 0 20px 0 rgba(212, 175, 55, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
