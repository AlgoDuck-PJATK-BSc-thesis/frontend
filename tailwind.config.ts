import type { Config } from 'tailwindcss'

export default {
  
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ide: {
          bg: '#181818',
          bg_hovered: '#232323',
          card: '#1e1e1e',
          accent: '#FF13F0',
          dcard: '#262626'
        },
        text: {
          primary: '#9290C3', 
          secondary: '#d2d1fc', 
        }
      }
    }
  }
} satisfies Config