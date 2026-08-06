import { timeline } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Experience = () => (
  <div className="pf-section-wrap">
    <section id="pf-experience" className="pf-section pf-container">
      <SectionHeading tag="03 // Service Log" title="Experience" />
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
    <PixelMascot pose="experience" side="right" />
  </div>
);

export default Experience;
