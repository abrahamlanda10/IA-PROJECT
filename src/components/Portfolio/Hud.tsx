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
