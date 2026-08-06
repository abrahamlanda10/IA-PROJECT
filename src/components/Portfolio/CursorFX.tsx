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
