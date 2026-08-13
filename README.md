# Nikhil — Portfolio

Personal portfolio and interactive project case-studies.

## Tech Stack
- Vanilla HTML5
- Pure CSS (CSS Variables, Flexbox, CSS Grid, Media Queries)
- Vanilla JavaScript (IntersectionObserver, Canvas API, LocalStorage)

## Architecture
- **Zero Dependencies**: No React, no Tailwind, no build step. 
- **Performance**: IntersectionObserver for scroll reveals, `requestAnimationFrame` for the canvas particle field.
- **Accessibility**: Full ARIA labels, focus-visible states, keyboard navigation for modals.

## Features
- Interactive Canvas Particle Field (with `prefers-reduced-motion` fallback)
- LocalStorage-backed Like System
- Full-screen Project Detail Overlays
- Custom Terminal-style Hero

## Local Development
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.
