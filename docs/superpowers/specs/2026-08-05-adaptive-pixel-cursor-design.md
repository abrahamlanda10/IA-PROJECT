# Adaptive Pixel Cursor — Design

**Date:** 2026-08-05
**Scope:** Portfolio homepage only (`#pf-root`, mounted in `src/app/(site)/page.tsx`). No other route is affected.

## Problem

The portfolio's cursor FX (`src/components/Portfolio/CursorFX.tsx`) currently draws a soft radial glow and a trailing spark of fading pixel-dots as the mouse moves. The user asked for a "pixel shadow" attached to the cursor whose color changes depending on the background it's over — i.e. a cursor accessory with live, per-pixel contrast, not a fixed accent color.

## Decisions

These were confirmed with the user before writing this spec:

1. **Replace the OS arrow with a custom pixel cursor** (not an addition alongside the native arrow).
2. **Contrast is computed live via CSS blend mode**, not by detecting section/palette boundaries in JS.
3. **Replace both existing effects** — the soft radial glow and the trailing pixel-dot spark are removed; the new cursor is the only cursor FX.
4. **The cursor reacts on hover** of interactive elements (grows, shadow offset increases).

## Visual & interaction spec

- **Core**: 10×10px solid square, `background: var(--accent)`, topmost layer. Carries the current palette's accent color so the cursor still reads as themed, not just an inverted blob.
- **Shadow**: 10×10px solid white square, positioned directly behind the core and offset `translate(4px, 4px)`, with `mix-blend-mode: difference`. No blur, no border-radius — matches the hard-pixel language already used by `.pf-pixel-dot` (5×5 solid squares) and the offset `drop-shadow()` stacks on `.pf-card`/`.pf-chip`.
  - Why `difference` against pure white: for any background channel value `b`, `difference(b, 255) = 255 − b` — a full color invert, computed by the compositor per-pixel, live, with no JS color sampling. It's dark over light backgrounds (e.g. the "paper" palette), light over dark ones, and shifts continuously crossing the hero video, images, or accent-colored chips.
- **Hover state**: a delegated listener over `#pf-root` watches for `mouseover`/`mouseout` on `a, button, [role="button"], input, textarea, select, .pf-swatch, .pf-tilt`. While the pointer is over a match, a `.pf-pixel-cursor--active` modifier is applied to the cursor wrapper:
  - core scales to `1.5×`
  - shadow offset grows to `translate(7px, 7px)`
  - This echoes the existing card-hover "lift" pattern (`translate(-3px,-3px)` + bigger drop-shadow) already in `portfolio.css`.
- The native OS cursor is hidden only while the effect is actually mounted (see Edge cases), scoped to `#pf-root[data-cursor-fx="on"]` and its descendants — never globally, and never on routes outside the portfolio.

## Technical approach

### `src/components/Portfolio/CursorFX.tsx`

- Remove: the `glowRef`/glow opacity logic, and the `pf-pixel-dot` spawn-on-interval code in `onMouseMove`.
- Add: a wrapper `<div className="pf-pixel-cursor" ref={cursorRef}>` containing two child `<span>`s, `pf-pixel-cursor-shadow` and `pf-pixel-cursor-core`. Positioned via the same rAF-throttled `transform: translate(x,y)` pattern already used for the glow — no new performance cost, same coalescing-to-one-frame behavior.
- Add: a delegated `mouseover`/`mouseout` pair on `root` that toggles `pf-pixel-cursor--active` on the wrapper when `event.target` (or an ancestor via `.closest()`) matches the interactive selector list above.
- Unchanged: the ambient hue-cycle interval, the `.pf-tilt` 3D-tilt handlers, and the `--pf-mx`/`--pf-my` parallax property updates.
- Mount gating: the effect now early-returns (skipping the whole mount, exactly like the existing `prefers-reduced-motion: reduce` check) when `window.matchMedia('(pointer: fine)').matches` is false, in addition to the existing reduced-motion check. On successful mount, set `root.dataset.cursorFx = "on"`; clear it in the cleanup function.

### `src/styles/portfolio.css`

- Remove the `.pf-cursor-glow` and `.pf-pixel-dot` rule blocks.
- Add rules for `.pf-pixel-cursor` (fixed, top:0/left:0, pointer-events:none, high z-index, small rAF-driven `transition: transform .07s linear` to match the existing glide feel), `.pf-pixel-cursor-core`, `.pf-pixel-cursor-shadow` (as specced above, each with a `.15s cubic-bezier(.2,.8,.2,1)` transition on `transform` for the hover grow/offset, matching the easing already used for `.pf-card:hover`), and the `--active` modifier's scale/offset values.
- Add `#pf-root[data-cursor-fx="on"], #pf-root[data-cursor-fx="on"] * { cursor: none; }`, scoped so it only takes effect once JS has actually mounted the custom cursor.

## Edge cases

- **`prefers-reduced-motion: reduce`**: effect never mounts (same early-return as today) → `data-cursor-fx` is never set → native arrow stays visible, untouched.
- **Touch / coarse pointers**: gated on `(pointer: fine)` — touchscreens never lose a cursor they don't have, and never pay the listener/rAF cost.
- **Keyboard navigation**: unaffected. This only changes mouse-driven visuals; native focus rings (`:focus-visible` rules already in `portfolio.css`) are untouched.
- **Routes outside the portfolio** (Docs, Pricing, AI Examples, Auth): unaffected — `CursorFX` is only mounted in `src/app/(site)/page.tsx`, and all new CSS is scoped under `#pf-root`.

## Testing / verification

- Manual check in the running app:
  - Cursor renders and tracks smoothly on the portfolio page.
  - Shadow visibly inverts color crossing light vs. dark sections and the "paper" palette swatch.
  - Hover growth triggers correctly on nav links, buttons, and palette swatches.
  - Native arrow is untouched outside `#pf-root` (e.g. `/docs`, `/pricing`).
- Verify with `prefers-reduced-motion: reduce` simulated (DevTools rendering emulation) and with a touch-emulated viewport: native arrow remains in both cases.

## Out of scope

- No changes to the hue-cycle, tilt, or parallax effects already in `CursorFX.tsx`.
- No JS-based background-color sampling (canvas capture, etc.) — the blend-mode approach is intentionally the whole mechanism.
- No changes to any route other than the portfolio homepage.
