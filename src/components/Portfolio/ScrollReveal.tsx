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
