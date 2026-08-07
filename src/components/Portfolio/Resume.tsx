import Link from "next/link";
import { contactEmail } from "@/data/portfolioData";

const Resume = () => (
  <>
    <header className="pf-resume-head pf-container">
      <span className="pf-eyebrow">Field Dossier · Full Résumé</span>
      <h1>Abraham Landa</h1>
      <div className="pf-hero-role">Software Developer — Front-End Focus, Building Toward Full-Stack</div>

      <div className="pf-resume-contact">
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        <a href="https://github.com/abrahamlanda10" target="_blank" rel="noopener">
          github.com/abrahamlanda10
        </a>
      </div>

      <div className="pf-resume-actions">
        <a className="pf-btn pf-btn-solid" href="/resume.pdf" download>
          Download PDF
        </a>
        <Link className="pf-btn pf-btn-ghost" href="/">
          ← Back to Portfolio
        </Link>
      </div>
    </header>
  </>
);

export default Resume;
