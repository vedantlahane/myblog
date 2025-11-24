Xandar - Cinematic Sci-Fi Design Tokens

Overview
This file documents the new sci-fi editorial visual tokens and intended usage. The goal is a clean, cinematic dark-first aesthetic while preserving editorial readability and content focus.

Colors
- --brand-navy: #0B0C10 (Deep Space Black) — main background for dark surfaces
- --brand-iron: #1B1E24 — secondary surface
- --brand-surface: #262A32 — muted surface
- --brand-blue: #7952F3 — cosmic violet (primary accent); kept for backward compatibility
- --brand-accent-violet: #7952F3 — primary accent used across CTAs and links
- --brand-accent-gold: #D4A761 — imperial gold (secondary accent) for writer UI and CTAs
- --brand-cyan: #66FCF1 — neon cyan used for micro interactions and progress bars
- --brand-red: #C3073F — rebel red used for destructive states and errors
- text colors: white and soft gray — to ensure legibility on dark surfaces

Typography
- Body: Inter (system sans), kept at 1rem body size
- Display headings: Playfair Display (serif) for large cinematic headings
- Monospace: Source Code Pro for UI microcopy, tags, and metadata
- H1: larger (3rem), bolder, and slightly tighter leading

Key Classes and components
- Emphasize using `bg-brand-navy`, `bg-surface`, or `bg-surface-muted` for surfaces
- Use `bg-brand-accent-gold` for writer / gold-themed CTAs and `bg-brand-blue` (violet) as primary accent for links/secondary CTAs
- `blog-card` now uses 12px radius, hard shadows, and a subtle neon glow on hover
- `hero-overlay` — added in styles to create nebula blur overlay effects on hero images
- `tag-pill-sci` — new tag style for sci-fi minimal pills with glow on hover

Dark-mode
- The primary look targets dark mode. The app defaults to dark theme. CSS variables read in both modes.

Assets
- `/mw-logo.svg` — new cinematic logo (violet gradient + cyan ring) placed in `/frontend/public/`.

Next steps
- Replace all amber-based UI tokens with brand colors across the app (auth screens, not found pages, bookmarks, etc.)
- Create component variants for gold vs violet accents where needed (primary vs secondary CTAs)
- Replace hero images with softer nebula overlays; test contrast across a sample page
- Update favicons and brand assets; optionally add dark/light SVG variants
- Add unit snapshots / e2e checks to ensure tokens are used consistently

Notes
- Tailwind tokens are added in `tailwind.config.js` to reflect these new colors.
- Keep compatibility by retaining `brand-blue` class mapped to the violet palette until full conversion.
