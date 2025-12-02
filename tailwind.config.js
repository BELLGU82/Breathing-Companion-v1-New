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
    // Glass utilities
    'backdrop-blur-glass',
    'backdrop-blur-glass-lg',
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
          border: 'var(--neu-border)',
          'border-light': 'var(--neu-border-light)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',

        // Glass color utilities
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
        },

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
        // Glass-specific
        glass: '20px',
        'glass-lg': '24px',
      },

      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },

      // ========== GLASSMORPHISM SHADOWS ==========
      boxShadow: {
        // Glass shadows (מחליפים את ה-neumorphic)
        'neu-flat': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'neu-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',

        // Glass-specific
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',

        // Combined glass effect
        'glass-card': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },

      // ========== BACKDROP BLUR ==========
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
        'glass-xl': '40px',
      },

      // Background images - לא נחוץ יותר לצבעים
      backgroundImage: {
        'neu-convex': 'linear-gradient(145deg, var(--neu-light), var(--neu-dark))',
        'neu-concave': 'linear-gradient(145deg, var(--neu-dark), var(--neu-light))',
        // Glass gradient overlay
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      // ========== ANIMATIONS ==========
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        // Glass shimmer effect
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Subtle float for glass cards
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      animation: {
        breathe: 'breathe 4s infinite ease-in-out',
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 3s infinite ease-in-out',
      },

      // ========== BORDER WIDTH ==========
      borderWidth: {
        'glass': '1px',
      },

      // ========== OPACITY ==========
      opacity: {
        '15': '0.15',
        '85': '0.85',
      },
    },
  },

  plugins: [animate],
};
