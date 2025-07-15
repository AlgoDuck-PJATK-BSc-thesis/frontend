import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';

export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#fdfaf6', 
        text: '#222222', 
        primary: '##ed9aaa', 
        accent1: '#b5ead7', 
        accent2: '#ff9d00', 
        tile: '#fffdf7', 
        
        dark: {
          bg: '#1e1e2e',
          text: '#f5f5f5',
          primary: '#caa9fa',
          accent1: '#8be9fd',
          accent2: '#fab387',
          tile: '#2e2e42',
        },
      },
    },
  },
  plugins: [
    scrollbar,
  ],
} satisfies Config;