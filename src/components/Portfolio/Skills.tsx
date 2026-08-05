import { skillGroups } from "@/data/portfolioData";

const Skills = () => (
  <section id="pf-skills" className="pf-section pf-container">
    <div className="pf-section-head">
      <h2 className="pf-section-title">Skills</h2>
      <span className="pf-tag">02 // Loadout</span>
    </div>
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
);

export default Skills;
