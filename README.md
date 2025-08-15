# Beetcode – UI System Overview

<img width="1440" height="826" alt="Screenshot 2025-08-15 at 04 53 39" src="https://github.com/user-attachments/assets/373cbadb-d563-460e-8063-14a7484e50fb" />
<img width="1440" height="783" alt="Screenshot 2025-08-15 at 04 55 07" src="https://github.com/user-attachments/assets/e5f5a7d7-2e77-4e89-a1d9-969408ca2857" />
<img width="1440" height="828" alt="Screenshot 2025-08-15 at 04 55 52" src="https://github.com/user-attachments/assets/dde2bf1f-f421-4c4b-8cee-75da17bbde75" />
<img width="1440" height="825" alt="Screenshot 2025-08-15 at 05 01 22" src="https://github.com/user-attachments/assets/cf33d317-2b7e-4f99-a4a2-c690b34f372c" />

## Font

**Primary fonts:**   `Ari W9500 Bold` and `Open Sans` (imported via Google Fonts)

**Usage:**  
Defined globally in `app.css` as:

```css
--font-ariw9500: 'Ari W9500 Bold', sans-serif;
--font-opensans: 'Open Sans', sans-serif;
```

Used throughout headings, paragraphs, inputs, and buttons.

---

## Typography Scale

| Element       | Font Size |
|---------------|-----------|
| `h1`          | 1.5rem (24px) |
| `h2`          | 1rem (16px) |
| `p`, `input`  | 0.85rem (13.6px) |
| `.switch`, `a`| 0.68rem (11px) |

Font sizes are set via CSS inside individual `.svelte` components for consistent control.

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
--color-tile:      #fffdf7;
```

### Dark Theme (`[data-theme="dark"]`)

```css
--color-bg:        #1e1e2e;
--color-text:      #f5f5f5;
--color-primary:   #caa9fa;
--color-accent-1:  #8be9fd;
--color-accent-2:  #fab387;
--color-tile:      #2e2e42;
```

---

## Tailwind Usage

Tailwind CSS is used in the project via `@tailwindcss/forms` and `@tailwindcss/typography`, but utility classes (`text-*`, `bg-*`, etc.) are not used in components.

The project relies entirely on custom CSS variables and component-scoped styles to achieve a consistent, pastel pixel-art UI.

---

## Theme Toggle

Component: `ThemeToggle.svelte`

- 🌙 displayed in light mode
- 🌞 displayed in dark mode
- Toggles `data-theme="dark"` on `<html>`
- Minimal, inline-styled button

---

## Logged-in Header

Component: `HeaderUser.svelte`

- Navigation items: Home, Problems, Cohorts, Contest, Leaderboard, Learn more, About us
- Theme toggle on the right
- Elliptical **status badge** (Lvl | $) with a skewed separator
- User icon linking to `/settings`

---

## Guest Header

Component: `HeaderGuest.svelte`

- Logo linking to `/`
- Navigation: About us, Learn more, Log in, Sign up
- Theme toggle

---

## Pages Implemented

### `/` – Landing Page

- Heading: "Improve your skills"
- Subtext: "Transform your coding skills, one problem at a time"
- Buttons:
  - "Start" (primary)
  - "Learn more →" (secondary)
- Illustration below the buttons (optional)

### `/login`

- Form fields:
  - Username or email
  - Password
- Submit button: Log in
- Link to Sign up
- On submit, redirects to `/home`

### `/signup`

- Form fields:
  - Username
  - Email
  - Password
- Submit button: Create account
- Link to Log in
- On submit, redirects to `/home`

### `/about`

- Title: About us
- Placeholder text (`lorem ipsum`)

### `/learnmore`

- Title: How Beetcode works
- Ordered list of steps:
  1. Sign up
  2. Choose a challenge
  3. Submit your solution
  4. Track your progress
- Temporary content using `lorem ipsum`

### `/home`

- Title: Welcome back
- Two cards:
  - Recently solved
  - Stats
- Cards use `--color-tile` for background and adapt to light/dark theme

---

## Layout & Routing

- Layout uses dynamic header switching based on route (`/home`, `/settings`, etc.)
- Guest vs logged-in headers handled in `+layout.svelte`
- Footer visible across all views
