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
