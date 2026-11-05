// Tailwind CSS v3 uniquement. En v4, tout est dans globals.css (@theme inline) : ce fichier est inutile.
// En v3, utiliser des variables CSS en hex dans :root/.dark (comme globals.css) et ce mapping.
import type { Config } from 'tailwindcss';

const v = (name: string) => `var(--${name})`;

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1200px' } },
    extend: {
      fontFamily: {
        sans: ['var(--font-instrument)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: v('background'), foreground: v('foreground'),
        card: { DEFAULT: v('card'), foreground: v('card-foreground') },
        popover: { DEFAULT: v('popover'), foreground: v('popover-foreground') },
        primary: { DEFAULT: v('primary'), foreground: v('primary-foreground') },
        secondary: { DEFAULT: v('secondary'), foreground: v('secondary-foreground') },
        muted: { DEFAULT: v('muted'), foreground: v('muted-foreground') },
        accent: { DEFAULT: v('accent'), foreground: v('accent-foreground') },
        brand: { DEFAULT: v('brand'), foreground: v('brand-foreground'), text: v('brand-text') },
        destructive: { DEFAULT: v('destructive'), foreground: v('destructive-foreground') },
        success: { DEFAULT: v('success'), subtle: v('success-subtle') },
        warning: { DEFAULT: v('warning'), subtle: v('warning-subtle') },
        info: { DEFAULT: v('info'), subtle: v('info-subtle') },
        'danger-subtle': v('danger-subtle'),
        border: v('border'), input: v('input'), ring: v('ring'),
        chart: { 1: v('chart-1'), 2: v('chart-2'), 3: v('chart-3'), 4: v('chart-4'), 5: v('chart-5') },
      },
      borderRadius: { sm: 'calc(var(--radius) - 2px)', md: 'var(--radius)', lg: 'calc(var(--radius) + 2px)', xl: 'calc(var(--radius) + 6px)' },
      fontSize: { display: ['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }] },
      transitionTimingFunction: { out: 'cubic-bezier(.2,.7,.2,1)' },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
