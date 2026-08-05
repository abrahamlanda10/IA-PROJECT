"use client";

import { useEffect, useRef } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hero scroll reveal: video zooms OUT up to 15% as the hero scrolls away.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
        video.style.transform = `translateY(${progress * 60}px) scale(${1 - progress * 0.15})`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="pf-hero" ref={heroRef}>
      <div className="pf-hero-media">
        <video ref={videoRef} autoPlay muted loop playsInline src="/videos/hero-bg.mp4" />
      </div>
      <div className="pf-ambient-glow" aria-hidden="true" />
      <div className="pf-hero-scanlines" aria-hidden="true" />
      <div className="pf-hero-scrim" />

      <div className="pf-hero-content">
        <span className="pf-eyebrow">Field Dossier · MOS 91B → Full-Stack</span>
        <h1>Abraham Landa</h1>
        <div className="pf-hero-role">Software Developer — Front-End Focus, Building Toward Full-Stack</div>
        <p className="pf-hero-hook">
          Three years of systematic troubleshooting on military wheeled vehicles, now pointed at code —
          certified in HTML/CSS and JavaScript, shipping projects while training for a full-stack career.
        </p>
        <div className="pf-hero-actions">
          <a className="pf-btn pf-btn-solid" href="#pf-projects">View Projects</a>
          <a className="pf-btn pf-btn-ghost" href="#pf-contact">Get in Touch</a>
        </div>
      </div>
      <div className="pf-scroll-cue">SCROLL ▾</div>
    </section>
  );
};

export default Hero;
