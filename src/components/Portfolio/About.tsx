import { stats } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const About = () => (
  <div className="pf-section-wrap">
    <section id="pf-about" className="pf-section pf-container">
      <SectionHeading tag="01 // Summary" title="About" />
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
    <PixelMascot pose="about" side="right" />
  </div>
);

export default About;
