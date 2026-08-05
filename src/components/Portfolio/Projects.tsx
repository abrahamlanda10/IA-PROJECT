"use client";

import { useRef } from "react";
import { projects } from "@/data/portfolioData";

const Projects = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const carousel = carouselRef.current;
    const card = carousel?.querySelector<HTMLElement>(".pf-proj-card");
    if (!carousel || !card) return;
    carousel.scrollBy({ left: dir * (card.offsetWidth + 18), behavior: "smooth" });
  };

  return (
    <section id="pf-projects" className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Projects</h2>
        <span className="pf-tag">06 // github.com/abrahamlanda10</span>
      </div>
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
  );
};

export default Projects;
