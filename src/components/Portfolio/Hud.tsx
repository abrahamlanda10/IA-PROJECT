"use client";

import Image from "next/image";
import { palettes } from "@/data/portfolioData";
import { usePalette } from "./PaletteContext";

const Hud = () => {
  const { palette, setPalette } = usePalette();

  return (
    <div className="pf-hud">
      <div className="pf-brand">
        <Image src="/images/al-monogram.png" alt="AL monogram" width={30} height={30} />
        <div>
          <strong>A. LANDA</strong> <span>// DOSSIER</span>
        </div>
      </div>

      <div className="pf-palette-picker" role="group" aria-label="Color palette">
        {palettes.map((p) => (
          <button
            key={p.id}
            className="pf-swatch"
            style={{ ["--sw-bg" as string]: p.swBg, ["--sw-accent" as string]: p.swAccent }}
            aria-pressed={palette === p.id}
            aria-label={p.label}
            onClick={() => setPalette(p.id)}
          />
        ))}
      </div>

      <a href="#pf-contact" className="pf-contact-quick">
        Contact
      </a>
    </div>
  );
};

export default Hud;
