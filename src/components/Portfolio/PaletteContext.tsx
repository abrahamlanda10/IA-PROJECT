"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PaletteId } from "@/data/portfolioData";

interface PaletteContextValue {
  palette: PaletteId;
  setPalette: (id: PaletteId) => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

const STORAGE_KEY = "pf-palette";

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>("olive");

  // Restore a saved choice after mount (avoids SSR/client mismatch).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as PaletteId | null;
    if (saved) setPaletteState(saved);
  }, []);

  const setPalette = (id: PaletteId) => {
    setPaletteState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      <div id="pf-root" data-palette={palette}>
        {children}
      </div>
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within PaletteProvider");
  return ctx;
}
