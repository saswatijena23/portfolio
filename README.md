# Maya Chen — Personal Portfolio

A four-page personal portfolio site built with semantic HTML5, hand-written
CSS3, and vanilla JavaScript — no frameworks, build tools, or external
libraries. Designed to score 100/100 on Lighthouse Accessibility and SEO
audits and to comply with WCAG 2.2 Level AA.

## Project structure

```
portfolio/
│
├── index.html          Home — hero, skills overview, featured projects, CTA
├── about.html           About — biography, education, experience, skills
├── projects.html         Projects — six case studies
├── contact.html           Contact — accessible contact form
├── css/
│   └── style.css          Single external stylesheet (design tokens, layout)
├── js/
│   └── script.js          Single external script (nav, validation, scroll)
├── images/                Photography, screenshots, favicon (see below)
└── README.md
```

## Running the site locally

No build step is required. Any static file server works:

```bash
# Python
python3 -m http.server 8000

# Node (with the `serve` package)
npx serve .
```

Then open `http://localhost:8000` in a browser. Opening `index.html`
directly from the filesystem also works, though a local server more
closely mirrors production behavior for things like relative asset paths.

## Images

The HTML references the following image files, which are placeholders in
this deliverable and should be replaced with real assets before deploying:

- `images/og-cover.jpg` — 1200×630 social share image referenced by Open
  Graph / Twitter Card tags on every page.
- `images/favicon.svg`
- `images/maya-portrait.jpg` — 480×560
- `images/project-dashboard.jpg`, `project-marketplace.jpg`,
  `project-learning.jpg`, `project-forms.jpg`, `project-booking.jpg`,
  `project-docs.jpg` — 640×420, used on both the Home preview and the
  Projects page.

All `<img>` elements already have explicit `width`/`height` attributes to
reserve layout space and avoid cumulative layout shift, and `loading="lazy"`
where appropriate. Swap in real files at the same dimensions and paths.

## Accessibility (WCAG 2.2 AA) implementation notes

- **Skip link** — the first focusable element on every page, visually
  hidden until it receives keyboard focus, jumps to `#main-content`.
- **Landmarks** — one `<header>`, one `<nav aria-label="Primary
  Navigation">`, one `<main>`, one `<footer>` per page; `<aside>` used only
  where content is genuinely tangential (e.g. alternate contact methods).
- **Heading hierarchy** — exactly one `<h1>` per page; `<h2>` for section
  titles; `<h3>` inside individual articles/cards. No levels are skipped.
- **Active navigation state** — communicated with `aria-current="page"`,
  not color alone; the stylesheet also adds a bold weight and underline.
- **Focus visibility** — a consistent, high-contrast `:focus-visible`
  outline is applied to every interactive element site-wide, distinct from
  hover styling, satisfying WCAG 2.2's Focus Appearance criterion.
- **Forms** — every input has a programmatically associated `<label>`, a
  correct `type`, a real `autocomplete` token, and `aria-describedby`
  pointing at a live-region error message. Validation runs in JavaScript
  (`novalidate` on the `<form>`) so error text is consistent across
  browsers instead of relying on inconsistent native bubbles.
- **Images** — meaningful images carry descriptive `alt` text; decorative
  elements (the hero ruler ticks, hamburger bars, logo mark) use
  `aria-hidden="true"` and empty `alt=""` so they're skipped by assistive
  technology.
- **Link text** — link text is descriptive in context ("Read the case
  study," not "click here"); ambiguous icon-only or repeated links (social
  icons, GitHub/Live Demo buttons) carry a specific `aria-label`.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables smooth
  scrolling and all transitions/animations globally.
- **Color contrast** — the palette's default text/background/accent pairs
  were chosen and adjusted (e.g. the amber accent was darkened for
  on-white use) to clear 4.5:1 for body text and 3:1 for large text and UI
  components.

## SEO implementation notes

Every page includes a unique `<title>`, `<meta name="description">`,
`<meta name="keywords">`, `<meta name="author">`, a canonical URL
placeholder, and full Open Graph + Twitter Card tags. Content is organized
under semantic landmarks and a single logical heading outline per page,
which both search engines and assistive technology can use to build an
accurate outline of the page.

**Before deploying:** replace every `https://www.mayachen.dev/...`
placeholder URL (canonical links, Open Graph/Twitter URLs) with the site's
real production domain.

## Performance notes

- Google Fonts are loaded with `rel="preconnect"` to reduce connection
  setup time, and a single `display=swap` request bundles all three
  families used (Space Grotesk, Lora, JetBrains Mono).
- Below-the-fold images use `loading="lazy"`; all images declare
  `width`/`height` to prevent layout shift.
- CSS and JS are each a single, unminified file for readability in this
  deliverable. For production, minify both and consider self-hosting the
  webfonts to remove the third-party request entirely.
- No render-blocking third-party scripts; `script.js` is loaded at the end
  of `<body>` with no external dependencies.

## Browser support

Built on standard, broadly supported CSS (custom properties, Grid,
Flexbox) and ES6+ JavaScript. No transpilation or polyfills included;
add them if you need to support browsers older than the last two major
versions of evergreen browsers.