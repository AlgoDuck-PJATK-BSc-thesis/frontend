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
        admin: {
          bg: {
            primary: 'rgb(var(--color-admin-bg-primary) / <alpha-value>)',
            secondary: 'rgb(var(--color-admin-bg-secondary) / <alpha-value>)',
            tertiary: 'rgb(var(--color-admin-bg-tertiary) / <alpha-value>)',
            hover: 'rgb(var(--color-admin-bg-hover) / <alpha-value>)',
            input: 'rgb(var(--color-admin-bg-input) / <alpha-value>)',
          },
          border: {
            primary: 'rgb(var(--color-admin-border-primary) / <alpha-value>)',
          },
          text: {
            primary: 'rgb(var(--color-admin-text-primary) / <alpha-value>)',
            secondary: 'rgb(var(--color-admin-text-secondary) / <alpha-value>)',
            muted: 'rgb(var(--color-admin-text-muted) / <alpha-value>)',
          },
          accent: {
            primary: 'rgb(var(--color-admin-accent-primary) / <alpha-value>)',
            'primary-hover': 'rgb(var(--color-admin-accent-primary-hover) / <alpha-value>)',
            link: 'rgb(var(--color-admin-accent-link) / <alpha-value>)',
            selection: 'rgb(var(--color-admin-accent-selection) / <alpha-value>)',
          },
          danger: {
            bg: 'rgb(var(--color-admin-danger-bg) / <alpha-value>)',
            'bg-hover': 'rgb(var(--color-admin-danger-bg-hover) / <alpha-value>)',
            text: 'rgb(var(--color-admin-danger-text) / <alpha-value>)',
          },
        },
      }
    }
  }
} satisfies Config