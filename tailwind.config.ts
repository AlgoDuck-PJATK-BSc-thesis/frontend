import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ide: {
          bg: 'rgb(var(--color-ide-bg) / <alpha-value>)',
          card: 'rgb(var(--color-ide-card) / <alpha-value>)',
          accent: 'rgb(var(--color-ide-accent) / <alpha-value>)',
          dcard: 'rgb(var(--color-ide-dcard) / <alpha-value>)',
          button: 'rgb(var(--color-ide-button) / <alpha-value>)',
          text: {
            primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
            secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          }
        },
      }
    }
  }
} satisfies Config