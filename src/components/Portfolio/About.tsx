import { stats } from "@/data/portfolioData";

const About = () => (
  <section id="pf-about" className="pf-section pf-container">
    <div className="pf-section-head">
      <h2 className="pf-section-title">About</h2>
      <span className="pf-tag">01 // Summary</span>
    </div>
    <div className="pf-about-grid">
      <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>
        3+ years of preventive maintenance, diagnostics, and repair on military wheeled vehicles and
        equipment — sustaining mission readiness while supporting NATO operations in Poland. Now
        transitioning to full-stack development: certified in HTML/CSS and JavaScript (ES6+), building
        projects on GitHub, and bringing the same root-cause-analysis discipline to debugging code as to
        diagnosing engines. Bilingual, adaptable, and used to working under pressure in high-tempo
        environments.
      </p>
      <div className="pf-stat-strip">
        {stats.map((s) => (
          <div className="pf-stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default About;
