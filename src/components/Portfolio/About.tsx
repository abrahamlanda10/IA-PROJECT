import { stats, summary } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const About = () => (
  <div className="pf-section-wrap">
    <section id="pf-about" className="pf-section pf-container">
      <SectionHeading tag="01 // Summary" title="About" />
      <div className="pf-about-grid">
        <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>{summary}</p>
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
