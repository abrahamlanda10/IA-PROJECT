import Image from "next/image";
import { badges } from "@/data/portfolioData";

const Badges = () => (
  <section id="pf-badges" className="pf-section pf-container">
    <div className="pf-section-head">
      <h2 className="pf-section-title">Badges</h2>
      <span className="pf-tag">05 // credly.com/users/abraham-landa</span>
    </div>
    <div className="pf-card-grid">
      {badges.map((badge) => (
        <div className="pf-card pf-badge-card pf-tilt" key={badge.title}>
          <Image className="pf-badge-img" src={badge.image} alt={`${badge.title} badge`} width={96} height={96} />
          <h3>{badge.title}</h3>
          <p>{badge.issuer}</p>
        </div>
      ))}
    </div>
    <a
      className="pf-btn pf-btn-ghost"
      style={{ marginTop: "1.5rem", width: "fit-content" }}
      href="https://www.credly.com/users/abraham-landa"
      target="_blank"
      rel="noopener"
    >
      View Credly Profile →
    </a>
  </section>
);

export default Badges;
