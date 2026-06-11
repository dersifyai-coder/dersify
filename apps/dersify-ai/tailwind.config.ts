import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        blue: { DEFAULT: '#1B4FDB' },
        teal: { DEFAULT: '#0D9488' },
        amber: { DEFAULT: '#F59E0B' },
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
