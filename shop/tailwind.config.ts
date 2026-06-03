import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        satin: {
          50:  '#fdf8ff',
          100: '#f7eeff',
          200: '#eedeff',
          300: '#dfc1ff',
          400: '#c994fd',
          500: '#b068f9',
          600: '#9b44ef',
          700: '#8530d3',
          800: '#6f28ab',
          900: '#5c2389',
          950: '#3d0f62',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b8962d',
        },
        cream: '#fdf9f0',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',     'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'satin-gradient':    'linear-gradient(135deg, #4a0080 0%, #7b2fbe 30%, #9333ea 60%, #6b21a8 100%)',
        'satin-light':       'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #f3e8ff 100%)',
        'gold-shimmer':      'linear-gradient(90deg, #b8962d 0%, #d4af37 40%, #fbbf24 60%, #d4af37 80%, #b8962d 100%)',
        'hero-gradient':     'linear-gradient(160deg, #1a0030 0%, #3b0764 40%, #581c87 70%, #4a0080 100%)',
        'card-shimmer':      'linear-gradient(135deg, rgba(147,51,234,0.08) 0%, rgba(107,33,168,0.04) 100%)',
      },
      boxShadow: {
        'luxury':    '0 4px 24px rgba(74,0,128,0.18), 0 1px 6px rgba(74,0,128,0.10)',
        'luxury-lg': '0 10px 48px rgba(74,0,128,0.24), 0 4px 16px rgba(74,0,128,0.14)',
        'gold':      '0 0 0 2px rgba(212,175,55,0.5)',
        'inner-luxury': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'shimmer':     'shimmer 2.5s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
