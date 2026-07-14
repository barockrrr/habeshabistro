import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Roasted-coffee dark theme — grounded in the jebena coffee ceremony
        // and berbere/turmeric spice colors, not a generic light template.
        ink: {
          DEFAULT: '#1F1712', // roasted coffee bean — page background
          raised: '#2A2018', // card surface
          high: '#362A1F' // modal / most-raised surface
        },
        cream: {
          DEFAULT: '#F0DFC0', // teff flour — primary text on dark
          dim: '#C9B79A' // secondary text
        },
        berbere: {
          DEFAULT: '#A8371F',
          light: '#C94A2E',
          dark: '#7A2716'
        },
        gold: {
          DEFAULT: '#E8A93B',
          light: '#F2C46B',
          dim: '#B88430'
        },
        tilet: {
          green: '#3B6B45',
          gold: '#E8A93B',
          berbere: '#A8371F'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        amharic: ['var(--font-amharic)', 'sans-serif']
      },
      keyframes: {
        'steam-rise': {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '0' },
          '15%': { opacity: '0.55' },
          '100%': { transform: 'translateY(-46px) scaleX(1.6)', opacity: '0' }
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'steam-1': 'steam-rise 3.2s ease-in infinite',
        'steam-2': 'steam-rise 3.2s ease-in infinite 1.1s',
        'steam-3': 'steam-rise 3.2s ease-in infinite 2.2s',
        pop: 'pop 0.35s ease-out',
        'fade-up': 'fade-up 0.5s ease-out both'
      }
    }
  },
  plugins: []
};

export default config;
