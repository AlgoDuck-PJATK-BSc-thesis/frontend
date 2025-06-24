# Beetcode – UI System Overview

## Font

**Primary font:**  
`'Press Start 2P', monospace` (imported via Google Fonts)

**Usage:**  
Defined globally in `app.css` as:

```css
--font-body: 'Press Start 2P', monospace;
```

Applied in:

```css
html {
	font-family: var(--font-body);
}
```

Used in all headings, paragraphs, inputs, and buttons.

---

## Typography Scale

| Element       | Font Size |
|---------------|-----------|
| `h1`          | 1.5rem (24px) |
| `h2`          | 1rem (16px) |
| `p`, `input`  | 0.85rem (13.6px) |
| `.switch`, `a`| 0.68rem (11px) |

All font sizes are defined via CSS inside `.svelte` components.

---

## Color Theme

Defined via CSS variables in `app.css`.

### Light Theme (`:root`)

```css
--color-bg:        #fdfaf6;
--color-text:      #222222;
--color-primary:   #ffb3c1;
--color-accent-1:  #b5ead7;
--color-accent-2:  #ffdac1;
```

### Dark Theme (`[data-theme="dark"]`)

```css
--color-bg:        #1e1e2e;
--color-text:      #f5f5f5;
--color-primary:   #caa9fa;
--color-accent-1:  #8be9fd;
--color-accent-2:  #fab387;
```

---

## Tailwind Usage

Tailwind is installed and active in the project, but only used for build and utility purposes. No `@apply` or `text-*`, `bg-*` utility classes are used directly.

The design system relies fully on custom CSS variables and scoped styles inside `.svelte` components.

---

## Pages Implemented

### `/` – Landing Page

- Heading: "Improve your skills"
- Subtext: "Transform your coding skills, one problem at a time"
- Two buttons:
  - "Start" – always filled with `--color-primary`
  - "Learn more →" – transparent with underline on hover
- Centered illustration below buttons

### `/login`

- Title: "Log in"
- Fields:
  - Username or email
  - Password
- Submit button: "Log in"
- Link to `/signup`: "Don't have an account? Sign up"

### `/signup`

- Title: "Sign up"
- Fields:
  - Username
  - Email
  - Password
- Submit button: "Create account"
- Link to `/login`: "Already have an account? Log in"

### `/about`

- Title: "About us"
- Paragraph with placeholder text (`lorem ipsum`)

### `/learnmore`

- Title: "How Beetcode works"
- Four visually separated steps (`<ol>`):
  - Sign up
  - Choose a challenge
  - Submit your solution
  - Track your progress
- Also `lorem ipsum` used here as temporary placeholder

---

## Theme Toggle

Component: `ThemeToggle.svelte`

- Displays 🌙 (moon) when theme is light
- Displays 🌞 (sun) when theme is dark
- Toggles `data-theme="dark"` on `<html>` element
- Styled as a minimal inline button
