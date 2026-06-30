import React, { FC, useState, useCallback, useEffect } from "react";

// ---- Types ----

/** The 5 time-of-day palettes plus "auto" (clock tracking). */
export type PalettePin =
  | "auto"
  | "dawn"
  | "day"
  | "golden"
  | "dusk"
  | "nocturne";

interface PillCfg {
  pin: PalettePin;
  label: string; // 2-5 chars, font-mono 10px
  dotColor: string; // CSS color for the 8px mood dot
  pinnedHour: number; // hour to feed cardTokensForHour() when pinned
}

const STORAGE_KEY = "randytsao-palette-pin";

// ---- Pill definitions ----

const PILLS: PillCfg[] = [
  {
    pin: "auto",
    label: "Auto",
    dotColor: "var(--text-color)",
    pinnedHour: -1, // sentinel — means "don't pin, use clock"
  },
  {
    pin: "dawn",
    label: "Dawn",
    dotColor: "#C9B8C4", // pale rose-lavender (dawn skyTop)
    pinnedHour: 6,
  },
  {
    pin: "day",
    label: "Day",
    dotColor: "#87CEEB", // warm cream-blue (day skyTop)
    pinnedHour: 12,
  },
  {
    pin: "golden",
    label: "Gold",
    dotColor: "#E8C9A0", // apricot-gold (golden hour skyTop)
    pinnedHour: 17,
  },
  {
    pin: "dusk",
    label: "Dusk",
    dotColor: "#9A8A8E", // lavender-grey (dusk mid skyTop)
    pinnedHour: 19.5,
  },
  {
    pin: "nocturne",
    label: "Night",
    dotColor: "#1E2B33", // dark teal-ink (nocturne skyTop)
    pinnedHour: 0,
  },
];

// ---- Component props ----

interface PaletteSelectorProps {
  pinned: PalettePin;
  onPin: (pin: PalettePin) => void;
}

// ---- Component ----

const PaletteSelector: FC<PaletteSelectorProps> = ({ pinned, onPin }) => {
  const [hovered, setHovered] = useState<PalettePin | null>(null);

  const handleClick = useCallback(
    (pin: PalettePin) => {
      onPin(pin);
    },
    [onPin],
  );

  // Resting opacity of the label
  const labelOpacity = (pin: PalettePin): number => {
    if (pinned === pin) return 1;
    if (hovered === pin) return 0.75;
    return 0.55;
  };

  // Dot scale: active pill gets 1.15×; hovered gets 1.08×
  const dotScale = (pin: PalettePin): number => {
    if (pinned === pin) return 1.15;
    if (hovered === pin) return 1.08;
    return 1;
  };

  // The Auto pill uses a circular-arrow glyph, not a colored dot
  const isAuto = (pin: PalettePin): boolean => pin === "auto";

  // Night dot inversion: when Night is inactive, the dot is #1E2B33 which
  // disappears against the dark smoked glass at night. Invert to Day sky-blue.
  // When Night IS active, show a pale moon-disc (#D4D0C8).
  const isNightInactive = (pin: PalettePin): boolean =>
    pin === "nocturne" && pinned !== "nocturne";

  // Bar class — reuses the same card-glass tokens via CSS custom properties,
  // with a smaller rounded-xl to signal it's a sub-card UI element.
  const barClass =
    "flex items-center gap-1.5 px-2 py-2 bg-gradient-to-b from-[var(--card-bg-start)] to-[var(--card-bg-end)]" +
    " backdrop-blur-md border border-[var(--card-border)] rounded-xl" +
    " shadow-[0_4px_16px_var(--card-shadow)] ring-1 ring-[var(--card-ring)]" +
    " text-[var(--text-color)] transition-all duration-1000 ease-out";

  return (
    <div
      className={"fixed bottom-6 left-6 z-40 sm:bottom-6 sm:left-6 max-sm:bottom-4 max-sm:left-1/2 max-sm:-translate-x-1/2 " + barClass}
      style={{ opacity: hovered ? 0.82 : 0.55 }}
      onMouseEnter={() => setHovered(hovered)} // keep existing (any hover on bar)
      onMouseLeave={() => setHovered(null)}
    >
      {PILLS.map((pill) => (
        <button
          key={pill.pin}
          type="button"
          onClick={() => handleClick(pill.pin)}
          onMouseEnter={() => setHovered(pill.pin)}
          onMouseLeave={() => setHovered(null)}
          aria-label={pill.label}
          aria-pressed={pinned === pill.pin}
          className="flex flex-col items-center justify-center gap-0.5 cursor-pointer
                     w-[26px] sm:w-[30px] transition-transform duration-200 ease-out
                     hover:scale-105 focus:outline-none focus-visible:ring-1
                     focus-visible:ring-[var(--card-ring)] rounded-md"
          style={{
            transform: pinned === pill.pin ? "scale(1.04)" : undefined,
          }}
        >
          {/* Dot or glyph */}
          <span
            className="block rounded-full transition-all duration-300 ease-out"
            style={{
              width: 8,
              height: 8,
              backgroundColor: isAuto(pill.pin)
                ? "transparent"
                : isNightInactive(pill.pin)
                  ? "#87CEEB" // invert: Day blue visible against dark glass
                  : pill.dotColor,
              border:
                pinned === pill.pin && !isAuto(pill.pin)
                  ? "1px solid var(--card-ring)"
                  : isAuto(pill.pin)
                    ? "1px solid var(--text-color)"
                    : isNightInactive(pill.pin)
                      ? "1px solid rgba(135,206,235,0.5)"
                      : "1px solid transparent",
              transform: `scale(${dotScale(pill.pin)})`,
              opacity: isAuto(pill.pin) ? 0.55 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              lineHeight: 1,
              color: "var(--text-color)",
            }}
          >
            {/* Auto glyph: ↻ (clockwise return arrow) */}
            {isAuto(pill.pin) && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                stroke="var(--text-color)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: pinned === "auto" ? 1 : 0.55 }}
              >
                <path d="M1 6a5 5 0 0 1 8.5-3.5M11 6a5 5 0 0 1-8.5 3.5" />
                <polyline points="8,2 10.5,2 10.5,4.5" />
              </svg>
            )}
          </span>

          {/* Label */}
          <span
            className="font-mono leading-none select-none transition-opacity duration-200"
            style={{
              fontSize: 9,
              opacity: labelOpacity(pill.pin),
              letterSpacing: "0.02em",
            }}
          >
            {pill.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// ---- Hook: pin state + localStorage ----

export function usePalettePin(): [PalettePin, (pin: PalettePin) => void] {
  const [pinned, setPinned] = useState<PalettePin>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PILLS.some((p) => p.pin === stored)) {
      return stored as PalettePin;
    }
    return "auto";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, pinned);
  }, [pinned]);

  return [pinned, setPinned];
}

/** Return the pinnedHour for a given pin, or -1 for "auto". */
export function pinnedHour(pin: PalettePin): number {
  const pill = PILLS.find((p) => p.pin === pin);
  return pill ? pill.pinnedHour : -1;
}

export default PaletteSelector;