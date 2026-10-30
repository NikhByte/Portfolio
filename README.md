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

## Browser regression checks

The browser suite checks responsive overflow, dialog keyboard behavior, project filters,
local likes, reduced motion, and contact-form validation/error/success states. Contact
requests are intercepted; the suite does not send messages.

```bash
python3 -m venv /tmp/portfolio-test-env
/tmp/portfolio-test-env/bin/pip install playwright
/tmp/portfolio-test-env/bin/python -m playwright install chromium
# With the local server running on port 8080:
/tmp/portfolio-test-env/bin/python tests/browser_check.py
```

Set `PORTFOLIO_URL` to test another local server. Screenshots default to
`/tmp/portfolio-screenshots`; override with `PORTFOLIO_SCREENSHOTS`.
