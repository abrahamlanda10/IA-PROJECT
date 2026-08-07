import Link from "next/link";
import { badges, contactEmail, education, projects, skillGroups, stats, summary, timeline } from "@/data/portfolioData";

const Resume = () => (
  <>
    <header className="pf-resume-head pf-container">
      <span className="pf-eyebrow">Field Dossier · Full Résumé</span>
      <h1>Abraham Landa</h1>
      <div className="pf-hero-role">Software Developer — Front-End Focus, Building Toward Full-Stack</div>

      <div className="pf-resume-contact">
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        <a href="https://github.com/abrahamlanda10" target="_blank" rel="noopener">
          github.com/abrahamlanda10
        </a>
      </div>

      <div className="pf-resume-actions">
        <a className="pf-btn pf-btn-solid" href="/resume.pdf" download>
          Download PDF
        </a>
        <Link className="pf-btn pf-btn-ghost" href="/">
          ← Back to Portfolio
        </Link>
      </div>
    </header>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Summary</h2>
        <span className="pf-tag">01 // Summary</span>
      </div>
      <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>{summary}</p>
      <div className="pf-stat-strip">
        {stats.map((s) => (
          <div className="pf-stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Skills</h2>
        <span className="pf-tag">02 // Loadout</span>
      </div>
      {skillGroups.map((group) => (
        <div className="pf-skill-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="pf-chip-row">
            {group.skills.map((skill) => (
              <span className="pf-chip" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Experience</h2>
        <span className="pf-tag">03 // Service Log</span>
      </div>
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

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Education</h2>
        <span className="pf-tag">04 // Training Record</span>
      </div>
      <div className="pf-card-grid">
        {education.map((item) => (
          <div className="pf-card" key={item.title}>
            <span className="pf-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Certifications</h2>
        <span className="pf-tag">05 // Badges</span>
      </div>
      <div className="pf-card-grid">
        {badges.map((badge) => (
          <div className="pf-card" key={badge.title}>
            <span className="pf-tag">{badge.issuer}</span>
            <h3>{badge.title}</h3>
          </div>
        ))}
      </div>
    </section>

    <section className="pf-section pf-container">
      <div className="pf-section-head">
        <h2 className="pf-section-title">Projects</h2>
        <span className="pf-tag">06 // github.com/abrahamlanda10</span>
      </div>
      <div className="pf-card-grid">
        {projects.map((project) => (
          <article className="pf-proj-card" key={project.title}>
            <span className="pf-tag">{project.tag}</span>
            <h3>{project.title}</h3>
            <p>{project.body}</p>
            <div className="pf-stack">{project.stack}</div>
            <a href={project.href} target="_blank" rel="noopener">
              View repo →
            </a>
          </article>
        ))}
      </div>
    </section>
  </>
);

export default Resume;
