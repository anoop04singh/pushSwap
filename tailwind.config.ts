import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
        playfair: ['var(--font-playfair)', ...fontFamily.serif],
      },
      colors: {
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
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: 'calc(var(--radius) - 6px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ addBase, addComponents, addUtilities, theme }) {
      addBase({
        ':root': {
          '--background': 'oklch(0.9721 0.0158 110.5501)',
          '--foreground': 'oklch(0.63 0.24 335)',
          '--card': 'oklch(0.9721 0.0158 110.5501)',
          '--card-foreground': 'oklch(0.63 0.24 335)',
          '--popover': 'oklch(0.9721 0.0158 110.5501)',
          '--popover-foreground': 'oklch(0.63 0.24 335)',
          '--primary': 'oklch(0.7 0.27 335)',
          '--primary-foreground': 'oklch(1 0 0)',
          '--secondary': 'oklch(1 0 0)',
          '--secondary-foreground': 'oklch(0.7 0.27 335)',
          '--muted': 'oklch(0.9189 0.0147 106.6853)',
          '--muted-foreground': 'oklch(0.63 0.24 335)',
          '--accent': 'oklch(0.9 0.2 335)',
          '--accent-foreground': 'oklch(0.63 0.24 335)',
          '--destructive': 'oklch(0.63 0.19 23.03)',
          '--destructive-foreground': 'oklch(1 0 0)',
          '--border': 'oklch(0.7 0.27 335)',
          '--input': 'oklch(0.7 0.27 335)',
          '--ring': 'oklch(0.7 0.27 335)',
          '--chart-1': 'oklch(0.7 0.27 335)',
          '--chart-2': 'oklch(0.6 0.23 335)',
          '--chart-3': 'oklch(0.8 0.2 335)',
          '--chart-4': 'oklch(0.9 0.18 335)',
          '--chart-5': 'oklch(0.5 0.25 335)',
          '--sidebar': 'oklch(0.9721 0.0158 110.5501)',
          '--sidebar-foreground': 'oklch(0.63 0.24 335)',
          '--sidebar-primary': 'oklch(0.7 0.27 335)',
          '--sidebar-primary-foreground': 'oklch(1 0 0)',
          '--sidebar-accent': 'oklch(0.9 0.2 335)',
          '--sidebar-accent-foreground': 'oklch(0.63 0.24 335)',
          '--sidebar-border': 'oklch(0.63 0.24 335)',
          '--sidebar-ring': 'oklch(0.7 0.27 335)',
          '--radius': '0rem',
          '--shadow-2xs': '4px 4px 0px 0px hsl(325 100% 70% / 0.07)',
          '--shadow-xs': '4px 4px 0px 0px hsl(325 100% 70% / 0.07)',
          '--shadow-sm':
            '4px 4px 0px 0px hsl(325 100% 70% / 0.15), 4px 1px 2px -1px hsl(325 100% 70% / 0.15)',
          '--shadow':
            '4px 4px 0px 0px hsl(325 100% 70% / 0.15), 4px 1px 2px -1px hsl(325 100% 70% / 0.15)',
          '--shadow-md':
            '4px 4px 0px 0px hsl(325 100% 70% / 0.15), 4px 2px 4px -1px hsl(325 100% 70% / 0.15)',
          '--shadow-lg':
            '4px 4px 0px 0px hsl(325 100% 70% / 0.15), 4px 4px 6px -1px hsl(325 100% 70% / 0.15)',
          '--shadow-xl':
            '4px 4px 0px 0px hsl(325 100% 70% / 0.15), 4px 8px 10px -1px hsl(325 100% 70% / 0.15)',
          '--shadow-2xl': '4px 4px 0px 0px hsl(325 100% 70% / 0.38)',
        },
        '.dark': {},
      })
    }),
  ],
} satisfies Config

export default config