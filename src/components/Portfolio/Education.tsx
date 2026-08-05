import { education } from "@/data/portfolioData";

const Education = () => (
  <section id="pf-education" className="pf-section pf-container">
    <div className="pf-section-head">
      <h2 className="pf-section-title">Education &amp; Certifications</h2>
      <span className="pf-tag">04 // Training Record</span>
    </div>
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
);

export default Education;
