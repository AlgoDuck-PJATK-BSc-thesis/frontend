# Beetcode – UI System Overview
![Screenshot 2025-06-24 at 08 16 52](https://github.com/user-attachments/assets/b9b2fe43-4723-4e37-a4b7-fad3cac50c98)
![Screenshot 2025-06-24 at 08 18 04](https://github.com/user-attachments/assets/792309de-f820-4285-95cb-4ab1b79c211f)
<img width="1432" alt="Screenshot 2025-06-24 at 09 22 44" src="https://github.com/user-attachments/assets/bca1c8fd-3293-4ce7-bbea-8ef5548db0a9" />

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
