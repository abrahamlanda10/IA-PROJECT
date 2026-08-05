# Portfolio Interaction Pass — Design

**Date:** 2026-08-05
**Scope:** Portfolio homepage only (`#pf-root`, mounted in `src/app/(site)/page.tsx`). No other route is affected. Three independent features, each buildable/testable on its own:

1. Adaptive pixel cursor (revision of the original cursor-only spec)
2. Pixel-art section mascot
3. Section typing animation

They share one small piece of infrastructure (see "Shared: scroll-reveal utility" below).

---

## 1. Adaptive Pixel Cursor

### Problem

`src/components/Portfolio/CursorFX.tsx` currently draws a soft radial glow and a trailing spark of fading pixel-dots. The user wants a "pixel shadow" attached to the cursor whose color changes with the background.

### Decisions

1. Replace the OS arrow with a custom pixel cursor (not an addition alongside the native arrow).
2. **Contrast is driven by the active color palette**, not live per-pixel blend-mode sampling (superseding the original `mix-blend-mode: difference` approach). The shadow reuses `var(--line)` — the same token that already drives the "long shadow" on `.pf-card`/`.pf-proj-card`/`.pf-contact-box` — so the cursor shadow automatically matches the rest of the page's shadow language in every one of the 5 palettes, and updates the moment the palette swatch changes.
3. Replace both existing effects — the soft radial glow and the trailing pixel-dot spark are removed; the new cursor is the only cursor FX.
4. The cursor reacts on hover of interactive elements (grows, shadow offset increases).

### Visual & interaction spec

- **Core**: 10×10px solid square, `background: var(--accent)`, topmost layer.
- **Shadow**: 10×10px solid square, `background: var(--line)`, positioned directly behind the core and offset `translate(4px, 4px)`. No blur, no border-radius, no blend mode — a plain palette-colored offset block, matching the hard-pixel language already used by `.pf-pixel-dot` (5×5 solid squares) and the offset `drop-shadow()` stacks on `.pf-card`/`.pf-chip`.
- **Hover state**: a delegated listener over `#pf-root` watches `mouseover`/`mouseout` on `a, button, [role="button"], input, textarea, select, .pf-swatch, .pf-tilt`. While the pointer is over a match, `.pf-pixel-cursor--active` is applied to the cursor wrapper:
  - core scales to `1.5×`
  - shadow offset grows to `translate(7px, 7px)`
  - Echoes the existing card-hover "lift" pattern (`translate(-3px,-3px)` + bigger drop-shadow) already in `portfolio.css`.
- The native OS cursor is hidden only while the effect is actually mounted (see Edge cases), scoped to `#pf-root[data-cursor-fx="on"]` and its descendants — never globally, never outside the portfolio.

### Technical approach

**`src/components/Portfolio/CursorFX.tsx`**
- Remove the `glowRef`/glow opacity logic and the `pf-pixel-dot` spawn-on-interval code in `onMouseMove`.
- Add a wrapper `<div className="pf-pixel-cursor" ref={cursorRef}>` containing two child `<span>`s, `pf-pixel-cursor-shadow` and `pf-pixel-cursor-core`. Positioned via the same rAF-throttled `transform: translate(x,y)` pattern already used for the glow.
- Add a delegated `mouseover`/`mouseout` pair on `root` toggling `pf-pixel-cursor--active` on the wrapper when `event.target` (or an ancestor via `.closest()`) matches the interactive selector list above.
- Unchanged: ambient hue-cycle interval, `.pf-tilt` handlers, `--pf-mx`/`--pf-my` parallax updates.
- Mount gating: early-return (skip mount entirely) when `window.matchMedia('(pointer: fine)').matches` is false, in addition to the existing reduced-motion check. On successful mount, set `root.dataset.cursorFx = "on"`; clear it in cleanup.

**`src/styles/portfolio.css`**
- Remove `.pf-cursor-glow` and `.pf-pixel-dot` rule blocks.
- Add `.pf-pixel-cursor` (fixed, top:0/left:0, pointer-events:none, high z-index, `transition: transform .07s linear`), `.pf-pixel-cursor-core`, `.pf-pixel-cursor-shadow` (as specced above, `.15s cubic-bezier(.2,.8,.2,1)` transition on `transform` for hover grow/offset), and the `--active` modifier's scale/offset values.
- Add `#pf-root[data-cursor-fx="on"], #pf-root[data-cursor-fx="on"] * { cursor: none; }`.

### Edge cases

- **`prefers-reduced-motion: reduce`**: effect never mounts → native arrow stays visible.
- **Touch / coarse pointers**: gated on `(pointer: fine)`.
- **Keyboard navigation**: unaffected — native focus rings untouched.
- **Routes outside the portfolio**: unaffected — scoped to `#pf-root` / only mounted on the homepage.

---

## 2. Pixel-Art Section Mascot

### Problem

Add a recurring pixel-art character beside every section below the hero (About, Skills, Experience, Education, Badges, Projects, Contact), each shown in a pose relevant to that section.

### Decisions (confirmed via the visual companion — see mockups below)

1. **Style: "Geometric hybrid"** — built from plain CSS shapes (circle head, rounded-rect body/limbs, small rect/circle props), not a fine pixel grid. Chosen over a chunky 8-bit grid and a detailed shaded sprite after comparing all three live.
2. **Fully distinct pose per section** (not one body with a swapped prop) — explicitly chosen despite the larger art surface, because the geometric style keeps each pose cheap to build (a handful of divs with rotation/position values, not a hand-placed pixel grid).
3. **Alternates sides** down the page (e.g. About right, Skills left, Experience right, Education left, Badges right, Projects left, Contact right).
4. **Pinned near the section heading** (top of section, beside the eyebrow/title) — not sticky/scroll-following.
5. **Hidden below a width breakpoint** where there's no side gutter to put it in (see Technical approach).
6. All colors come from the current palette's tokens (`--ink`, `--accent`, `--accent-2`, `--line`), so the mascot re-themes automatically when the palette swatch changes — same mechanism as every other themed element on the page.

### Visual spec

All 7 poses share one fixed anchor geometry so they read as the same recurring character:

- Head: 26px circle, `background: var(--ink)`, `border: 2px solid var(--line)`
- Body: 38×46px rounded rect, `background: var(--accent-2)`, `border: 2px solid var(--line))`, `border-radius: 9px`
- Limbs (arms/legs): 11–12px-wide rounded rects, `background: var(--accent-2)`, `border: 2px solid var(--line)`, each rotated around its **top-center anchor point** (shoulder/hip), so a limb always stays visually attached to the body regardless of its angle
- Props: small `var(--accent)`-filled rects/circles (folder, gear, wrench, mortarboard + book, medal + ribbon, laptop, envelope), bordered the same way

**Approved poses** (mocked up and approved in the visual companion session; the working mockup generator that produced the approved renders is preserved at `.superpowers/brainstorm/1490-1785972844/content/gen-poses-screen.js` in this repo and should be used as the source of truth for exact coordinates/angles when implementing — port its `head()`/`body()`/`limb()`/`propRect()`/`propCircle()` helpers and the 7 pose definitions directly rather than re-deriving them):

| Section | Pose |
|---|---|
| About | Standing, one arm extended holding a folder |
| Skills | Bicep-flex arm pose, small floating gear above the head |
| Experience | Leaning stance, holding a wrench at an angle |
| Education | Mortarboard cap on head, holding a book |
| Badges | Arm raised straight overhead holding a medal on a ribbon |
| Projects | Hunched forward over an open laptop shape |
| Contact | Waving arm raised near the head, holding an envelope |

### Technical approach

- New component `src/components/Portfolio/PixelMascot.tsx`: a small presentational component taking a `pose` prop (`"about" | "skills" | "experience" | "education" | "badges" | "projects" | "contact"`) and rendering the matching set of positioned `<div>`s (ported from the approved mockup generator) inside a fixed-size relative container. `aria-hidden="true"` — purely decorative.
- Each section component (`About.tsx`, `Skills.tsx`, etc.) renders one `<PixelMascot pose="…" side="left" | "right" />` positioned in the section's outer gutter, near the `.pf-section-head`.
- New CSS: `.pf-mascot` — `position: absolute`, placed in the horizontal gutter outside `.pf-container` (`left`/`right` per the `side` prop, using the existing `clamp()`-based side padding as a reference so it lines up with the container edge), vertically aligned near the top of the section.
- **Responsive**: `.pf-mascot { display: none; }` by default; shown only above a dedicated breakpoint (`@media (min-width: 1300px)`) — chosen because the content column is already `max-width: 1120px` (`.pf-container`), so anything narrower has no real gutter to place a ~100px-wide mascot in without crowding the content. This is a distinct concern from the existing `@media (max-width: 760px)` content-stacking breakpoint and gets its own rule.
- **Entrance animation**: reuses the existing `pf-reveal-up` keyframe, triggered by the shared scroll-reveal utility (below) — the mascot rises/fades in the first time its section scrolls into view, in sync with the section's heading typing out.

### Edge cases

- **`prefers-reduced-motion: reduce`**: the global rule at the bottom of `portfolio.css` (`#pf-root * { transition: none !important; animation: none !important; }`) already disables the entrance animation site-wide; the mascot simply appears without animating in.
- **Narrow viewports**: hidden entirely below 1300px width (see above) — no layout compromise attempted at small sizes.
- **Screen readers**: `aria-hidden="true"`, never in the tab order — decorative only.

---

## 3. Section Typing Animation

### Problem

Each section's eyebrow label + heading should type itself out, terminal/HUD-style, the first time the section scrolls into view.

### Decisions

1. Applies to the `.pf-eyebrow` + `.pf-section-title` pair in each section below the hero (Hero keeps its own existing `pf-reveal-up` stagger animation, unchanged).
2. Triggers once per page load, the first time each section scrolls into view — does not replay on scrolling away and back.
3. Mechanism: a CSS clip-reveal (`width: 0 → Nch` under `steps(N)`), not JS character-by-character text mutation — visually indistinguishable from a real typewriter in a monospace font, but the full text is present in the DOM the whole time (better for accessibility/SEO — nothing is ever "missing" from the accessibility tree, only the visual reveal is animated), and it composes cleanly with the existing reduced-motion killswitch.

### Technical approach

- Eyebrow and title text are wrapped in an inline-block span with `overflow: hidden; white-space: nowrap;`. Each instance sets two inline style values computed from its own text length (`text.length`), since CSS `steps()` needs a literal integer per element and the site's headings vary in length:
  - `width: '${text.length}ch'` (monospace-safe: 1 character cell per `ch` unit)
  - `animationTimingFunction: 'steps(${text.length})'`
  - `animationDuration` scaled per character (e.g. ~45ms/char, with a sane min/max clamp)
- A `.pf-type` CSS class defines the `width: 0 → var value` keyframe (`pf-type-reveal`) and a blinking caret via `::after` (`pf-caret-blink`, `border-right: 2px solid var(--accent)`), with the caret fading out (`animation-fill-mode: forwards`, delayed opacity-0 keyframe) a beat after typing finishes.
- The title's animation is delayed to start after the eyebrow's finishes (`animationDelay` = eyebrow's duration + a short pause), so the two lines type sequentially like a boot sequence rather than simultaneously.
- Animation only starts once the shared scroll-reveal utility marks the section `.pf-in-view` (see below) — before that, the element sits at `width: 0`.

### Edge cases

- **`prefers-reduced-motion: reduce`**: same global killswitch disables the animation; per the CSS, elements must still resolve to their final, fully-revealed state (not stuck at `width: 0`) when animations are suppressed — implementation must set the resting/final CSS state as the base and only animate `from`, not rely on the animation to reach the visible end state.
- **Screen readers**: unaffected — text content is present and unchanged throughout; only a visual clip is animated.

---

## Shared: scroll-reveal utility

Both the mascot's entrance animation and the typing trigger need to know "has this section scrolled into view yet, for the first time." Rather than two separate `IntersectionObserver`s:

- New component `src/components/Portfolio/ScrollReveal.tsx`, mounted once in `src/app/(site)/page.tsx` alongside `CursorFX`. On mount, it creates a single `IntersectionObserver` scoped to `#pf-root`, watching every element with a `data-reveal` attribute (each section's `.pf-section-head` and `.pf-mascot` wrapper carry it). The first time an observed element intersects, it gets `.pf-in-view` added and is unobserved (fires once, matching the "once per page load" decision for typing, and reused as-is for the mascot).
- No new dependency — plain `IntersectionObserver`, same pattern already used for the mount-gating checks (`matchMedia`) elsewhere in the codebase.

---

## Testing / verification (all three features)

- Manual check in the running app:
  - Cursor renders, tracks smoothly, and its shadow visibly changes color when switching palette swatches (not on live background crossing — that behavior was intentionally replaced).
  - Hover growth triggers on nav links, buttons, and palette swatches.
  - Each section below the hero shows its mascot in the correct pose, correct alternating side, only above the 1300px breakpoint.
  - Mascot entrance and the section's eyebrow/title typing both fire once, the first time each section scrolls into view, and do not replay on scrolling back up.
  - Native arrow, mascots, and typing are all absent/inert outside `#pf-root` (e.g. `/docs`, `/pricing`).
- Verify with `prefers-reduced-motion: reduce` simulated: cursor FX doesn't mount (native arrow shown), mascots appear without animating in, section headings render fully typed immediately (no stuck-at-`width:0` state).
- Verify with a touch-emulated / narrow viewport: cursor FX doesn't mount, mascots are hidden below 1300px width, typing animation still functions (it's independent of pointer type).

## Appendix: approved pose geometry (reference implementation)

The `.superpowers/` mockup directory is gitignored and not guaranteed to survive (cache cleanup, fresh clone, etc.), so the validated coordinates are captured here instead as the durable source of truth. This is the exact generator approved in the visual companion session, reproduced verbatim — **the coordinates, sizes, and rotation angles are the validated part; the literal hex colors below are mockup-only placeholders and must be replaced with the palette tokens** (`--line`, `--ink`, `--accent`, `--accent-2`) per the Visual spec above when porting this to `PixelMascot.tsx`/JSX.

```js
// Container is 100 x 132. Head/body/legs are fixed anchor points shared by
// every pose so limbs always read as attached to the body regardless of angle.
const HEAD = { x: 50, y: 6, d: 26 }; // circle: left = x - d/2
const BODY = { x: 50, y: 28, w: 38, h: 46 }; // rounded rect, centered on x
const SHOULDER_L = { x: 31 - 4, y: 32 };
const SHOULDER_R = { x: 69 + 4, y: 32 };
const HIP_L = { x: 41, y: 70 };
const HIP_R = { x: 59, y: 70 };

// head(): 26px circle at HEAD anchor. background: var(--ink); border: 2px solid var(--line).
// body(rotate): 38x46 rounded rect (radius 9px) at BODY anchor, transform-origin 50% 20%,
//   transform: rotate(${rotate}deg). background: var(--accent-2); border: 2px solid var(--line).
// limb(anchor, angleDeg, len=20, w=11, color=var(--accent-2)): rounded rect (radius 4px),
//   left = anchor.x - w/2, top = anchor.y, transform-origin 50% 0% (top-center = the anchor,
//   so it stays attached), transform: rotate(angleDeg).
// legs(spread, bendL, bendR): two limb() calls anchored at HIP_L/HIP_R ± spread/2, 20x12,
//   color var(--accent-2).
// propRect(x, y, w, h, color=var(--accent), rotate=0, radius=2): rect centered at (x,y),
//   border: 2px solid var(--line).
// propCircle(x, y, d, color=var(--accent)): circle centered at (x,y), border: 2px solid var(--line).

// ---- 7 poses ----
const about =
  body(0) + legs(8, 0, 0) +
  limb(SHOULDER_L, 6, 20, 11) + limb(SHOULDER_R, 22, 18, 11) +
  head() +
  propRect(84, 46, 12, 15, ACCENT, -8); // folder held out at side

const skills =
  body(0) + legs(8, 0, 0) +
  limb(SHOULDER_L, -100, 16, 11) + // bent bicep-flex arm
  limb(SHOULDER_R, 10, 18, 11) +
  head() +
  propCircle(50, 2, 14, ACCENT) + // gear/idea circle floating above head
  propRect(44, -3, 3, 8, ACCENT, 0, 1) + propRect(56, -3, 3, 8, ACCENT, 0, 1); // gear teeth ticks

const experience =
  body(-10) + legs(10, -6, 4) +
  limb(SHOULDER_L, 40, 20, 11) +
  limb({ x: SHOULDER_R.x + 2, y: SHOULDER_R.y }, -30, 20, 11) +
  head("transform:translateX(-3px);") +
  propRect(80, 54, 22, 6, ACCENT, 42); // wrench, long thin rotated bar

const education =
  body(0) + legs(8, 0, 0) +
  limb(SHOULDER_L, 8, 20, 11) + limb(SHOULDER_R, 18, 18, 11) +
  head() +
  propRect(50, 4, 30, 6, LINE, 0, 1) +  // mortarboard flat top
  propRect(50, 8, 8, 8, ACCENT2, 0, 1) + // mortarboard button/base
  propRect(64, 10, 2, 14, LINE, 12, 0) + // tassel
  propRect(83, 48, 16, 11, ACCENT, 0);   // book held at side

const badges =
  body(4) + legs(10, 4, -2) +
  limb({ x: SHOULDER_L.x - 2, y: SHOULDER_L.y }, -165, 22, 11) + // arm raised straight up
  limb(SHOULDER_R, 14, 18, 11) +
  head() +
  propRect(24, 8, 2, 20, ACCENT, 0, 0) + // ribbon
  propCircle(24, 2, 14, ACCENT);         // medal held aloft

const projects =
  body(-16) + legs(8, -8, -8) +
  limb({ x: SHOULDER_L.x + 4, y: SHOULDER_L.y - 2 }, 70, 18, 11) +
  limb({ x: SHOULDER_R.x - 2, y: SHOULDER_R.y - 2 }, 55, 18, 11) +
  head("transform:translate(-6px,2px);") +
  propRect(58, 66, 26, 4, ACCENT2, 0, 1) + // laptop base
  propRect(58, 56, 24, 16, ACCENT, 0, 2);  // laptop screen, upright

const contact =
  body(0) + legs(8, 0, 0) +
  limb(SHOULDER_L, -150, 20, 11) + // waving arm raised near head
  limb(SHOULDER_R, 10, 18, 11) +
  head() +
  propRect(82, 50, 15, 11, ACCENT, -6) + // envelope body
  propRect(82, 46, 15, 6, LINE, -6, 0);  // envelope flap sliver on top
```

## Out of scope

- No changes to the hue-cycle, tilt, or parallax effects already in `CursorFX.tsx`.
- No JS-based background-color sampling for the cursor shadow — palette tokens are the entire mechanism now.
- No mascot art beyond the 7 approved poses; no mobile/narrow-viewport layout for the mascot (hidden instead).
- No typing animation on the Hero section (keeps its existing reveal animation) or on body paragraphs — eyebrow + title only.
- No changes to any route other than the portfolio homepage.
