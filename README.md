# Beetcode – UI/UX System Overview

<img width="1916" height="953" alt="Screenshot 2025-09-08 at 20 07 06" src="https://github.com/user-attachments/assets/b96c91e2-8b11-40c3-8a76-de6bd2aacfe3" />
<img width="1916" height="979" alt="Screenshot 2025-09-08 at 20 07 38" src="https://github.com/user-attachments/assets/4462a8ce-f17a-495f-aca0-307841b84a7b" />
<img width="1919" height="985" alt="Screenshot 2025-09-08 at 20 09 18" src="https://github.com/user-attachments/assets/8be8aaa5-3dad-4b97-bd52-5a9afd88a0f8" />
<img width="1919" height="980" alt="Screenshot 2025-09-08 at 20 08 29" src="https://github.com/user-attachments/assets/df0d5791-ef29-4332-9e24-5e0127981483" />
<img width="1919" height="981" alt="Screenshot 2025-09-08 at 20 09 07" src="https://github.com/user-attachments/assets/8c69327e-c7f5-4766-858c-a2b51a402914" />


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

Font sizes are set via Tailwind CSS inside individual `.svelte` components for consistent control.

---

## Logged-in Header

Component: `HeaderUser.svelte`

- Navigation items: Home, Problems,Contest, Shop, Cohorts, Leaderboard, Learn more, About us
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
