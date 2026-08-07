# Résumé Page + Navbar Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Resume" button to the portfolio's navbar that opens a new `/resume` page, styled with the site's own design system, showcasing the résumé content already in the codebase and offering a PDF download.

**Architecture:** A new `/resume` route wrapped in the same portfolio shell as the homepage (`PaletteProvider` → `Hud` → `CursorFX` → content → `PortfolioFooter`). The résumé content reuses existing `portfolioData.ts` exports (no invented content). The navbar's section links become path-aware so they still work when the visitor isn't on the homepage, and gain a new visually distinct "Resume" entry.

**Tech Stack:** Next.js 16 (App Router), React (client components where existing conventions already use `"use client"`), plain CSS (`portfolio.css`, scoped under `#pf-root`) — no test runner is configured in this repo; verification is `tsc --noEmit` plus manual browser checks, matching how the rest of the portfolio work in this repo has been verified.

## Global Constraints

- No new résumé content — every fact reuses `portfolioData.ts`, the About paragraph, or `public/resume.pdf`, all of which already exist in the repo.
- The résumé page must not double-render chrome: `Header`/`Footer` (the generic SaaS-starter components) must stay bypassed on `/resume`, exactly as they already are on `/`.
- Reuse existing `portfolio.css` classes (`.pf-section`, `.pf-container`, `.pf-tag`, `.pf-chip-row`/`.pf-chip`, `.pf-timeline`/`.pf-t-item`, `.pf-card-grid`/`.pf-card`) wherever the content shape matches — add new CSS only for the header block, the navbar CTA pill, and print styles.
- No typing-animation headers (`SectionHeading`) and no `PixelMascot` decorations on the résumé page — it should read instantly and print cleanly.
- Verify with `npx tsc --noEmit -p tsconfig.json` after every code task (must produce no output / no errors).

---

### Task 1: Shared résumé data (summary, contact email, portfolio routes)

**Files:**
- Modify: `src/data/portfolioData.ts`
- Modify: `src/components/Portfolio/About.tsx`

**Interfaces:**
- Produces: `summary: string`, `contactEmail: string`, `portfolioRoutes: string[]` exported from `@/data/portfolioData`, consumed by Task 2 (`Resume.tsx`, route bypass) and Task 3 (`Resume.tsx`).

- [ ] **Step 1: Add `summary`, `contactEmail`, and `portfolioRoutes` to `portfolioData.ts`**

Add this block at the end of `src/data/portfolioData.ts` (after the `projects` export):

```ts
// Shared with both the homepage's About section and the /resume page, so
// the two can't drift out of sync.
export const summary =
  "3+ years of preventive maintenance, diagnostics, and repair on military wheeled vehicles and equipment — sustaining mission readiness while supporting NATO operations in Poland. Now transitioning to full-stack development: certified in HTML/CSS and JavaScript (ES6+), building projects on GitHub, and bringing the same root-cause-analysis discipline to debugging code as to diagnosing engines. Bilingual, adaptable, and used to working under pressure in high-tempo environments.";

// Already the recipient address for the contact form (src/app/api/contact/route.ts) —
// surfaced here too since a résumé needs a visible "how do I reach you" line.
export const contactEmail = "abrahamlanda10@gmail.com";

// Routes that are self-contained portfolio pages (own Hud/PortfolioFooter,
// no generic site Header/Footer). Header and Footer both check this list.
export const portfolioRoutes = ["/", "/resume"];
```

- [ ] **Step 2: Point `About.tsx` at the shared `summary` constant**

In `src/components/Portfolio/About.tsx`, replace the inline paragraph with the shared constant. Current file:

```tsx
import { stats } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const About = () => (
  <div className="pf-section-wrap">
    <section id="pf-about" className="pf-section pf-container">
      <SectionHeading tag="01 // Summary" title="About" />
      <div className="pf-about-grid">
        <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>
          3+ years of preventive maintenance, diagnostics, and repair on military wheeled vehicles and
          equipment — sustaining mission readiness while supporting NATO operations in Poland. Now
          transitioning to full-stack development: certified in HTML/CSS and JavaScript (ES6+), building
          projects on GitHub, and bringing the same root-cause-analysis discipline to debugging code as to
          diagnosing engines. Bilingual, adaptable, and used to working under pressure in high-tempo
          environments.
        </p>
        <div className="pf-stat-strip">
          {stats.map((s) => (
            <div className="pf-stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <PixelMascot pose="about" side="right" />
  </div>
);

export default About;
```

Replace it with:

```tsx
import { stats, summary } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const About = () => (
  <div className="pf-section-wrap">
    <section id="pf-about" className="pf-section pf-container">
      <SectionHeading tag="01 // Summary" title="About" />
      <div className="pf-about-grid">
        <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>{summary}</p>
        <div className="pf-stat-strip">
          {stats.map((s) => (
            <div className="pf-stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <PixelMascot pose="about" side="right" />
  </div>
);

export default About;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no errors).

- [ ] **Step 4: Manual check**

Run `npm run dev`, open `/`, confirm the About section's paragraph text is unchanged from before this edit (it should read identically — only its source moved).

- [ ] **Step 5: Commit**

```bash
git add src/data/portfolioData.ts src/components/Portfolio/About.tsx
git commit -m "Extract shared summary/contact data for the upcoming resume page"
```

---

### Task 2: Résumé route + page header block

**Files:**
- Create: `src/components/Portfolio/Resume.tsx`
- Create: `src/app/(site)/resume/page.tsx`
- Modify: `src/components/Header/index.tsx:33`
- Modify: `src/components/Footer/index.tsx:13`
- Modify: `src/styles/portfolio.css` (append résumé-head styles)

**Interfaces:**
- Consumes: `summary`, `contactEmail`, `portfolioRoutes`, `stats` from `@/data/portfolioData` (Task 1); `PaletteProvider` from `./PaletteContext`; `Hud`, `CursorFX`, `PortfolioFooter` (existing components, unchanged).
- Produces: default-exported `Resume` component at `src/components/Portfolio/Resume.tsx`, consumed by Task 3 (content sections appended in the same file) and by the `/resume` route.

- [ ] **Step 1: Bypass the generic Header/Footer on all portfolio routes**

In `src/components/Header/index.tsx`, the current bypass (around line 32-33) reads:

```tsx
  // The homepage is a self-contained portfolio page with its own Hud header.
  if (pathUrl === "/") return null;
```

Replace with:

```tsx
  // Portfolio pages (homepage, résumé) are self-contained with their own Hud header.
  if (portfolioRoutes.includes(pathUrl)) return null;
```

And add the import at the top of the file, alongside the other imports:

```tsx
import { portfolioRoutes } from "@/data/portfolioData";
```

Do the equivalent in `src/components/Footer/index.tsx`. Current bypass (around line 12-13):

```tsx
  // The homepage is a self-contained portfolio page with its own footer.
  if (pathUrl === "/") return null;
```

Replace with:

```tsx
  // Portfolio pages (homepage, résumé) are self-contained with their own footer.
  if (portfolioRoutes.includes(pathUrl)) return null;
```

Add the same `import { portfolioRoutes } from "@/data/portfolioData";` to `Footer/index.tsx`'s imports.

- [ ] **Step 2: Create the `Resume` component with the header block**

Create `src/components/Portfolio/Resume.tsx`:

```tsx
import Link from "next/link";
import { contactEmail } from "@/data/portfolioData";

const Resume = () => (
  <>
    <header className="pf-resume-head pf-container">
      <span className="pf-eyebrow">Field Dossier · Full Résumé</span>
      <h1>Abraham Landa</h1>
      <div className="pf-hero-role">Software Developer — Front-End Focus, Building Toward Full-Stack</div>

      <div className="pf-resume-contact">
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        <a href="https://github.com/abrahamlanda10" target="_blank" rel="noopener">
          github.com/abrahamlanda10
        </a>
      </div>

      <div className="pf-resume-actions">
        <a className="pf-btn pf-btn-solid" href="/resume.pdf" download>
          Download PDF
        </a>
        <Link className="pf-btn pf-btn-ghost" href="/">
          ← Back to Portfolio
        </Link>
      </div>
    </header>
  </>
);

export default Resume;
```

- [ ] **Step 3: Create the `/resume` route**

Create `src/app/(site)/resume/page.tsx`:

```tsx
import CursorFX from "@/components/Portfolio/CursorFX";
import Hud from "@/components/Portfolio/Hud";
import { PaletteProvider } from "@/components/Portfolio/PaletteContext";
import PortfolioFooter from "@/components/Portfolio/PortfolioFooter";
import Resume from "@/components/Portfolio/Resume";
import "@/styles/portfolio.css";
import { Metadata } from "next";

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

- [ ] **Step 4: Add résumé-header CSS**

In `src/styles/portfolio.css`, append this block after the `/* ---- Footer ---- */` rules (before the closing responsive/reduced-motion media queries):

```css
/* ---- Résumé page ---- */
.pf-resume-head { padding-block: clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 4vw, 2.5rem); border-top: none; }
.pf-resume-head h1 { font-size: clamp(2.2rem, 6vw, 3.2rem); color: var(--ink); margin-block: .5rem; }
.pf-resume-contact { display: flex; flex-wrap: wrap; gap: 1.25rem; font-family: var(--pf-font-mono); font-size: .85rem; margin-top: 1rem; }
.pf-resume-contact a { color: var(--ink-dim); border-bottom: 1px solid transparent; transition: color .15s ease, border-color .15s ease; }
.pf-resume-contact a:hover { color: var(--accent); border-color: var(--accent); }
.pf-resume-actions { display: flex; flex-wrap: wrap; gap: .9rem; margin-top: 1.75rem; }
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no errors).

- [ ] **Step 6: Manual check**

Run `npm run dev`, open `/resume` directly. Confirm:
- Exactly one header bar is visible (the `Hud`, with logo/palette picker/hamburger) — no generic site header on top of it.
- Exactly one footer is visible (`PortfolioFooter`'s `© 2026 Abraham Landa` line) — no generic site footer.
- The name, role, email (`mailto:` link), GitHub link, "Download PDF" (serves `resume.pdf`), and "← Back to Portfolio" (returns to `/`) all render and work.
- Open `/` and confirm it still renders exactly as before (no regression from the `portfolioRoutes` change).

- [ ] **Step 7: Commit**

```bash
git add src/components/Portfolio/Resume.tsx src/app/\(site\)/resume/page.tsx src/components/Header/index.tsx src/components/Footer/index.tsx src/styles/portfolio.css
git commit -m "Add /resume route with portfolio-styled header block"
```

---

### Task 3: Résumé content sections

**Files:**
- Modify: `src/components/Portfolio/Resume.tsx`

**Interfaces:**
- Consumes: `summary`, `stats`, `skillGroups`, `timeline`, `education`, `badges` from `@/data/portfolioData` (all pre-existing exports, unchanged); the `Resume` component shell from Task 2.

- [ ] **Step 1: Append the content sections**

Replace the full contents of `src/components/Portfolio/Resume.tsx` with:

```tsx
import Link from "next/link";
import { badges, contactEmail, education, skillGroups, stats, summary, timeline } from "@/data/portfolioData";

const Resume = () => (
  <>
    <header className="pf-resume-head pf-container">
      <span className="pf-eyebrow">Field Dossier · Full Résumé</span>
      <h1>Abraham Landa</h1>
      <div className="pf-hero-role">Software Developer — Front-End Focus, Building Toward Full-Stack</div>

      <div className="pf-resume-contact">
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        <a href="https://github.com/abrahamlanda10" target="_blank" rel="noopener">
          github.com/abrahamlanda10
        </a>
      </div>

      <div className="pf-resume-actions">
        <a className="pf-btn pf-btn-solid" href="/resume.pdf" download>
          Download PDF
        </a>
        <Link className="pf-btn pf-btn-ghost" href="/">
          ← Back to Portfolio
        </Link>
      </div>
    </header>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Summary</h2>
        <span className="pf-tag">01 // Summary</span>
      </div>
      <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>{summary}</p>
      <div className="pf-stat-strip">
        {stats.map((s) => (
          <div className="pf-stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Skills</h2>
        <span className="pf-tag">02 // Loadout</span>
      </div>
      {skillGroups.map((group) => (
        <div className="pf-skill-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="pf-chip-row">
            {group.skills.map((skill) => (
              <span className="pf-chip" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Experience</h2>
        <span className="pf-tag">03 // Service Log</span>
      </div>
      <div className="pf-timeline">
        {timeline.map((item) => (
          <div className="pf-t-item" key={item.title}>
            <div className="pf-t-date">{item.date}</div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Education</h2>
        <span className="pf-tag">04 // Training Record</span>
      </div>
      <div className="pf-card-grid">
        {education.map((item) => (
          <div className="pf-card" key={item.title}>
            <span className="pf-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Certifications</h2>
        <span className="pf-tag">05 // Badges</span>
      </div>
      <div className="pf-card-grid">
        {badges.map((badge) => (
          <div className="pf-card" key={badge.title}>
            <span className="pf-tag">{badge.issuer}</span>
            <h3>{badge.title}</h3>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default Resume;
```

Note: section headings here deliberately use plain `<h2>`/`<span className="pf-tag">` inside `.pf-section-head` — not the `SectionHeading` component — so there's no typing animation and no `data-reveal` (this page doesn't mount `ScrollReveal`). Cards/chips also skip the `pf-tilt` class used on the homepage, since `CursorFX`'s tilt effect is a homepage flourish, not needed for a page meant to be scanned/printed quickly.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no errors).

- [ ] **Step 3: Manual check**

Open `/resume`. Confirm all five sections render with the same data as the homepage's About/Skills/Experience/Education/Badges sections: Summary paragraph + 4 stats, 3 skill groups with their chips, 3 timeline entries, 4 education cards, 2 certification cards (title + issuer, no images). Confirm the page scrolls as one continuous document (no separate typing/reveal animations firing).

- [ ] **Step 4: Commit**

```bash
git add src/components/Portfolio/Resume.tsx
git commit -m "Fill in resume page content sections"
```

---

### Task 4: Navbar — cross-page section links + Resume CTA button

**Files:**
- Modify: `src/components/Portfolio/Hud.tsx`
- Modify: `src/styles/portfolio.css` (append `.pf-hud-nav-cta` styles)

**Interfaces:**
- Consumes: `navLinks` from `@/data/portfolioData` (unchanged shape: `{ href: string; label: string }[]`); `usePathname` from `next/navigation`; `Link` from `next/link`.
- Produces: no new exports — `Hud` remains the default export, same as before, now usable correctly from any route.

- [ ] **Step 1: Make section links and the brand link path-aware, add the Resume CTA**

Replace the full contents of `src/components/Portfolio/Hud.tsx` with:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, palettes } from "@/data/portfolioData";
import { usePalette } from "./PaletteContext";

const Hud = () => {
  const { palette, setPalette } = usePalette();
  const [navOpen, setNavOpen] = useState(false);
  const [active, setActive] = useState<string>(navLinks[0].href);
  const pathUrl = usePathname();
  const isHome = pathUrl === "/";

  // Scrollspy: highlight whichever section is crossing the middle band of
  // the viewport, so the nav link stays in sync as the visitor scrolls.
  // Only the homepage has these section ids; elsewhere this is a no-op.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeNav = () => setNavOpen(false);

  // Section anchors only resolve on the homepage. From any other route,
  // prefix with "/" so Next navigates home first, then scrolls to the id.
  const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <div className="pf-hud" id="pf-hud">
      <Link href={sectionHref("#pf-hero")} className="pf-brand" onClick={closeNav}>
        <Image src="/images/al-monogram.png" alt="AL monogram" width={30} height={30} />
        <div>
          <strong>A. LANDA</strong> <span>// DOSSIER</span>
        </div>
      </Link>

      <nav className="pf-hud-nav" id="pf-hud-nav" data-open={navOpen} aria-label="Section navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={sectionHref(link.href)}
            className="pf-hud-nav-link"
            aria-current={isHome && active === link.href ? "true" : undefined}
            onClick={closeNav}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/resume"
          className="pf-hud-nav-link pf-hud-nav-cta"
          aria-current={pathUrl === "/resume" ? "true" : undefined}
          onClick={closeNav}
        >
          Resume
        </Link>
      </nav>

      <div className="pf-hud-actions">
        <div className="pf-palette-picker" role="group" aria-label="Color palette">
          {palettes.map((p) => (
            <button
              key={p.id}
              className="pf-swatch"
              style={{ ["--sw-bg" as string]: p.swBg, ["--sw-accent" as string]: p.swAccent }}
              aria-pressed={palette === p.id}
              aria-label={p.label}
              onClick={() => setPalette(p.id)}
            />
          ))}
        </div>

        <button
          className="pf-hud-toggle"
          aria-expanded={navOpen}
          aria-controls="pf-hud-nav"
          aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  );
};

export default Hud;
```

- [ ] **Step 2: Add `.pf-hud-nav-cta` CSS**

In `src/styles/portfolio.css`, find the existing block:

```css
.pf-hud-nav-link { position: relative; padding: .3rem 0; color: var(--ink-dim); white-space: nowrap; transition: color .15s ease; }
.pf-hud-nav-link:hover { color: var(--ink); }
.pf-hud-nav-link[aria-current="true"] { color: var(--accent); }
.pf-hud-nav-link[aria-current="true"]::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: var(--accent);
}
```

Add immediately after it:

```css
.pf-hud-nav-cta {
  color: var(--accent-ink); background: var(--accent); padding: .45rem 1rem; border: 1px solid var(--accent);
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.pf-hud-nav-cta:hover { background: var(--accent-2); border-color: var(--accent-2); color: var(--accent-ink); transform: translate(-1px, -1px); }
.pf-hud-nav-cta[aria-current="true"] { color: var(--accent-ink); background: var(--accent-2); border-color: var(--accent-2); }
.pf-hud-nav-cta[aria-current="true"]::after { content: none; }
```

Then, inside the existing `@media (max-width: 860px) { ... }` block (which already has `.pf-hud-toggle`, `.pf-hud-nav`, `.pf-hud-nav-link` rules), add:

```css
  .pf-hud-nav-cta { margin-top: .5rem; padding: .7rem 1rem; text-align: center; border-bottom: none; }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no errors).

- [ ] **Step 4: Manual check**

With `npm run dev` running:
- On `/`, confirm the navbar now shows the 7 section links plus a visually distinct filled "Resume" pill at the end; clicking it navigates to `/resume`.
- On `/resume`, confirm the "Resume" pill shows as active (`aria-current`), and clicking any section link (e.g. "Skills") navigates to `/#pf-skills` and lands on that section on the homepage.
- On `/resume`, confirm clicking the brand/logo navigates to `/#pf-hero` (back to the homepage hero).
- Resize to a narrow (mobile) width, open the hamburger menu, confirm the "Resume" pill appears in the dropdown styled as a full-width button, and clicking any link closes the menu.

- [ ] **Step 5: Commit**

```bash
git add src/components/Portfolio/Hud.tsx src/styles/portfolio.css
git commit -m "Make navbar links path-aware and add Resume CTA button"
```

---

### Task 5: Print stylesheet

**Files:**
- Modify: `src/styles/portfolio.css` (append `@media print` block)

**Interfaces:**
- Consumes: no new interfaces — purely additive CSS scoped under `#pf-root`.

- [ ] **Step 1: Add the print stylesheet**

In `src/styles/portfolio.css`, append this block at the end of the file (after the existing `@media (prefers-reduced-motion: reduce)` block):

```css
@media print {
  #pf-root { background: #fff; color: #111; }
  #pf-root * { text-shadow: none !important; filter: none !important; box-shadow: none !important; animation: none !important; }
  .pf-hud, .pf-footer, .pf-pixel-cursor, .pf-hud-toggle { display: none !important; }
  .pf-section::before, .pf-section::after { display: none !important; }
  .pf-section { border-top-color: #ccc; padding-block: 1rem; }
  .pf-card, .pf-proj-card, .pf-contact-box, .pf-chip, .pf-stat { background: #fff; border: 1px solid #ccc; }
  .pf-resume-head h1, #pf-root h2, #pf-root h3 { color: #111; }
  #pf-root p, .pf-tag, .pf-t-date { color: #333; }
  .pf-resume-actions { display: none; }
}
```

This hides the navbar, footer, custom cursor, and decorative section backdrops when printing, flattens all the drop-shadow/glow effects to flat borders, and forces black-on-white text — while the "Download PDF"/"Back to Portfolio" buttons (not useful on a printed page) are hidden via `.pf-resume-actions`.

- [ ] **Step 2: Manual check**

Open `/resume` in the browser, open the print preview (Ctrl+P / Cmd+P). Confirm: no navbar, no footer, no custom cursor artifacts, black text on white background, section content (summary, skills, experience, education, certifications) all present and readable, no giant glow/shadow effects.

- [ ] **Step 3: Commit**

```bash
git add src/styles/portfolio.css
git commit -m "Add print stylesheet for the resume page"
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no errors).

- [ ] **Step 2: Full manual walkthrough**

With `npm run dev` running, on both desktop and a narrow/mobile viewport:
- From `/`, click "Resume" in the navbar → lands on `/resume` with correct styling, single Hud/footer.
- On `/resume`, click "Download PDF" → downloads/opens `resume.pdf`.
- On `/resume`, click "← Back to Portfolio" → returns to `/`.
- On `/resume`, click each section link ("About", "Skills", …) → navigates to `/` and scrolls to the right section, landing below the sticky Hud (not tucked under it).
- On `/resume`, switch palettes via the swatches → colors update across the whole page (header, sections, buttons).
- Confirm the mobile hamburger menu on `/resume` opens/closes correctly and includes the "Resume" pill (shown active).
- Print preview on `/resume` looks clean (per Task 5's check).

- [ ] **Step 3: Confirm no regressions on other routes**

Visit an unrelated existing route (e.g. `/pricing` or `/about`) and confirm the generic site `Header`/`Footer` still render normally there (only `/` and `/resume` should be bypassed).
