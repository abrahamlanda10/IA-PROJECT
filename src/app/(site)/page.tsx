import About from "@/components/Portfolio/About";
import Badges from "@/components/Portfolio/Badges";
import Contact from "@/components/Contact";
import CursorFX from "@/components/Portfolio/CursorFX";
import Education from "@/components/Portfolio/Education";
import Experience from "@/components/Portfolio/Experience";
import Hero from "@/components/Portfolio/Hero";
import Hud from "@/components/Portfolio/Hud";
import { PaletteProvider } from "@/components/Portfolio/PaletteContext";
import PortfolioFooter from "@/components/Portfolio/PortfolioFooter";
import Projects from "@/components/Portfolio/Projects";
import Skills from "@/components/Portfolio/Skills";
import "@/styles/portfolio.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abraham Landa — Software Developer",
  description: "Portfolio of Abraham Landa, a software developer transitioning from military vehicle maintenance to full-stack development.",
};

export default function Home() {
  return (
    <PaletteProvider>
      <Hud />
      <CursorFX />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Badges />
      <Projects />
      <Contact />
      <PortfolioFooter />
    </PaletteProvider>
  );
}
