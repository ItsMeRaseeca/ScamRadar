import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002395',
          dark: '#001a75',
          light: '#e6e9f4',
        },
        risk: {
          red: '#D32F2F',
          yellow: '#FBC02D',
          green: '#388E3C',
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #111827',
        'brutal-sm': '2px 2px 0px 0px #111827',
        'brutal-md': '6px 6px 0px 0px #111827',
        'brutal-lg': '8px 8px 0px 0px #111827',
        'brutal-primary': '4px 4px 0px 0px #002395',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'subtle-pop': 'subtlePop 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        subtlePop: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;








