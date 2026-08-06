# Portfolio Interaction Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three portfolio-homepage effects from `docs/superpowers/specs/2026-08-05-adaptive-pixel-cursor-design.md`: a palette-colored pixel cursor with a hard-edged shadow, a recurring pixel-art mascot beside every section below the hero, and a scroll-triggered typing animation on each section's heading.

**Architecture:** `CursorFX.tsx` is rewritten in place (glow/dot-trail removed, pixel cursor added). Two new small components carry the new behavior: `PixelMascot.tsx` (a pose-driven decorative character) and `SectionHeading.tsx` (typing-animated `.pf-section-head` markup, replacing the hand-written block in every section). A third new component, `ScrollReveal.tsx`, is a single shared `IntersectionObserver` mounted once at the page root — both `PixelMascot` and `SectionHeading` mark themselves `data-reveal` and key their CSS off the `.pf-in-view` class it adds. All 7 section components (`About`, `Skills`, `Experience`, `Education`, `Badges`, `Projects`, `Contact`) are wrapped in a new `.pf-section-wrap` div so the mascot — which must NOT be clipped — can sit outside `.pf-section`'s `overflow: hidden` box, positioned in the page gutter beside the 1120px-wide `.pf-container`.

**Tech Stack:** Next.js (App Router) + React (client components for anything with `useEffect`/refs), plain CSS (`src/styles/portfolio.css`, scoped under `#pf-root`), no animation library — CSS keyframes + `IntersectionObserver` only.

## Global Constraints

- Scope is `#pf-root` only (the portfolio homepage, `src/app/(site)/page.tsx`) — do not touch Docs/Pricing/Auth/other routes.
- No test framework is configured in this repo (no jest/vitest — `package.json` only has `dev`/`build`/`start`/`lint`). Verification for every task is `npm run lint` and `npm run build` (type/lint correctness), plus a manual check in `npm run dev` for anything visual — exactly as scoped in the design spec's "Testing / verification" sections. Do not add a test framework as part of this work.
- All new/changed colors use the existing palette tokens (`var(--ink)`, `var(--accent)`, `var(--accent-2)`, `var(--line)`) — never hardcoded hex — so everything re-themes with the palette swatches in `Hud.tsx`.
- All decorative-only elements get `aria-hidden="true"`.
- Match existing code style: 2-space indent, double-quoted strings, `"use client"` only on files that use hooks/refs/browser APIs, default exports for components.
- Every animation/transition added must already be covered by the existing global killswitch in `portfolio.css`: `@media (prefers-reduced-motion: reduce) { #pf-root * { transition: none !important; animation: none !important; } }`. Any new CSS must resolve to its correct **final** visible state when animations are stripped this way (not get stuck hidden) — this is verified explicitly in Tasks 2 and 5.

---

### Task 1: Adaptive pixel cursor

**Files:**
- Modify: `src/styles/portfolio.css` (remove `.pf-cursor-glow`/`.pf-pixel-dot` rules ~lines 165–176, add new pixel-cursor rules)
- Modify: `src/components/Portfolio/CursorFX.tsx` (full rewrite of the glow/dot logic)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks — this feature is fully self-contained. (`CursorFX.tsx` keeps its existing hue-cycle/tilt/parallax behavior unchanged, and keeps being mounted in `src/app/(site)/page.tsx` exactly where it already is.)

- [ ] **Step 1: Replace the cursor CSS rules**

In `src/styles/portfolio.css`, find and delete this block:

```css
/* ---- Cursor glow: a soft accent halo that lightens the grid it passes over ---- */
.pf-cursor-glow {
  position: fixed; top: 0; left: 0; width: 280px; height: 280px; margin: -140px 0 0 -140px;
  border-radius: 50%; pointer-events: none; z-index: 6; mix-blend-mode: screen; opacity: 0;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 68%);
  filter: blur(4px); transition: transform .07s linear, opacity .3s ease;
}
.pf-pixel-dot {
  position: fixed; width: 5px; height: 5px; background: var(--accent); pointer-events: none; z-index: 999;
  box-shadow: 0 0 6px 1px var(--accent), 0 0 14px 3px color-mix(in srgb, var(--accent) 60%, transparent);
  transition: transform .6s ease-out, opacity .6s ease-out; opacity: .9;
}
```

Replace it with:

```css
/* ---- Pixel cursor: a palette-shadowed block that replaces the OS arrow ---- */
#pf-root[data-cursor-fx="on"],
#pf-root[data-cursor-fx="on"] * { cursor: none; }

.pf-pixel-cursor {
  position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 999;
  opacity: 0; transition: transform .07s linear, opacity .3s ease;
}
.pf-pixel-cursor-shadow, .pf-pixel-cursor-core {
  position: absolute; top: 0; left: 0; width: 10px; height: 10px;
  transition: transform .15s cubic-bezier(.2,.8,.2,1);
}
.pf-pixel-cursor-shadow { background: var(--line); transform: translate(4px, 4px); }
.pf-pixel-cursor-core { background: var(--accent); }
.pf-pixel-cursor--active .pf-pixel-cursor-core { transform: scale(1.5); }
.pf-pixel-cursor--active .pf-pixel-cursor-shadow { transform: translate(7px, 7px); }
```

- [ ] **Step 2: Rewrite `CursorFX.tsx`**

Replace the full contents of `src/components/Portfolio/CursorFX.tsx` with:

```tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Mounted once at the root of the portfolio. Handles the decorative,
 * non-essential interactions: a custom pixel cursor with a palette-colored
 * offset shadow (replacing the OS arrow), an ambient hue cycle, a subtle 3D
 * tilt on `.pf-tilt` elements, and the section-grid parallax push. All of it
 * is skipped under reduced-motion or on touch/coarse pointers.
 */
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, .pf-swatch, .pf-tilt';

const CursorFX = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.getElementById("pf-root");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerFine = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion || !pointerFine) return;

    root.dataset.cursorFx = "on";

    const cursor = cursorRef.current;
    let rafPending = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          if (cursor) {
            cursor.style.transform = `translate(${lastX}px,${lastY}px)`;
            cursor.style.opacity = "1";
          }
          const mx = (lastX / window.innerWidth - 0.5) * 2;
          const my = (lastY / window.innerHeight - 0.5) * 2;
          root.style.setProperty("--pf-mx", mx.toFixed(3));
          root.style.setProperty("--pf-my", my.toFixed(3));
          rafPending = false;
        });
      }
    };

    const onMouseLeave = () => {
      if (cursor) cursor.style.opacity = "0";
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (cursor && target.closest?.(INTERACTIVE_SELECTOR)) {
        cursor.classList.add("pf-pixel-cursor--active");
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (cursor && target.closest?.(INTERACTIVE_SELECTOR)) {
        cursor.classList.remove("pf-pixel-cursor--active");
      }
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("mouseover", onMouseOver);
    root.addEventListener("mouseout", onMouseOut);

    // Ambient color cycle: every 5s, ease the accent-tinted hero glow to a new hue.
    let hue = 0;
    const hueInterval = window.setInterval(() => {
      hue = (hue + 45) % 360;
      root.style.setProperty("--pf-hue-deg", `${hue}deg`);
    }, 5000);

    // Cursor-tracked 3D tilt for any element flagged with .pf-tilt.
    const tiltEls = Array.from(root.querySelectorAll<HTMLElement>(".pf-tilt"));
    const tiltHandlers = tiltEls.map((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(600px) rotateX(${py * -10}deg) rotateY(${px * 10}deg) translateZ(6px)`;
      };
      const leave = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return { el, move, leave };
    });

    return () => {
      delete root.dataset.cursorFx;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      root.removeEventListener("mouseover", onMouseOver);
      root.removeEventListener("mouseout", onMouseOut);
      window.clearInterval(hueInterval);
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <div className="pf-pixel-cursor" ref={cursorRef} aria-hidden="true">
      <span className="pf-pixel-cursor-shadow" />
      <span className="pf-pixel-cursor-core" />
    </div>
  );
};

export default CursorFX;
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect a clean production build.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open the portfolio homepage.
- The OS arrow is gone; a small amber square with an offset shadow block follows the mouse.
- Switch each palette swatch in the header — the shadow's color changes to match that palette's `--line` token.
- Hover a nav link, a button, and a palette swatch — the cursor visibly grows and its shadow offset increases.
- In DevTools, emulate `prefers-reduced-motion: reduce` — reload — the native OS arrow is back (no pixel cursor).
- In DevTools, toggle device toolbar (touch emulation) — reload — the native OS arrow is used (no pixel cursor, no console errors).

- [ ] **Step 5: Commit**

```bash
git add src/styles/portfolio.css src/components/Portfolio/CursorFX.tsx
git commit -m "Replace cursor glow/dot-trail with a palette-shadowed pixel cursor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Shared scroll-reveal utility

**Files:**
- Create: `src/components/Portfolio/ScrollReveal.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a component with **no props**, default-exported from `src/components/Portfolio/ScrollReveal.tsx`. Contract for later tasks: mark any element that should reveal-on-scroll with a `data-reveal` attribute inside `#pf-root`; this component adds the class `pf-in-view` to it the first time it's ≥20% visible in the viewport (and stops observing it after). **Under `prefers-reduced-motion: reduce`, it adds `pf-in-view` to every `data-reveal` element immediately and synchronously on mount instead of observing** — this is required so elements whose *default* CSS state is hidden (e.g. `opacity: 0` pending reveal) don't stay permanently hidden just because reduced-motion also disables the observer-driven animation. Tasks 3 and 4 both render `data-reveal` elements and key CSS off `.pf-in-view`.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect } from "react";

/**
 * Mounted once at the root of the portfolio. Watches every element carrying
 * `data-reveal` inside #pf-root and adds `.pf-in-view` the first time it
 * scrolls into the viewport, then stops observing it — a single shared
 * IntersectionObserver used by both the section mascot's entrance animation
 * (PixelMascot.tsx) and the section-heading typing animation
 * (SectionHeading.tsx).
 *
 * Under prefers-reduced-motion, every data-reveal element is marked in-view
 * immediately instead of observed: the global `animation: none !important`
 * rule in portfolio.css already strips the motion, but elements whose
 * *default* state is hidden (pending reveal) still need `.pf-in-view` added
 * to reach their correct final visible state.
 */
const ScrollReveal = () => {
  useEffect(() => {
    const root = document.getElementById("pf-root");
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      targets.forEach((el) => el.classList.add("pf-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pf-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
};

export default ScrollReveal;
```

- [ ] **Step 2: Verify build and lint**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect a clean production build. (No visible effect yet — nothing renders `data-reveal` until Tasks 3/4/5. This is expected; full behavior is verified in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Portfolio/ScrollReveal.tsx
git commit -m "Add shared scroll-reveal IntersectionObserver utility

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Pixel-art section mascot

**Files:**
- Create: `src/components/Portfolio/PixelMascot.tsx`
- Modify: `src/styles/portfolio.css` (add mascot rules)

**Interfaces:**
- Consumes: `ScrollReveal`'s contract from Task 2 (`data-reveal` attribute → `.pf-in-view` class); does not import `ScrollReveal.tsx` directly.
- Produces: default export `PixelMascot` from `src/components/Portfolio/PixelMascot.tsx`, props `{ pose: Pose; side: Side }`, with `Pose` and `Side` also exported as named types:
  - `type Pose = "about" | "skills" | "experience" | "education" | "badges" | "projects" | "contact"`
  - `type Side = "left" | "right"`
  Consumed by Task 5 (one `<PixelMascot pose="…" side="…" />` per section).

- [ ] **Step 1: Create the component**

All 7 pose definitions below are ported directly from the poses approved in the design spec's visual-companion session (see the Appendix in `docs/superpowers/specs/2026-08-05-adaptive-pixel-cursor-design.md` for the original hex-colored mockup version) — same coordinates and angles, now using palette CSS variables instead of hardcoded hex.

```tsx
import type { CSSProperties } from "react";

type Pose = "about" | "skills" | "experience" | "education" | "badges" | "projects" | "contact";
type Side = "left" | "right";

const LINE = "var(--line)";
const INK = "var(--ink)";
const ACCENT = "var(--accent)";
const ACCENT2 = "var(--accent-2)";

// Container is 100 x 132. Head/body/legs are fixed anchor points shared by
// every pose so limbs always read as attached to the body regardless of angle.
const HEAD = { x: 50, y: 6, d: 26 };
const BODY = { x: 50, y: 28, w: 38, h: 46 };
const SHOULDER_L = { x: 27, y: 32 };
const SHOULDER_R = { x: 73, y: 32 };
const HIP_L = { x: 41, y: 70 };
const HIP_R = { x: 59, y: 70 };

function headBox(dx = 0, dy = 0): CSSProperties {
  return {
    position: "absolute", left: HEAD.x - HEAD.d / 2, top: HEAD.y, width: HEAD.d, height: HEAD.d,
    borderRadius: "50%", background: INK, border: `2px solid ${LINE}`,
    transform: dx || dy ? `translate(${dx}px, ${dy}px)` : undefined,
  };
}
function bodyBox(rotate = 0): CSSProperties {
  return {
    position: "absolute", left: BODY.x - BODY.w / 2, top: BODY.y, width: BODY.w, height: BODY.h,
    borderRadius: 9, background: ACCENT2, border: `2px solid ${LINE}`,
    transformOrigin: "50% 20%", transform: `rotate(${rotate}deg)`,
  };
}
// A limb rotates around its own top-center, which is pinned to the anchor —
// so it always stays visually attached to the body no matter the angle.
function limbBox(anchor: { x: number; y: number }, angleDeg: number, len = 20, w = 11, color = ACCENT2): CSSProperties {
  return {
    position: "absolute", left: anchor.x - w / 2, top: anchor.y, width: w, height: len,
    borderRadius: 4, background: color, border: `2px solid ${LINE}`,
    transformOrigin: "50% 0%", transform: `rotate(${angleDeg}deg)`,
  };
}
function legsBoxes(spread: number, bendL: number, bendR: number): CSSProperties[] {
  return [
    limbBox({ x: HIP_L.x - spread / 2, y: HIP_L.y }, bendL, 20, 12, ACCENT2),
    limbBox({ x: HIP_R.x + spread / 2, y: HIP_R.y }, bendR, 20, 12, ACCENT2),
  ];
}
function propRectBox(x: number, y: number, w: number, h: number, color = ACCENT, rotate = 0, radius = 2): CSSProperties {
  return {
    position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h,
    background: color, border: `2px solid ${LINE}`, borderRadius: radius,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
  };
}
function propCircleBox(x: number, y: number, d: number, color = ACCENT): CSSProperties {
  return {
    position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d,
    borderRadius: "50%", background: color, border: `2px solid ${LINE}`,
  };
}

const POSES: Record<Pose, CSSProperties[]> = {
  about: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, 6, 20, 11), limbBox(SHOULDER_R, 22, 18, 11),
    headBox(),
    propRectBox(84, 46, 12, 15, ACCENT, -8), // folder held out at side
  ],
  skills: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, -100, 16, 11), // bent bicep-flex arm
    limbBox(SHOULDER_R, 10, 18, 11),
    headBox(),
    propCircleBox(50, 2, 14, ACCENT), // gear/idea circle floating above head
    propRectBox(44, -3, 3, 8, ACCENT, 0, 1),
    propRectBox(56, -3, 3, 8, ACCENT, 0, 1), // gear teeth ticks
  ],
  experience: [
    bodyBox(-10), ...legsBoxes(10, -6, 4),
    limbBox(SHOULDER_L, 40, 20, 11),
    limbBox({ x: SHOULDER_R.x + 2, y: SHOULDER_R.y }, -30, 20, 11),
    headBox(-3, 0),
    propRectBox(80, 54, 22, 6, ACCENT, 42), // wrench, long thin rotated bar
  ],
  education: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, 8, 20, 11), limbBox(SHOULDER_R, 18, 18, 11),
    headBox(),
    propRectBox(50, 4, 30, 6, LINE, 0, 1),   // mortarboard flat top
    propRectBox(50, 8, 8, 8, ACCENT2, 0, 1), // mortarboard button/base
    propRectBox(64, 10, 2, 14, LINE, 12, 0), // tassel
    propRectBox(83, 48, 16, 11, ACCENT, 0),  // book held at side
  ],
  badges: [
    bodyBox(4), ...legsBoxes(10, 4, -2),
    limbBox({ x: SHOULDER_L.x - 2, y: SHOULDER_L.y }, -165, 22, 11), // arm raised straight up
    limbBox(SHOULDER_R, 14, 18, 11),
    headBox(),
    propRectBox(24, 8, 2, 20, ACCENT, 0, 0), // ribbon
    propCircleBox(24, 2, 14, ACCENT),        // medal held aloft
  ],
  projects: [
    bodyBox(-16), ...legsBoxes(8, -8, -8),
    limbBox({ x: SHOULDER_L.x + 4, y: SHOULDER_L.y - 2 }, 70, 18, 11),
    limbBox({ x: SHOULDER_R.x - 2, y: SHOULDER_R.y - 2 }, 55, 18, 11),
    headBox(-6, 2),
    propRectBox(58, 66, 26, 4, ACCENT2, 0, 1), // laptop base
    propRectBox(58, 56, 24, 16, ACCENT, 0, 2), // laptop screen, upright
  ],
  contact: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, -150, 20, 11), // waving arm raised near head
    limbBox(SHOULDER_R, 10, 18, 11),
    headBox(),
    propRectBox(82, 50, 15, 11, ACCENT, -6), // envelope body
    propRectBox(82, 46, 15, 6, LINE, -6, 0), // envelope flap sliver on top
  ],
};

interface PixelMascotProps {
  pose: Pose;
  side: Side;
}

const PixelMascot = ({ pose, side }: PixelMascotProps) => (
  <div className={`pf-mascot pf-mascot--${side}`} data-reveal aria-hidden="true">
    <div className="pf-mascot-figure">
      {POSES[pose].map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  </div>
);

export default PixelMascot;
export type { Pose, Side };
```

- [ ] **Step 2: Add mascot CSS**

In `src/styles/portfolio.css`, add (near the section rules, after the `#pf-contact::after` block):

```css
/* ---- Pixel-art section mascot ---- */
.pf-section-wrap { position: relative; }
.pf-mascot {
  display: none; position: absolute; top: clamp(2.5rem, 7vw, 5rem);
  width: 100px; height: 132px; opacity: 0; z-index: 2; pointer-events: none;
}
.pf-mascot--right { left: calc(50% + 560px + 12px); }
.pf-mascot--left { right: calc(50% + 560px + 12px); }
.pf-mascot-figure { position: relative; width: 100px; height: 132px; }
.pf-mascot.pf-in-view {
  opacity: 1;
  animation: pf-reveal-up .9s cubic-bezier(.16,1,.3,1) both;
}
@media (min-width: 1440px) {
  .pf-mascot { display: block; }
}
```

(`50% + 560px` = half the viewport plus half of `.pf-container`'s 1120px `max-width` — i.e. flush against the container's edge, plus a 12px gap. Hidden below 1440px because the container is already 1120px wide; anything narrower doesn't leave enough gutter for a 100px-wide mascot without crowding the content — this is a separate concern from the existing `@media (max-width: 760px)` content-stacking rule and gets its own breakpoint.)

- [ ] **Step 3: Verify build and lint**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect a clean production build. (Not wired into any page yet — visual verification happens in Task 5.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Portfolio/PixelMascot.tsx src/styles/portfolio.css
git commit -m "Add PixelMascot component with 7 approved poses

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Section typing animation

**Files:**
- Create: `src/components/Portfolio/SectionHeading.tsx`
- Modify: `src/styles/portfolio.css` (add typing/caret rules)

**Interfaces:**
- Consumes: `ScrollReveal`'s contract from Task 2 (`data-reveal` → `.pf-in-view`).
- Produces: default export `SectionHeading` from `src/components/Portfolio/SectionHeading.tsx`, props `{ tag: string; title: string }`. Renders the same DOM shape the 7 sections currently hand-write (`<div className="pf-section-head"><h2 className="pf-section-title">…</h2><span className="pf-tag">…</span></div>`), so no other CSS needs to change. Consumed by Task 5 (replaces the hand-written `.pf-section-head` block in all 7 sections).

- [ ] **Step 1: Create the component**

```tsx
import type { CSSProperties } from "react";

interface SectionHeadingProps {
  tag: string;
  title: string;
}

const CHAR_MS = 45; // typing speed, ms per character
const MIN_DURATION_S = 0.3;
const BLINK_COUNT = 6;

function typingStyle(text: string, delayS: number): CSSProperties {
  const durationS = Math.max(MIN_DURATION_S, (text.length * CHAR_MS) / 1000);
  const caretHideDelayS = delayS + durationS + 1;
  return {
    width: `${text.length}ch`,
    animationName: "pf-type-reveal, pf-caret-blink, pf-caret-hide",
    animationDuration: `${durationS}s, 1s, 0.01s`,
    animationTimingFunction: `steps(${text.length}), step-end, linear`,
    animationDelay: `${delayS}s, ${delayS}s, ${caretHideDelayS}s`,
    animationIterationCount: `1, ${BLINK_COUNT}, 1`,
    animationFillMode: "forwards, forwards, forwards",
  } as CSSProperties;
}

// Types the eyebrow tag first, then the title — a two-line terminal boot
// sequence rather than both lines typing simultaneously.
const SectionHeading = ({ tag, title }: SectionHeadingProps) => {
  const tagDurationS = Math.max(MIN_DURATION_S, (tag.length * CHAR_MS) / 1000);

  return (
    <div className="pf-section-head" data-reveal>
      <h2 className="pf-section-title">
        <span className="pf-type" style={typingStyle(title, tagDurationS + 0.15)}>{title}</span>
      </h2>
      <span className="pf-tag">
        <span className="pf-type" style={typingStyle(tag, 0)}>{tag}</span>
      </span>
    </div>
  );
};

export default SectionHeading;
```

- [ ] **Step 2: Add typing CSS**

In `src/styles/portfolio.css`, add (near the top, alongside the other `@keyframes` blocks):

```css
@keyframes pf-type-reveal { from { width: 0; } }
@keyframes pf-caret-blink { 0%, 100% { border-color: var(--accent); } 50% { border-color: transparent; } }
@keyframes pf-caret-hide { to { border-color: transparent; } }
```

And add (near the `.pf-eyebrow` rule):

```css
.pf-type {
  display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom;
  width: 0; border-right: 2px solid transparent;
  animation-play-state: paused;
}
.pf-in-view .pf-type { animation-play-state: running; }
```

(Before `.pf-in-view` is added, the element sits paused at its `from` keyframe frame — `width: 0` — so it's invisible pending reveal. `animation-play-state` is a separate longhand from the `animation-name`/`-duration`/etc. set inline per element in Step 1, so the two don't conflict. Under `prefers-reduced-motion: reduce`, the existing global `animation: none !important` rule strips the animation entirely, and the element falls back to its plain inline `width: Nch` — fully revealed immediately, never stuck at `width: 0`.)

- [ ] **Step 3: Verify build and lint**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect a clean production build. (Not wired into any page yet — visual verification happens in Task 5.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Portfolio/SectionHeading.tsx src/styles/portfolio.css
git commit -m "Add SectionHeading component with scroll-triggered typing animation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Wire mascots + typing headings into all 7 sections

**Files:**
- Modify: `src/components/Portfolio/About.tsx`
- Modify: `src/components/Portfolio/Skills.tsx`
- Modify: `src/components/Portfolio/Experience.tsx`
- Modify: `src/components/Portfolio/Education.tsx`
- Modify: `src/components/Portfolio/Badges.tsx`
- Modify: `src/components/Portfolio/Projects.tsx`
- Modify: `src/components/Contact/index.tsx`
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `PixelMascot` (Task 3), `SectionHeading` (Task 4), `ScrollReveal` (Task 2).
- Produces: nothing further consumed — this is the final integration task.

- [ ] **Step 1: Update `About.tsx`**

Replace the full contents of `src/components/Portfolio/About.tsx` with:

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

- [ ] **Step 2: Update `Skills.tsx`**

Replace the full contents of `src/components/Portfolio/Skills.tsx` with:

```tsx
import { skillGroups } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Skills = () => (
  <div className="pf-section-wrap">
    <section id="pf-skills" className="pf-section pf-container">
      <SectionHeading tag="02 // Loadout" title="Skills" />
      {skillGroups.map((group) => (
        <div className="pf-skill-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="pf-chip-row">
            {group.skills.map((skill) => (
              <span className="pf-chip pf-tilt" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
    <PixelMascot pose="skills" side="left" />
  </div>
);

export default Skills;
```

- [ ] **Step 3: Update `Experience.tsx`**

Replace the full contents of `src/components/Portfolio/Experience.tsx` with:

```tsx
import { timeline } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Experience = () => (
  <div className="pf-section-wrap">
    <section id="pf-experience" className="pf-section pf-container">
      <SectionHeading tag="03 // Service Log" title="Experience" />
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
    <PixelMascot pose="experience" side="right" />
  </div>
);

export default Experience;
```

- [ ] **Step 4: Update `Education.tsx`**

Replace the full contents of `src/components/Portfolio/Education.tsx` with:

```tsx
import { education } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Education = () => (
  <div className="pf-section-wrap">
    <section id="pf-education" className="pf-section pf-container">
      <SectionHeading tag="04 // Training Record" title="Education & Certifications" />
      <div className="pf-card-grid">
        {education.map((item) => (
          <div className="pf-card pf-tilt" key={item.title}>
            <span className="pf-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
    <PixelMascot pose="education" side="left" />
  </div>
);

export default Education;
```

- [ ] **Step 5: Update `Badges.tsx`**

Replace the full contents of `src/components/Portfolio/Badges.tsx` with:

```tsx
import Image from "next/image";
import { badges } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Badges = () => (
  <div className="pf-section-wrap">
    <section id="pf-badges" className="pf-section pf-container">
      <SectionHeading tag="05 // credly.com/users/abraham-landa" title="Badges" />
      <div className="pf-card-grid">
        {badges.map((badge) => (
          <div className="pf-card pf-badge-card pf-tilt" key={badge.title}>
            <Image className="pf-badge-img" src={badge.image} alt={`${badge.title} badge`} width={96} height={96} />
            <h3>{badge.title}</h3>
            <p>{badge.issuer}</p>
          </div>
        ))}
      </div>
      <a
        className="pf-btn pf-btn-ghost"
        style={{ marginTop: "1.5rem", width: "fit-content" }}
        href="https://www.credly.com/users/abraham-landa"
        target="_blank"
        rel="noopener"
      >
        View Credly Profile →
      </a>
    </section>
    <PixelMascot pose="badges" side="right" />
  </div>
);

export default Badges;
```

- [ ] **Step 6: Update `Projects.tsx`**

Replace the full contents of `src/components/Portfolio/Projects.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { projects } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Projects = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const carousel = carouselRef.current;
    const card = carousel?.querySelector<HTMLElement>(".pf-proj-card");
    if (!carousel || !card) return;
    carousel.scrollBy({ left: dir * (card.offsetWidth + 18), behavior: "smooth" });
  };

  return (
    <div className="pf-section-wrap">
      <section id="pf-projects" className="pf-section pf-container">
        <SectionHeading tag="06 // github.com/abrahamlanda10" title="Projects" />
        <div className="pf-carousel-wrap">
          <div className="pf-carousel" ref={carouselRef}>
            {projects.map((p) => (
              <article className="pf-proj-card pf-tilt" key={p.title}>
                <span className="pf-tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <div className="pf-stack">{p.stack}</div>
                <a href={p.href} target="_blank" rel="noopener">View repo →</a>
              </article>
            ))}
          </div>
          <div className="pf-carousel-nav">
            <button className="pf-nav-btn" aria-label="Previous project" onClick={() => scrollByCard(-1)}>‹</button>
            <button className="pf-nav-btn" aria-label="Next project" onClick={() => scrollByCard(1)}>›</button>
          </div>
        </div>
      </section>
      <PixelMascot pose="projects" side="left" />
    </div>
  );
};

export default Projects;
```

- [ ] **Step 7: Update `Contact/index.tsx`**

In `src/components/Contact/index.tsx`:

1. Add these two imports alongside the existing ones:

```tsx
import PixelMascot from "@/components/Portfolio/PixelMascot";
import SectionHeading from "@/components/Portfolio/SectionHeading";
```

2. Replace the `return (...)` block (from `return (` through the closing `);` before `};`) with:

```tsx
  return (
    <div className="pf-section-wrap">
      <section id="pf-contact" className="pf-section pf-container">
        <SectionHeading tag="07 // Comms" title="Let's Connect" />

        <form onSubmit={handleSubmit} className="pf-contact-box">
          <p className="pf-form-note" style={{ marginBottom: "1rem" }}>
            Just your name, email, and what&apos;s on your mind.
          </p>

          <div className="pf-field">
            <label htmlFor="name">Name</label>
            <input
              onChange={handleChange}
              value={data.name}
              name="name"
              id="name"
              type="text"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              value={data.email}
              name="email"
              id="email"
              type="email"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="message">Message</label>
            <textarea
              onChange={handleChange}
              value={data.message}
              name="message"
              id="message"
              rows={5}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="pf-btn pf-btn-solid" style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Sending..." : "Send Message"}
          </button>
          <p className="pf-form-note">Message goes straight to my inbox via a secure server-side integration — no key ever touches the browser.</p>
        </form>
      </section>
      <PixelMascot pose="contact" side="right" />
    </div>
  );
```

- [ ] **Step 8: Mount `ScrollReveal` in `page.tsx`**

In `src/app/(site)/page.tsx`, add the import:

```tsx
import ScrollReveal from "@/components/Portfolio/ScrollReveal";
```

And add `<ScrollReveal />` immediately after `<CursorFX />`:

```tsx
    <PaletteProvider>
      <Hud />
      <CursorFX />
      <ScrollReveal />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Badges />
      <Projects />
      <Contact />
      <PortfolioFooter />
    </PaletteProvider>
```

- [ ] **Step 9: Verify build and lint**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect a clean production build.

- [ ] **Step 10: Manual verification**

Run: `npm run dev`, open the portfolio homepage at a viewport ≥1440px wide.

- Every section below the hero (About, Skills, Experience, Education, Badges, Projects, Contact) shows its mascot in the correct pose, alternating sides (About right, Skills left, Experience right, Education left, Badges right, Projects left, Contact right).
- Scroll slowly from the top: each section's eyebrow tag types out, then its title types out, then its mascot rises in — the first time that section enters the viewport.
- Scroll back up past a section you already saw, then back down again — nothing retypes or re-animates (it stays in its revealed state).
- Resize the window below 1440px — mascots disappear; typing/heading layout is unaffected.
- Resize below 760px — existing mobile layout (stat grid, HUD wrap) still works as before.
- In DevTools, emulate `prefers-reduced-motion: reduce`, hard-reload — every section heading shows its full text immediately (no stuck-at-`width:0`/blank headings) and every mascot is visible immediately (not stuck at `opacity:0`), with no animation.
- Confirm `/docs` and `/pricing` (or any non-portfolio route) are completely unaffected.

- [ ] **Step 11: Commit**

```bash
git add src/components/Portfolio/About.tsx src/components/Portfolio/Skills.tsx \
  src/components/Portfolio/Experience.tsx src/components/Portfolio/Education.tsx \
  src/components/Portfolio/Badges.tsx src/components/Portfolio/Projects.tsx \
  src/components/Contact/index.tsx src/app/\(site\)/page.tsx
git commit -m "Wire pixel mascots and typing headings into all portfolio sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
