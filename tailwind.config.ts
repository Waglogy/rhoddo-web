import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E1512',
        panel: '#141B18',
        line: '#1F2724',
        ink: '#F6F1E6',
        mute: '#8D9893',
        primary: '#D1364B',
        gold: '#E8B84A',
        pine: '#2E6E5B',
        mist: '#5B7FB9',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04), 0 30px 80px -40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
