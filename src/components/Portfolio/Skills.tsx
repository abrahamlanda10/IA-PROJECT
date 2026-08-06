import { skillGroups } from "@/data/portfolioData";
import PixelMascot from "./PixelMascot";
import SectionHeading from "./SectionHeading";

const Skills = () => (
  <div className="pf-section-wrap">
    <section id="pf-skills" className="pf-section pf-container">
      <SectionHeading tag="02 // Loadout" title="Skills" />
      {skillGroups.map((group) => (
        <div className="pf-skill-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="pf-chip-row">
            {group.skills.map((skill) => (
              <span className="pf-chip pf-tilt" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
    <PixelMascot pose="skills" side="left" />
  </div>
);

export default Skills;
