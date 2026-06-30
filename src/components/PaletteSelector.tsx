import React, { FC, useState, useCallback, useEffect, useRef } from "react";

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
  label: string;
  dotColor: string;
  pinnedHour: number;
}

const STORAGE_KEY = "randytsao-palette-pin";

// ---- Pill definitions ----

const PILLS: PillCfg[] = [
  { pin: "auto", label: "Auto", dotColor: "var(--text-color)", pinnedHour: -1 },
  { pin: "dawn", label: "Dawn", dotColor: "#C9B8C4", pinnedHour: 6 },
  { pin: "day", label: "Day", dotColor: "#87CEEB", pinnedHour: 12 },
  { pin: "golden", label: "Gold", dotColor: "#E8C9A0", pinnedHour: 17 },
  { pin: "dusk", label: "Dusk", dotColor: "#9A8A8E", pinnedHour: 20 },
  { pin: "nocturne", label: "Night", dotColor: "#1E2B33", pinnedHour: 0 },
];

// ---- Helpers ----

const isAuto = (pin: PalettePin) => pin === "auto";

/** Current palette's dot color (with night inversion). */
function currentDotColor(pinned: PalettePin): string {
  if (pinned === "auto") return "transparent";
  if (pinned === "nocturne") return "#D4D0C8"; // moon disc
  return PILLS.find((p) => p.pin === pinned)?.dotColor ?? "#87CEEB";
}

/** Night dot in dropdown: invert when inactive so it shows on dark glass. */
function dotColorForDropdown(pill: PillCfg, pinned: PalettePin): string {
  if (pill.pin === "auto") return "transparent";
  if (pill.pin === "nocturne" && pinned !== "nocturne") return "#87CEEB"; // invert
  return pill.dotColor;
}

// ---- Auto glyph ----

const AutoGlyph: FC<{ bright?: boolean }> = ({ bright }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="var(--text-color)"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: bright ? 1 : 0.6 }}
  >
    <path d="M1 6a5 5 0 0 1 8.5-3.5M11 6a5 5 0 0 1-8.5 3.5" />
    <polyline points="8,2 10.5,2 10.5,4.5" />
  </svg>
);

// ---- Component ----

interface PaletteSelectorProps {
  pinned: PalettePin;
  onPin: (pin: PalettePin) => void;
}

const PaletteSelector: FC<PaletteSelectorProps> = ({ pinned, onPin }) => {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<PalettePin | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Attach click handler via ref to bypass any React event-system edge cases
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen((o) => !o);
    };
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  // Click outside closes the dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = useCallback(
    (pin: PalettePin) => {
      onPin(pin);
      setOpen(false);
    },
    [onPin],
  );

  // Button glass — matches card tokens
  const btnGlass =
    "bg-gradient-to-b from-[var(--card-bg-start)] to-[var(--card-bg-end)]" +
    " backdrop-blur-md border border-[var(--card-border)]" +
    " shadow-[0_2px_8px_var(--card-shadow)] ring-1 ring-[var(--card-ring)]" +
    " transition-all duration-200 ease-out";

  return (
    <div
      ref={wrapperRef}
      className="fixed top-6 right-6 z-[60] max-sm:top-4 max-sm:right-4"
    >
      {/* Dropdown panel */}
      {open && (
        <div
          className={
            "absolute top-full mt-2 right-0 w-[140px] p-1 rounded-xl" +
            " animate-fade-down" +
            " bg-gradient-to-b from-[var(--card-bg-start)] to-[var(--card-bg-end)]" +
            " backdrop-blur-md border border-[var(--card-border)]" +
            " shadow-[0_8px_24px_var(--card-shadow)] ring-1 ring-[var(--card-ring)]"
          }
          role="listbox"
          aria-label="Color palette"
        >
          {PILLS.map((pill) => {
            const active = pinned === pill.pin;
            const hov = hoveredItem === pill.pin;
            return (
              <button
                key={pill.pin}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(pill.pin)}
                onMouseEnter={() => setHoveredItem(pill.pin)}
                onMouseLeave={() => setHoveredItem(null)}
                className={
                  "flex items-center gap-2 w-full h-7 px-3 rounded-md" +
                  " transition-all duration-150 ease-out cursor-pointer" +
                  " focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--card-ring)]"
                }
                style={{
                  opacity: active ? 1 : hov ? 0.9 : 0.6,
                  backgroundColor: hov
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
                }}
              >
                {/* Dot or glyph */}
                <span
                  className="block rounded-full shrink-0 transition-transform duration-200"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: isAuto(pill.pin)
                      ? "transparent"
                      : dotColorForDropdown(pill, pinned),
                    border:
                      isAuto(pill.pin)
                        ? "1px solid var(--text-color)"
                        : "1px solid transparent",
                    transform: `scale(${active ? 1.15 : hov ? 1.08 : 1})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isAuto(pill.pin) && <AutoGlyph bright={active} />}
                </span>

                {/* Label */}
                <span
                  className="font-mono leading-none select-none"
                  style={{ fontSize: 10, letterSpacing: "0.02em" }}
                >
                  {pill.label}
                </span>

                {/* Auto glyph right-aligned (visual hint) */}
                {isAuto(pill.pin) && (
                  <span className="ml-auto opacity-50">
                    <AutoGlyph />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        aria-label="Select palette"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          "w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer pointer-events-auto " + btnGlass
        }
      >
        {pinned === "auto" ? (
          <span className="pointer-events-none"><AutoGlyph bright /></span>
        ) : (
          <span
            className="block rounded-full pointer-events-none"
            style={{
              width: 10,
              height: 10,
              backgroundColor: currentDotColor(pinned),
            }}
          />
        )}
      </button>
    </div>
  );
};

// ---- Hook: pin state + localStorage ----

export function usePalettePin(): [PalettePin, (pin: PalettePin) => void] {
  const [pinned, setPinned] = useState<PalettePin>(() => {
    if (typeof window === "undefined") return "day";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PILLS.some((p) => p.pin === stored)) {
      return stored as PalettePin;
    }
    return "day";
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