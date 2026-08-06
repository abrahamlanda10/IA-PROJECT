import Image from "next/image";
import { badges } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Badges = () => (
  <div className="pf-section-wrap">
    <section id="pf-badges" className="pf-section pf-container">
      <SectionHeading tag="05 // credly.com/users/abraham-landa" title="Badges" />
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
    <PixelMascot pose="badges" side="right" />
  </div>
);

export default Badges;
