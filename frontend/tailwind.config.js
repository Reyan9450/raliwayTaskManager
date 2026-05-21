/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4f0',
          300: '#a0a0d0',
          400: '#7070b0',
          500: '#505090',
          600: '#303070',
          700: '#1a1a4e',
          800: '#0f0f2e',
          900: '#080818',
          950: '#04040e',
        },
        brand: {
          purple: '#7c3aed',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          blue:   '#3b82f6',
          cyan:   '#06b6d4',
          pink:   '#ec4899',
          rose:   '#f43f5e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'purple-glow':     'radial-gradient(ellipse at center, rgba(124,58,237,0.3) 0%, transparent 70%)',
        'blue-glow':       'radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%)',
        'hero-gradient':   'linear-gradient(135deg, #0f0f2e 0%, #1a0a3e 50%, #0a1628 100%)',
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.2)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.2)',
        'glow-pink':   '0 0 20px rgba(236,72,153,0.5), 0 0 40px rgba(236,72,153,0.2)',
        'card':        '0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.3s ease-out',
        'fade-in':      'fadeIn 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
