import { education } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Education = () => (
  <div className="pf-section-wrap">
    <section id="pf-education" className="pf-section pf-container">
      <SectionHeading tag="04 // Training Record" title="Education & Certifications" />
      <div className="pf-card-grid">
        {education.map((item) => (
          <div className="pf-card pf-tilt" key={item.title}>
            <span className="pf-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
    <PixelMascot pose="education" side="left" />
  </div>
);

export default Education;
