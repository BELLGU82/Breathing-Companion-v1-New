/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './views/**/*.{ts,tsx,js,jsx}',
    './services/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx,js,jsx}',
    './constants.ts',
    './types.ts',
  ],
  safelist: [
    'bg-amber-500',
    'bg-blue-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-neu-text',
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: 'var(--neu-base)',
          light: 'var(--neu-light)',
          dark: 'var(--neu-dark)',
          text: 'var(--neu-text)',
          'text-secondary': 'var(--neu-text-secondary)',
          accent: 'var(--neu-accent)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontSize: {
        h1: 'var(--text-h1)',
        h2: 'var(--text-h2)',
        body: 'var(--text-body)',
        meta: 'var(--text-meta)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },
      boxShadow: {
        'neu-flat':
          '9px 9px 16px var(--neu-shadow-dark), -9px -9px 16px var(--neu-shadow-light)',
        'neu-pressed':
          'inset 6px 6px 10px var(--neu-shadow-dark), inset -6px -6px 10px var(--neu-shadow-light)',
        'neu-convex': 'linear-gradient(145deg, var(--neu-light), var(--neu-dark))',
        'neu-concave': 'linear-gradient(145deg, var(--neu-dark), var(--neu-light))',
      },
      backgroundImage: {
        'neu-convex': 'linear-gradient(145deg, var(--neu-light), var(--neu-dark))',
        'neu-concave': 'linear-gradient(145deg, var(--neu-dark), var(--neu-light))',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        breathe: 'breathe 4s infinite ease-in-out',
      },
    },
  },
  plugins: [animate],
};
