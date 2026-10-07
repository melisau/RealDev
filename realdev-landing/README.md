# RealDev — Be a Real Developer

Responsive, bilingual SaaS landing page. No build step or dependencies required.

The page reuses the live RealDev site's `theme.css` and `theme-mode.css` rules in `dist/brand/`. These were exported from the live stylesheets on October 7, 2026. Its existing light and dark palettes, square corners, hard shadows, and fonts are preserved. The additional `styles.css` controls landing-page layout and maps native demo components into that design system. The previous navy concept is superseded.

Serve `dist/` with any static HTTP server. `index.html`, `styles.css`, and `app.js` are the complete site.

## Working interactions

- English / Turkish toggle, saved locally when storage is available.
- Existing RealDev light / dark theme toggle, using the same preference key.
- Header sign-in link points to the existing product's verified authentication route.
- Quiz with correct and incorrect feedback.
- Editable coding challenge with a narrow deterministic solution check. Visitor code is never executed.
- Debugging exercise with a clear explanation of an off-by-one error.
- Learning path dialogs containing curriculum examples and links into the appropriate sample activity.
- Keyboard tab navigation, native modal focus management, reduced-motion support, and mobile layouts.

This is a presentation website with local sample exercises. Account creation, paid plans, and production learner progress are outside this landing page's scope. The primary CTA starts a sample learning experience.

The active visual reference is `design/existing-site-reference.jpg`, captured from the live product. Earlier generated concepts are retained as historical references only. The user's correction and exact tokens are recorded in `design/brief.md`.
