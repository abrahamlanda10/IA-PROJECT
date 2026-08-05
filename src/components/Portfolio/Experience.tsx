import { timeline } from "@/data/portfolioData";

const Experience = () => (
  <section id="pf-experience" className="pf-section pf-container">
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
);

export default Experience;
