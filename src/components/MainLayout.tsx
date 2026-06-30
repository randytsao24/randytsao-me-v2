import React, { FC, ReactNode, useEffect, useMemo } from "react";
import Header from "./Header";
import ImpressionistBeach from "./ImpressionistBeach";
import PaletteSelector, { usePalettePin, pinnedHour, PalettePin } from "./PaletteSelector";
import {
  useTimeOfDayPalette,
  cardTokensForHour,
  getLocalHour,
  DAY_PALETTE,
  DAWN_PALETTE,
  GOLDEN_HOUR_PALETTE,
  NOCTURNE_PALETTE,
  DUSK_MID_PALETTE,
} from "../lib/palette";
import type { Palette } from "../lib/palette";

/** Map a PalettePin to the static palette for that state. */
function pinnedPalette(pin: PalettePin): Palette {
  switch (pin) {
    case "dawn": return DAWN_PALETTE;
    case "day": return DAY_PALETTE;
    case "golden": return GOLDEN_HOUR_PALETTE;
    case "dusk": return DUSK_MID_PALETTE;
    case "nocturne": return NOCTURNE_PALETTE;
    default: return DAY_PALETTE;
  }
}

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const clockPalette = useTimeOfDayPalette();
  const [pinned, setPinned] = usePalettePin();

  // When pinned, use the static palette. When auto, use the clock-driven one.
  const palette = useMemo(
    () => (pinned === "auto" ? clockPalette : pinnedPalette(pinned)),
    [pinned, clockPalette],
  );

  // CSS custom properties: update every 500ms in auto mode, or set once when pinned.
  useEffect(() => {
    const applyTokens = () => {
      const el = document.documentElement;
      const hour = pinned === "auto" ? getLocalHour() : pinnedHour(pinned);
      const tokens = cardTokensForHour(hour);
      el.style.setProperty("--card-bg-start", tokens.bgStart);
      el.style.setProperty("--card-bg-end", tokens.bgEnd);
      el.style.setProperty("--card-border", tokens.border);
      el.style.setProperty("--card-shadow", tokens.shadow);
      el.style.setProperty("--card-ring", tokens.ring);
      el.style.setProperty("--text-color", tokens.textColor);
      el.style.setProperty("--link-color", tokens.linkColor);
      el.style.setProperty("--link-hover-color", tokens.linkHoverColor);
      el.style.setProperty("--header-border", tokens.headerBorder);
      el.style.setProperty("--header-shadow", tokens.headerShadow);
      el.style.setProperty("--grain-opacity", tokens.grainOpacity.toFixed(2));
    };

    applyTokens();

    if (pinned === "auto") {
      const id = setInterval(applyTokens, 500);
      return () => clearInterval(id);
    }
    // When pinned, no interval needed — tokens are static.
  }, [pinned]);

  return (
    <>
      <Header />
      <ImpressionistBeach palette={palette} />
      <main className="flex-grow relative">
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </main>
      <PaletteSelector pinned={pinned} onPin={setPinned} />
    </>
  );
};

export default MainLayout;
