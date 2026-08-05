"use client";

import { useEffect, useRef } from "react";

/**
 * Mounted once at the root of the portfolio. Handles the decorative,
 * non-essential interactions: a cursor-following glow that lightens the
 * arcade grids it passes over, a trailing spark of glowing pixels, a slow
 * ambient hue cycle, a subtle 3D tilt on `.pf-tilt` elements, and the
 * section-grid parallax push. All of it is skipped under reduced-motion.
 */
const CursorFX = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.getElementById("pf-root");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const glow = glowRef.current;
    let rafPending = false;
    let lastX = 0;
    let lastY = 0;
    let lastDot = 0;

    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          if (glow) {
            glow.style.transform = `translate(${lastX}px,${lastY}px)`;
            glow.style.opacity = ".85";
          }
          const mx = (lastX / window.innerWidth - 0.5) * 2;
          const my = (lastY / window.innerHeight - 0.5) * 2;
          root.style.setProperty("--pf-mx", mx.toFixed(3));
          root.style.setProperty("--pf-my", my.toFixed(3));
          rafPending = false;
        });
      }

      const now = Date.now();
      if (now - lastDot < 45) return;
      lastDot = now;
      const dot = document.createElement("div");
      dot.className = "pf-pixel-dot";
      dot.style.left = `${lastX - 2}px`;
      dot.style.top = `${lastY - 2}px`;
      root.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${Math.random() * 16 - 8}px,${Math.random() * 14 + 8}px) scale(0)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 650);
    };

    const onMouseLeave = () => {
      if (glow) glow.style.opacity = "0";
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

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
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.clearInterval(hueInterval);
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return <div className="pf-cursor-glow" ref={glowRef} aria-hidden="true" />;
};

export default CursorFX;
