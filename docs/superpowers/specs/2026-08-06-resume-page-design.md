# Resume Page + Navbar Button — Design

**Date:** 2026-08-06
**Status:** Approved

## Problem

The portfolio homepage (`/`) has no dedicated place to see the whole résumé at a
glance or download it. The site already ships `public/resume.pdf`, but nothing
links to it. We want a "Resume" button in the site's navbar (`Hud`) that opens
a new `/resume` page, styled consistently with the rest of the portfolio,
that showcases the résumé content and offers a PDF download.

## Goals

- A "Resume" entry in the `Hud` navbar, styled as a distinct action (small
  filled pill), not just another section link.
- A new `/resume` route, wrapped in the same portfolio shell as `/`
  (`PaletteProvider` → `Hud` → `CursorFX` → content → `PortfolioFooter`), so it
  inherits the palette picker, fonts, colors, and cursor effects.
- The résumé page reuses existing data (`portfolioData.ts`, About's summary
  paragraph) rather than duplicating/inventing content — summary, skills,
  experience, education, certifications, plus a header with contact info and
  a "Download PDF" button pointing at `public/resume.pdf`.
- Section nav links keep working when the visitor is on `/resume` (currently
  they're plain `#anchor` links, which no-op off the homepage).
- The résumé page also prints cleanly (`@media print`), since it's literally
  a résumé — someone may hit Ctrl+P instead of clicking Download.

## Non-goals

- No new/invented résumé content — everything reuses data already in the
  repo (`portfolioData.ts`, the About paragraph, `public/resume.pdf`).
- No redesign of the homepage sections themselves.
- No generic multi-page portfolio framework — just enough shared plumbing
  (`portfolioRoutes`) for this one additional page, not a speculative system.

## Design

### 1. Routing & layout integration

`src/app/(site)/layout.tsx` always renders the generic SaaS-starter `Header`
and `Footer`. Those two components already bypass themselves (`return null`)
when `pathUrl === "/"`, because the homepage is a self-contained portfolio
page with its own `Hud` and `PortfolioFooter`.

Add a shared constant:

```ts
// src/data/portfolioData.ts
export const portfolioRoutes = ["/", "/resume"];
```

Update `Header` and `Footer` to bypass on `portfolioRoutes.includes(pathUrl)`
instead of the hardcoded `pathUrl === "/"` check. This keeps the "which
routes are self-contained portfolio pages" list in one place if a page is
ever added later.

New route file `src/app/(site)/resume/page.tsx`, mirroring the structure of
`src/app/(site)/page.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Abraham Landa — Résumé",
  description: "Full résumé for Abraham Landa, a software developer transitioning from military vehicle maintenance to full-stack development.",
};

export default function ResumePage() {
  return (
    <PaletteProvider>
      <Hud />
      <CursorFX />
      <Resume />
      <PortfolioFooter />
    </PaletteProvider>
  );
}
```

(No `ScrollReveal`/mascots on this page — see §3.)

### 2. Navbar: cross-page section links + the Resume button

`Hud`'s section links are currently plain `<a href="#pf-about">`. From `/`
that's correct; from `/resume` (or any future non-home portfolio route) the
browser just appends the hash to the current URL and finds nothing, so
clicking "About" from the résumé page silently does nothing.

Fix: switch nav links to Next's `Link`, and compute the href from the
current path via `usePathname()`:

```tsx
const isHome = pathUrl === "/";
const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);
```

So `#pf-about` becomes `/#pf-about` when not on the homepage — Next
navigates home and the browser scrolls to the section (the existing
`html:has(#pf-root) { scroll-behavior: smooth; scroll-padding-top: 80px }`
rule from the navbar work already handles the offset/smoothness). Same
treatment for the brand/logo link (`#pf-hero` → `/#pf-hero`).

Add a new, visually distinct entry at the end of the nav list:

```tsx
<Link
  href="/resume"
  className="pf-hud-nav-link pf-hud-nav-cta"
  aria-current={pathUrl === "/resume" ? "true" : undefined}
  onClick={closeNav}
>
  Resume
</Link>
```

`.pf-hud-nav-cta` renders it as a small filled pill (reusing the `pf-btn`
color logic at navbar scale) so it reads as an action, distinct from the
plain-text section links. It lives in the same `navLinks`-driven list so it
automatically gets the same responsive collapse into the mobile dropdown —
no new breakpoint logic needed.

Scrollspy (`IntersectionObserver` over section ids) is unaffected: on
`/resume` there are no matching section elements, and the existing
`sections.length === 0 → return` guard already short-circuits cleanly.

### 3. Résumé page content (`src/components/Portfolio/Resume.tsx`)

Single-column, scannable, calmer than the homepage — no typing-animation
headers, no pixel mascots, so it reads instantly and prints cleanly. Reuses
existing `portfolioData.ts` exports; the only new data is lifting About's
summary paragraph out of `About.tsx` into a shared constant so the homepage
and résumé page can't drift apart:

```ts
// src/data/portfolioData.ts
export const summary = "3+ years of preventive maintenance, diagnostics, and repair on military wheeled vehicles and equipment — sustaining mission readiness while supporting NATO operations in Poland. Now transitioning to full-stack development: certified in HTML/CSS and JavaScript (ES6+), building projects on GitHub, and bringing the same root-cause-analysis discipline to debugging code as to diagnosing engines. Bilingual, adaptable, and used to working under pressure in high-tempo environments.";

export const contactEmail = "abrahamlanda10@gmail.com";
```

(`About.tsx` is updated to import `summary` instead of inlining it.
`abrahamlanda10@gmail.com` is already the contact-form's recipient address
server-side in `src/app/api/contact/route.ts` — putting it on the résumé
header is the standard "how do I reach you" line any résumé needs.)

Page structure:

```
<header class="pf-resume-head pf-container">
  eyebrow: "Field Dossier · Full Résumé"
  h1: Abraham Landa
  role tagline (same as Hero)
  contact row: mailto: link, GitHub link
  actions: [Download PDF] (→ /resume.pdf, download attr) [← Back to Portfolio] (→ /)
</header>

<section class="pf-section pf-container">  Summary (paragraph + stat strip, reusing `stats`)
<section class="pf-section pf-container">  Skills (skillGroups, compact pf-chip-row per group)
<section class="pf-section pf-container">  Experience (timeline, reusing .pf-timeline)
<section class="pf-section pf-container">  Education (education array, reusing .pf-card-grid)
<section class="pf-section pf-container">  Certifications (badges array, compact — title/issuer only, no images)
```

Each section uses a plain `<h2>` + `<span class="pf-tag">` heading (no
`SectionHeading`/typing effect, no `data-reveal`), reusing the existing
`.pf-section`, `.pf-container`, `.pf-tag`, `.pf-chip-row`/`.pf-chip`,
`.pf-timeline`/`.pf-t-item`, `.pf-card-grid`/`.pf-card` classes as-is to
minimize new CSS surface.

New CSS (in `portfolio.css`): `.pf-resume-head`, `.pf-resume-contact`,
`.pf-resume-actions` (layout for the header block), `.pf-hud-nav-cta` (the
navbar CTA pill), and a `@media print` block that hides `.pf-hud`,
`.pf-footer`, `.pf-pixel-cursor`, and the `.pf-section::before/::after`
decorative backdrops, and forces light/high-contrast colors for print.

### 4. Testing

- `tsc --noEmit` clean.
- Manual verification in the browser (as done for the navbar work): confirm
  the Resume button navigates from `/`, confirm section links navigate
  correctly from `/resume` back to homepage sections, confirm Download PDF
  serves `resume.pdf`, confirm the mobile dropdown includes the Resume pill,
  confirm print preview looks reasonable.

## Open questions

None — content source, button placement, and the print stylesheet were all
confirmed with the user before writing this spec.
