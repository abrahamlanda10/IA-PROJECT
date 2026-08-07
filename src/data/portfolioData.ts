export type PaletteId = "olive" | "night" | "motorpool" | "arcade" | "paper";

export interface Palette {
  id: PaletteId;
  label: string;
  swBg: string;
  swAccent: string;
}

// Five palettes, one shared "field dossier meets arcade cabinet" design system.
// Only the color tokens change between them — see #pf-root[data-palette] in portfolio.css.
export const palettes: Palette[] = [
  { id: "olive", label: "Olive Drab, Amber CRT", swBg: "#14170f", swAccent: "#ffb000" },
  { id: "night", label: "Night Ops, Cyan HUD", swBg: "#060a10", swAccent: "#35e6d0" },
  { id: "motorpool", label: "Motor Pool, Signal Orange", swBg: "#211f1d", swAccent: "#ff6a1a" },
  { id: "arcade", label: "Arcade Violet, Magenta Marquee", swBg: "#0c0616", swAccent: "#ff2ec4" },
  { id: "paper", label: "Field Manual, Paper", swBg: "#f3ede0", swAccent: "#2f5233" },
];

export const skillGroups = [
  {
    title: "Core Development",
    skills: ["HTML5", "CSS3", "JavaScript (ES6+)", "Responsive Web Design", "Front-End Development", "Debugging & Error Handling"],
  },
  {
    title: "Tools & Concepts",
    skills: ["Git & GitHub", "IoT Fundamentals", "Layout & Usability", "Code Maintenance"],
  },
  {
    title: "Field-Tested Soft Skills",
    skills: ["Root-Cause Analysis", "Team Collaboration", "Adaptability", "Time Management", "Continuous Learning"],
  },
];

export const stats = [
  { value: "3+", label: "Years military maintenance" },
  { value: "2026", label: "Two dev certifications earned" },
  { value: "NATO", label: "Medal, Poland deployment" },
  { value: "EN / ES", label: "Bilingual" },
];

export const timeline = [
  {
    date: "Sept 2023 — Present",
    title: "Vehicle Maintenance Technician, Fleet Maintenance Facility — Fort Hood",
    body: "Enlisted in the U.S. Army; completed Basic Combat Training and Advanced Individual Training as a 91B Wheeled Vehicle Mechanic. Maintained and repaired mission-critical wheeled vehicles, sustaining operational readiness in high-tempo environments.",
  },
  {
    date: "2024 — 2025",
    title: "NATO Enhanced Vigilance Activities — Poland",
    body: "Supported multinational maintenance and operations overseas; awarded the NATO Medal. Continued service as a Wheeled Vehicle Mechanic (91B).",
  },
  {
    date: "2026",
    title: "Transition to Software Development",
    body: "Earned Certified HTML/CSS Web Designer and Certified JavaScript Professional Developer credentials while continuing service — building portfolio projects toward a full-stack career.",
  },
];

export const education = [
  { tag: "Era Solutions Academy · 2026", title: "Certified JavaScript Professional Developer", body: "Fort Hood" },
  { tag: "Era Solutions Academy · 2026", title: "Certified HTML/CSS Web Designer", body: "Fort Hood" },
  { tag: "Army Ordnance School · 2023", title: "EPA Section 609 Certification", body: "Fort Gregg-Adams" },
  { tag: "COBAEM 05 · 2019–2022", title: "High School Diploma", body: "Morelos, Mexico" },
];

export const badges = [
  {
    title: "JavaScript Professional Developer",
    issuer: "Coalition of Information Technology Businesses (COITB)",
    image: "/images/badges/js-professional-developer.png",
  },
  {
    title: "HTML-CSS Web Designer",
    issuer: "Coalition of Information Technology Businesses (COITB)",
    image: "/images/badges/html-css-web-designer.png",
  },
];

export const projects = [
  {
    tag: "01 · TypeScript",
    title: "IA-PROJECT",
    body: "This portfolio's own codebase — an OpenAI + Next.js SaaS starter kit, refactored into a personal developer portfolio.",
    stack: "Next.js · TypeScript · Tailwind CSS",
    href: "https://github.com/abrahamlanda10/IA-PROJECT",
  },
  {
    tag: "02 · HTML / CSS / JS",
    title: "Barber-Shop-Website",
    body: "A functional barber-shop business site built as a JavaScript course project, practicing core front-end fundamentals.",
    stack: "HTML5 · CSS3 · JavaScript",
    href: "https://github.com/abrahamlanda10/Barber-Shop-Website",
  },
  {
    tag: "03 · Vue.js",
    title: "The-Beans-Place",
    body: "A student-version café/coffee-shop site template, built with Vue.js and Vite.",
    stack: "Vue.js · Vite",
    href: "https://github.com/abrahamlanda10/The-Beans-Place",
  },
];

// Shared with both the homepage's About section and the /resume page, so
// the two can't drift out of sync.
export const summary =
  "3+ years of preventive maintenance, diagnostics, and repair on military wheeled vehicles and equipment — sustaining mission readiness while supporting NATO operations in Poland. Now transitioning to full-stack development: certified in HTML/CSS and JavaScript (ES6+), building projects on GitHub, and bringing the same root-cause-analysis discipline to debugging code as to diagnosing engines. Bilingual, adaptable, and used to working under pressure in high-tempo environments.";

// Already the recipient address for the contact form (src/app/api/contact/route.ts) —
// surfaced here too since a résumé needs a visible "how do I reach you" line.
export const contactEmail = "abrahamlanda10@gmail.com";

// Routes that are self-contained portfolio pages (own Hud/PortfolioFooter,
// no generic site Header/Footer). Header and Footer both check this list.
export const portfolioRoutes = ["/", "/resume"];
