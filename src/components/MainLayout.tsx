import React, { FC, ReactNode, useEffect } from "react";
import Header from "./Header";
import ImpressionistBeach from "./ImpressionistBeach";
import { useTimeOfDayPalette, cardTokensForHour, getLocalHour } from "../lib/palette";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const palette = useTimeOfDayPalette();

  // Drive CSS custom properties on <html> so Header (a sibling of <main>)
  // can inherit them. Uses a ref-less approach — direct style.setProperty on
  // documentElement, decoupled from the React render cycle.
  useEffect(() => {
    const applyTokens = () => {
      const el = document.documentElement;
      const tokens = cardTokensForHour(getLocalHour());
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
    const id = setInterval(applyTokens, 500);
    return () => clearInterval(id);
  }, []);

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
    </>
  );
};

export default MainLayout;
