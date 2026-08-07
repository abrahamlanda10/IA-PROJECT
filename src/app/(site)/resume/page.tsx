import CursorFX from "@/components/Portfolio/CursorFX";
import Hud from "@/components/Portfolio/Hud";
import { PaletteProvider } from "@/components/Portfolio/PaletteContext";
import PortfolioFooter from "@/components/Portfolio/PortfolioFooter";
import Resume from "@/components/Portfolio/Resume";
import "@/styles/portfolio.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abraham Landa — Résumé",
  description: "Full résumé for Abraham Landa, a software developer transitioning from military vehicle maintenance to full-stack development.",
};

export default function ResumePage() {
  return (
    <PaletteProvider>
      <Hud />
      <CursorFX />
      <Resume />
      <PortfolioFooter />
    </PaletteProvider>
  );
}
