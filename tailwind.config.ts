import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ReadRoom editorial system
        paper: '#FBFAF7', // primary background
        sand: '#F5F1EA', // secondary warm background
        parchment: '#EEE7DC',
        ivory: '#FFFFFF',
        ink: {
          DEFAULT: '#111111',
          soft: '#65625E',
          muted: '#8C8882',
        },
        peach: '#F4C8AE',
        blush: '#F0D8D8',
        clay: '#C8957E',
        navy: '#08111C',
        pitch: '#080808',
        sky: '#C9DDF2',
        cobalt: '#3157A4',
        haze: '#D8D1E8', // secondary atmospheric lavender only
        rule: 'rgba(17,17,17,0.09)',
        // semantic (used by a few primitives)
        border: 'rgba(17,17,17,0.09)',
        background: '#FBFAF7',
        foreground: '#111111',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Newsreader', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // editorial display scale
        'display-lg': ['clamp(3rem, 7vw, 6.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        'display': ['clamp(2.6rem, 5.2vw, 4.6rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'statement': ['clamp(2rem, 4vw, 3.4rem)', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
      },
      maxWidth: {
        shell: '1560px',
        content: '1200px',
        readable: '640px',
      },
      spacing: {
        section: '9rem',
        'section-lg': '13rem',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        lg: '12px',
        frame: '24px',
        canvas: '32px',
      },
      boxShadow: {
        object: '0 30px 90px rgba(18,20,25,0.10)',
        'object-sm': '0 18px 50px rgba(18,20,25,0.08)',
        raise: '0 1px 0 rgba(17,17,17,0.04), 0 12px 40px rgba(18,20,25,0.06)',
        edge: '0 0 0 1px rgba(17,17,17,0.07)',
      },
      keyframes: {
        'rise': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-30%)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(260%)', opacity: '0' },
        },
        'light-drift': {
          '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: '0.9' },
          '50%': { transform: 'translate(-2%,2%) scale(1.06)', opacity: '1' },
        },
        'draw': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.2,0.7,0.2,1) both',
        reveal: 'reveal 0.8s cubic-bezier(0.2,0.7,0.2,1) both',
        scan: 'scan 2.2s ease-in-out infinite',
        'light-drift': 'light-drift 22s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
