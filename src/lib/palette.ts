/**
 * Time-of-Day "Living Light" Palette System
 *
 * A typed token object that replaces scattered inline hex/rgba values in
 * ImpressionistBeach.tsx. The palette is a flat record of CSS color strings
 * keyed by semantic name. Keyframes define the palette at specific hours;
 * lerpPalette() interpolates between any two palettes channel-by-channel.
 */

// ---- Types ----

/** All color tokens needed by the canvas draw functions. */
export interface Palette {
  // Sky gradient (top → bottom, 5 stops)
  skyTop: string;
  skyMid1: string;
  skyMid2: string;
  skyMid3: string;
  skyBottom: string;

  // Sun glow (radial gradient, 5 stops from center → edge)
  sunGlowInner: string;
  sunGlowMid: string;
  sunGlowOuter: string;
  sunGlowFar: string;
  sunGlowEdge: string;
  // Sun ellipse
  sunEllipseFill: string;
  sunEllipseShadow: string;
  // Sun position (fraction of width, px offset from horizon)
  sunXFrac: number;
  sunYOffset: number;
  // Sun/moon ellipse dimensions (CSS px in the canvas coordinate space)
  sunRadiusX: number;
  sunRadiusY: number;

  // Clouds
  cloudFillR: number;
  cloudFillG: number;
  cloudFillB: number;
  cloudShadow: string;

  // Sea gradient (top → bottom, 4 stops)
  seaTop: string;
  seaMid1: string;
  seaMid2: string;
  seaBottom: string;
  // Wave strokes (rgba with per-wave alpha baked into the caller)
  waveStroke1R: number;
  waveStroke1G: number;
  waveStroke1B: number;
  waveStroke2R: number;
  waveStroke2G: number;
  waveStroke2B: number;

  // Foam line at horizon
  foamStroke1: string;
  foamStroke2: string;
  foamShadow: string;

  // Beach
  wetSandTop: string;
  wetSandBottom: string;
  drySandTop: string;
  drySandMid1: string;
  drySandMid2: string;
  drySandBottom: string;
  sandTextureR: number;
  sandTextureG: number;
  sandTextureB: number;

  // Wash (lapping water sheet)
  washDampR: number;
  washDampG: number;
  washDampB: number;
  washBodyTopR: number;
  washBodyTopG: number;
  washBodyTopB: number;
  washBodyMidR: number;
  washBodyMidG: number;
  washBodyMidB: number;
  washBodyBottomR: number;
  washBodyBottomG: number;
  washBodyBottomB: number;
  washFoamR: number;
  washFoamG: number;
  washFoamB: number;
  washFoamShadow: string;
}

/** A keyframe: a full Palette at a specific hour (0-24, fractional). */
export interface PaletteKeyframe {
  hour: number;
  palette: Palette;
}

// ---- Color parsing helpers ----

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parse "rgba(r,g,b,a)" or "rgb(r,g,b)" into channels. */
function parseRGBA(s: string): RGBA {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    return {
      r: parseInt(m[1], 10),
      g: parseInt(m[2], 10),
      b: parseInt(m[3], 10),
      a: m[4] !== undefined ? parseFloat(m[4]) : 1,
    };
  }
  // Fallback: treat as hex
  const hex = hexToRGBA(s);
  return hex;
}

/** Parse "#RRGGBB" or "#RGB" into RGBA (alpha=1). */
function hexToRGBA(hex: string): RGBA {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    a: 1,
  };
}

/** Format RGBA channels back to a CSS string. */
function formatRGBA(c: RGBA): string {
  if (c.a >= 0.999) {
    return `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
  }
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a.toFixed(3)})`;
}

/** Lerp between two numbers. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Lerp between two RGBA colors channel-by-channel. */
function lerpRGBA(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
    a: lerp(a.a, b.a, t),
  };
}

/** Lerp a CSS color string (hex or rgba) between two values. */
function lerpColor(a: string, b: string, t: number): string {
  const ca = parseRGBA(a);
  const cb = parseRGBA(b);
  return formatRGBA(lerpRGBA(ca, cb, t));
}

// ---- Palette lerp ----

/**
 * Linearly interpolate between two Palettes.
 * Numeric fields (sun position, cloud RGB channels, etc.) are lerped directly.
 * String color fields are parsed and lerped channel-by-channel.
 */
export function lerpPalette(a: Palette, b: Palette, t: number): Palette {
  const clamped = Math.max(0, Math.min(1, t));
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(a) as (keyof Palette)[]) {
    const va = a[key];
    const vb = b[key];

    if (typeof va === "number" && typeof vb === "number") {
      result[key] = lerp(va, vb, clamped);
    } else if (typeof va === "string" && typeof vb === "string") {
      result[key] = lerpColor(va, vb, clamped);
    } else {
      // Type mismatch — shouldn't happen with valid keyframes
      result[key] = va;
    }
  }

  return result as unknown as Palette;
}

// ---- Keyframe lookup ----

/**
 * Find the two surrounding keyframes for a given hour and lerp between them.
 * If hour is before the first keyframe, wraps around (e.g., 3am lerps between
 * the last nocturne keyframe and the first dawn keyframe).
 */
export function paletteForHour(
  keyframes: PaletteKeyframe[],
  hour: number,
): Palette {
  if (keyframes.length === 0) {
    throw new Error("paletteForHour: no keyframes defined");
  }
  if (keyframes.length === 1) {
    return keyframes[0].palette;
  }

  // Sort by hour ascending
  const sorted = [...keyframes].sort((a, b) => a.hour - b.hour);

  // Find the segment [prev, next] that contains `hour`
  let prev = sorted[sorted.length - 1]; // wrap: last keyframe
  let next = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].hour <= hour) {
      prev = sorted[i];
      next = sorted[(i + 1) % sorted.length];
    }
  }

  // Compute t: how far between prev.hour and next.hour
  let startH = prev.hour;
  let endH = next.hour;

  // Handle wrap-around (e.g., 22:00 → 05:00)
  if (endH < startH) {
    endH += 24;
    if (hour < startH) {
      // hour is in the wrap segment (e.g., hour=2, startH=21, endH=29)
      // We need to shift hour into the same range
      const adjustedHour = hour + 24;
      const t = (adjustedHour - startH) / (endH - startH);
      return lerpPalette(prev.palette, next.palette, t);
    }
  }

  const t = (hour - startH) / (endH - startH);
  return lerpPalette(prev.palette, next.palette, t);
}

// ---- Day-anchor palette (current hardcoded colors) ----

export const DAY_PALETTE: Palette = {
  // Sky
  skyTop: "#87CEEB",
  skyMid1: "#98D4D9",
  skyMid2: "#A3DBD8",
  skyMid3: "#9BC7C5",
  skyBottom: "#8BB5B4",

  // Sun glow
  sunGlowInner: "rgba(255,245,220,0.25)",
  sunGlowMid: "rgba(255,240,210,0.15)",
  sunGlowOuter: "rgba(255,230,190,0.06)",
  sunGlowFar: "rgba(220,220,200,0.02)",
  sunGlowEdge: "rgba(200,200,180,0)",
  sunEllipseFill: "rgba(255,240,210,0.2)",
  sunEllipseShadow: "rgba(255,235,190,0.4)",
  sunXFrac: 0.65,
  sunYOffset: 20,
  sunRadiusX: 40,
  sunRadiusY: 18,

  // Clouds
  cloudFillR: 255,
  cloudFillG: 255,
  cloudFillB: 255,
  cloudShadow: "rgba(255,255,255,0.15)",

  // Sea
  seaTop: "#7AADAD",
  seaMid1: "#71A0A0",
  seaMid2: "#6B9895",
  seaBottom: "#689090",
  waveStroke1R: 170,
  waveStroke1G: 210,
  waveStroke1B: 210,
  waveStroke2R: 140,
  waveStroke2G: 190,
  waveStroke2B: 190,

  // Foam line
  foamStroke1: "rgba(200,230,230,0.12)",
  foamStroke2: "rgba(240,250,250,0.08)",
  foamShadow: "rgba(220,240,240,0.12)",

  // Beach
  wetSandTop: "#9E9688",
  wetSandBottom: "#B0A08A",
  drySandTop: "#C8B898",
  drySandMid1: "#D0C0A0",
  drySandMid2: "#D4C4A4",
  drySandBottom: "#D8C8A8",
  sandTextureR: 180,
  sandTextureG: 170,
  sandTextureB: 155,

  // Wash
  washDampR: 120,
  washDampG: 92,
  washDampB: 58,
  washBodyTopR: 108,
  washBodyTopG: 146,
  washBodyTopB: 144,
  washBodyMidR: 126,
  washBodyMidG: 164,
  washBodyMidB: 159,
  washBodyBottomR: 150,
  washBodyBottomG: 184,
  washBodyBottomB: 178,
  washFoamR: 242,
  washFoamG: 239,
  washFoamB: 230,
  washFoamShadow: "rgba(242,239,230,0.3)",
};

// ---- Golden-hour palette (~16–19) ----
// Designer note: sand warmer than plan suggested (day sand felt cold against
// warm sky). Wong Kar-wai saturation held back a notch. Sun larger, lower.
export const GOLDEN_HOUR_PALETTE: Palette = {
  skyTop: "#E8C9A0",
  skyMid1: "#E2BF92",
  skyMid2: "#DDB385",
  skyMid3: "#D3A177",
  skyBottom: "#C98F6E",

  sunGlowInner: "rgba(255,230,176,0.30)",
  sunGlowMid: "rgba(255,220,160,0.18)",
  sunGlowOuter: "rgba(255,205,140,0.08)",
  sunGlowFar: "rgba(240,190,130,0.03)",
  sunGlowEdge: "rgba(220,170,110,0)",
  sunEllipseFill: "rgba(255,230,176,0.25)",
  sunEllipseShadow: "rgba(255,220,160,0.45)",
  sunXFrac: 0.65,
  sunYOffset: 10,
  sunRadiusX: 50,
  sunRadiusY: 22,

  cloudFillR: 255,
  cloudFillG: 240,
  cloudFillB: 210,
  cloudShadow: "rgba(255,235,190,0.15)",

  seaTop: "#8A8A7E",
  seaMid1: "#848579",
  seaMid2: "#7E8074",
  seaBottom: "#787B6F",
  waveStroke1R: 160,
  waveStroke1G: 180,
  waveStroke1B: 170,
  waveStroke2R: 135,
  waveStroke2G: 165,
  waveStroke2B: 155,

  foamStroke1: "rgba(230,215,195,0.14)",
  foamStroke2: "rgba(245,235,215,0.10)",
  foamShadow: "rgba(230,215,195,0.14)",

  wetSandTop: "#B8A280",
  wetSandBottom: "#CDB088",
  drySandTop: "#D8BE96",
  drySandMid1: "#DDC5A0",
  drySandMid2: "#E1CCA8",
  drySandBottom: "#E5CBA8",
  sandTextureR: 200,
  sandTextureG: 180,
  sandTextureB: 150,

  washDampR: 140,
  washDampG: 105,
  washDampB: 65,
  washBodyTopR: 125,
  washBodyTopG: 145,
  washBodyTopB: 130,
  washBodyMidR: 140,
  washBodyMidG: 160,
  washBodyMidB: 140,
  washBodyBottomR: 165,
  washBodyBottomG: 175,
  washBodyBottomB: 155,
  washFoamR: 245,
  washFoamG: 235,
  washFoamB: 215,
  washFoamShadow: "rgba(245,235,215,0.3)",
};

// ---- Nocturne palette (~21–5) ----
// Designer note: sea must be ink-green (#1A2A28), not blue (#14202A), or the
// night scene reads as a different painting. Whistler nocturne reference.
// Moon-glow replaces sun; cloud opacity dropped; stars added in component.
export const NOCTURNE_PALETTE: Palette = {
  skyTop: "#1E2B33",
  skyMid1: "#1B2730",
  skyMid2: "#19242D",
  skyMid3: "#17232B",
  skyBottom: "#16222A",

  // Moon glow — cool silver glow, visible disc with soft halo
  sunGlowInner: "rgba(223,232,232,0.20)",
  sunGlowMid: "rgba(218,228,228,0.14)",
  sunGlowOuter: "rgba(210,222,222,0.07)",
  sunGlowFar: "rgba(200,215,215,0.03)",
  sunGlowEdge: "rgba(190,205,205,0)",
  sunEllipseFill: "rgba(223,232,232,0.22)",
  sunEllipseShadow: "rgba(210,220,220,0.22)",
  sunXFrac: 0.65,
  sunYOffset: 55,
  sunRadiusX: 30,
  sunRadiusY: 25,

  cloudFillR: 200,
  cloudFillG: 210,
  cloudFillB: 215,
  cloudShadow: "rgba(180,190,195,0.05)",

  seaTop: "#1A2A28",
  seaMid1: "#182A27",
  seaMid2: "#172925",
  seaBottom: "#152824",
  waveStroke1R: 130,
  waveStroke1G: 150,
  waveStroke1B: 145,
  waveStroke2R: 110,
  waveStroke2G: 130,
  waveStroke2B: 125,

  foamStroke1: "rgba(200,210,210,0.06)",
  foamStroke2: "rgba(210,220,220,0.04)",
  foamShadow: "rgba(200,210,210,0.06)",

  wetSandTop: "#3A3835",
  wetSandBottom: "#45403A",
  drySandTop: "#4A4540",
  drySandMid1: "#504B45",
  drySandMid2: "#55504A",
  drySandBottom: "#5A5550",
  sandTextureR: 90,
  sandTextureG: 85,
  sandTextureB: 80,

  washDampR: 50,
  washDampG: 45,
  washDampB: 40,
  washBodyTopR: 30,
  washBodyTopG: 48,
  washBodyTopB: 46,
  washBodyMidR: 35,
  washBodyMidG: 52,
  washBodyMidB: 48,
  washBodyBottomR: 40,
  washBodyBottomG: 55,
  washBodyBottomB: 50,
  washFoamR: 180,
  washFoamG: 190,
  washFoamB: 185,
  washFoamShadow: "rgba(180,190,185,0.15)",
};

// ---- Dawn palette (~5–8) ----
// Cool rose-grey lifting to pale apricot at the horizon. Sun is low, small, pale.
// Designer correction: sea #8E9598 (purple-grey), not #8898A0 (blue-grey),
// or the cold sea reads disconnected from the warming sky.
export const DAWN_PALETTE: Palette = {
  skyTop: "#C9B8C4",
  skyMid1: "#CFBDB0",
  skyMid2: "#D6C2A8",
  skyMid3: "#DCC8A8",
  skyBottom: "#E3C9B0",

  sunGlowInner: "rgba(255,240,215,0.15)",
  sunGlowMid: "rgba(255,235,205,0.09)",
  sunGlowOuter: "rgba(250,225,190,0.04)",
  sunGlowFar: "rgba(240,215,180,0.015)",
  sunGlowEdge: "rgba(220,200,170,0)",
  sunEllipseFill: "rgba(255,240,215,0.12)",
  sunEllipseShadow: "rgba(255,230,195,0.25)",
  sunXFrac: 0.60,
  sunYOffset: 15,
  sunRadiusX: 30,
  sunRadiusY: 14,

  cloudFillR: 245,
  cloudFillG: 238,
  cloudFillB: 225,
  cloudShadow: "rgba(235,225,210,0.12)",

  seaTop: "#8E9598",
  seaMid1: "#899295",
  seaMid2: "#848F90",
  seaBottom: "#808C8C",
  waveStroke1R: 155,
  waveStroke1G: 170,
  waveStroke1B: 170,
  waveStroke2R: 130,
  waveStroke2G: 150,
  waveStroke2B: 150,

  foamStroke1: "rgba(210,215,215,0.10)",
  foamStroke2: "rgba(230,235,235,0.07)",
  foamShadow: "rgba(210,215,215,0.10)",

  wetSandTop: "#A09088",
  wetSandBottom: "#B0A090",
  drySandTop: "#C8BAA0",
  drySandMid1: "#CDBFA8",
  drySandMid2: "#D0C2AC",
  drySandBottom: "#D4C6B0",
  sandTextureR: 185,
  sandTextureG: 175,
  sandTextureB: 160,

  washDampR: 110,
  washDampG: 88,
  washDampB: 65,
  washBodyTopR: 105,
  washBodyTopG: 135,
  washBodyTopB: 135,
  washBodyMidR: 120,
  washBodyMidG: 148,
  washBodyMidB: 148,
  washBodyBottomR: 140,
  washBodyBottomG: 162,
  washBodyBottomB: 160,
  washFoamR: 238,
  washFoamG: 234,
  washFoamB: 222,
  washFoamShadow: "rgba(238,234,222,0.25)",
};

// ---- Dusk early palette (~19:00) ----
// Warm grey, last hint of peach at the horizon. Sun gone, warm band lingers.
export const DUSK_EARLY_PALETTE: Palette = {
  skyTop: "#C8A8A0",
  skyMid1: "#BB9E96",
  skyMid2: "#B0948E",
  skyMid3: "#AA8E8A",
  skyBottom: "#A8908A",

  sunGlowInner: "rgba(240,200,170,0.10)",
  sunGlowMid: "rgba(230,190,160,0.06)",
  sunGlowOuter: "rgba(220,175,145,0.03)",
  sunGlowFar: "rgba(200,160,130,0.01)",
  sunGlowEdge: "rgba(180,145,115,0)",
  sunEllipseFill: "rgba(240,200,170,0.08)",
  sunEllipseShadow: "rgba(230,185,155,0.15)",
  sunXFrac: 0.65,
  sunYOffset: 5,
  sunRadiusX: 25,
  sunRadiusY: 12,

  cloudFillR: 220,
  cloudFillG: 200,
  cloudFillB: 185,
  cloudShadow: "rgba(210,190,175,0.08)",

  seaTop: "#9A908A",
  seaMid1: "#908A84",
  seaMid2: "#88827E",
  seaBottom: "#807C78",
  waveStroke1R: 155,
  waveStroke1G: 150,
  waveStroke1B: 145,
  waveStroke2R: 130,
  waveStroke2G: 130,
  waveStroke2B: 125,

  foamStroke1: "rgba(210,195,185,0.08)",
  foamStroke2: "rgba(225,210,200,0.05)",
  foamShadow: "rgba(210,195,185,0.08)",

  wetSandTop: "#807068",
  wetSandBottom: "#8A7A70",
  drySandTop: "#9A8A80",
  drySandMid1: "#A09085",
  drySandMid2: "#A59588",
  drySandBottom: "#AA9A8C",
  sandTextureR: 140,
  sandTextureG: 130,
  sandTextureB: 120,

  washDampR: 90,
  washDampG: 75,
  washDampB: 60,
  washBodyTopR: 80,
  washBodyTopG: 90,
  washBodyTopB: 85,
  washBodyMidR: 90,
  washBodyMidG: 100,
  washBodyMidB: 95,
  washBodyBottomR: 105,
  washBodyBottomG: 115,
  washBodyBottomB: 110,
  washFoamR: 220,
  washFoamG: 205,
  washFoamB: 190,
  washFoamShadow: "rgba(220,205,190,0.18)",
};

// ---- Dusk mid palette (~20:00) ----
// Lavender-grey, no warm residual. Bridge between peach dusk and blue-black night.
export const DUSK_MID_PALETTE: Palette = {
  skyTop: "#9A8A8E",
  skyMid1: "#8C8286",
  skyMid2: "#827A80",
  skyMid3: "#7C767E",
  skyBottom: "#7A7880",

  sunGlowInner: "rgba(180,170,180,0.04)",
  sunGlowMid: "rgba(170,160,170,0.025)",
  sunGlowOuter: "rgba(160,150,160,0.012)",
  sunGlowFar: "rgba(140,130,140,0.004)",
  sunGlowEdge: "rgba(120,110,120,0)",
  sunEllipseFill: "rgba(180,170,180,0.03)",
  sunEllipseShadow: "rgba(170,160,170,0.06)",
  sunXFrac: 0.65,
  sunYOffset: 0,
  sunRadiusX: 0,
  sunRadiusY: 0,

  cloudFillR: 175,
  cloudFillG: 170,
  cloudFillB: 175,
  cloudShadow: "rgba(160,155,160,0.04)",

  seaTop: "#6A6870",
  seaMid1: "#626068",
  seaMid2: "#5C5A62",
  seaBottom: "#56545C",
  waveStroke1R: 110,
  waveStroke1G: 115,
  waveStroke1B: 120,
  waveStroke2R: 95,
  waveStroke2G: 100,
  waveStroke2B: 105,

  foamStroke1: "rgba(180,175,180,0.05)",
  foamStroke2: "rgba(190,185,190,0.03)",
  foamShadow: "rgba(180,175,180,0.05)",

  wetSandTop: "#484540",
  wetSandBottom: "#504D48",
  drySandTop: "#585550",
  drySandMid1: "#5E5B55",
  drySandMid2: "#626058",
  drySandBottom: "#68655C",
  sandTextureR: 100,
  sandTextureG: 95,
  sandTextureB: 90,

  washDampR: 60,
  washDampG: 55,
  washDampB: 48,
  washBodyTopR: 45,
  washBodyTopG: 55,
  washBodyTopB: 55,
  washBodyMidR: 50,
  washBodyMidG: 60,
  washBodyMidB: 58,
  washBodyBottomR: 60,
  washBodyBottomG: 68,
  washBodyBottomB: 65,
  washFoamR: 170,
  washFoamG: 168,
  washFoamB: 170,
  washFoamShadow: "rgba(170,168,170,0.12)",
};

// ---- Dusk late palette (~20:40) ----
// Near-nocturne. Dark blue-grey, last bridge before full night at 21:00.
// Placed at 20.7 so the final fade into NOCTURNE_PALETTE is a gentle 0.3h lerp.
export const DUSK_LATE_PALETTE: Palette = {
  skyTop: "#5A5860",
  skyMid1: "#4E4C54",
  skyMid2: "#44424C",
  skyMid3: "#3E3C46",
  skyBottom: "#384048",

  sunGlowInner: "rgba(150,155,160,0.02)",
  sunGlowMid: "rgba(140,145,150,0.012)",
  sunGlowOuter: "rgba(130,135,140,0.006)",
  sunGlowFar: "rgba(110,115,120,0.002)",
  sunGlowEdge: "rgba(100,105,110,0)",
  sunEllipseFill: "rgba(140,145,150,0.015)",
  sunEllipseShadow: "rgba(130,135,140,0.03)",
  sunXFrac: 0.65,
  sunYOffset: 0,
  sunRadiusX: 0,
  sunRadiusY: 0,

  cloudFillR: 160,
  cloudFillG: 165,
  cloudFillB: 170,
  cloudShadow: "rgba(140,145,150,0.03)",

  seaTop: "#3A4048",
  seaMid1: "#343A40",
  seaMid2: "#303438",
  seaBottom: "#2C3034",
  waveStroke1R: 105,
  waveStroke1G: 110,
  waveStroke1B: 115,
  waveStroke2R: 90,
  waveStroke2G: 95,
  waveStroke2B: 100,

  foamStroke1: "rgba(160,165,170,0.04)",
  foamStroke2: "rgba(170,175,180,0.025)",
  foamShadow: "rgba(160,165,170,0.04)",

  wetSandTop: "#302E2C",
  wetSandBottom: "#363430",
  drySandTop: "#3C3A35",
  drySandMid1: "#403E38",
  drySandMid2: "#44423C",
  drySandBottom: "#484640",
  sandTextureR: 80,
  sandTextureG: 75,
  sandTextureB: 70,

  washDampR: 45,
  washDampG: 42,
  washDampB: 38,
  washBodyTopR: 28,
  washBodyTopG: 40,
  washBodyTopB: 38,
  washBodyMidR: 32,
  washBodyMidG: 44,
  washBodyMidB: 40,
  washBodyBottomR: 36,
  washBodyBottomG: 48,
  washBodyBottomB: 44,
  washFoamR: 145,
  washFoamG: 148,
  washFoamB: 150,
  washFoamShadow: "rgba(145,148,150,0.10)",
};

// ---- Keyframes ----
//
// Full 24-hour cycle across 8 keyframes:
//   nocturne(0) → dawn(5) → day(8) → golden(16) → dusk-early(19) →
//   dusk-mid(20) → dusk-late(20.7) → nocturne(21) → nocturne(24)
// Hour 24 is a sentinel at nocturne, closing the wrap-around from 21→24.
export const KEYFRAMES: PaletteKeyframe[] = [
  { hour: 0, palette: NOCTURNE_PALETTE },
  { hour: 5, palette: DAWN_PALETTE },
  { hour: 8, palette: DAY_PALETTE },
  { hour: 16, palette: GOLDEN_HOUR_PALETTE },
  { hour: 19, palette: DUSK_EARLY_PALETTE },
  { hour: 20, palette: DUSK_MID_PALETTE },
  { hour: 20.7, palette: DUSK_LATE_PALETTE },
  { hour: 21, palette: NOCTURNE_PALETTE },
  { hour: 24, palette: NOCTURNE_PALETTE }, // closes the 24h wrap
];

// ---- React hook ----

/**
 * Returns the current Palette based on the visitor's local clock.
 * Re-renders when the palette changes (every ~500ms via setInterval).
 */
export function useTimeOfDayPalette(): Palette {
  const [palette, setPalette] = React.useState<Palette>(() =>
    paletteForHour(KEYFRAMES, getLocalHour()),
  );

  React.useEffect(() => {
    const tick = () => {
      setPalette(paletteForHour(KEYFRAMES, getLocalHour()));
    };
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  return palette;
}

// ---- Card glass tokens ----
//
// CSS custom properties driven by the same time-of-day keyframe system.
// Each keyframe defines the card glass tint, shadow, border, and text colors
// that keep the cards visually unified with the canvas scene behind them.
//
// Day → warm frosted glass. Nocturne → darker smoked glass with lightened text
// (≥4.5:1 contrast, especially the link color at night).

export interface CardTokens {
  bgStart: string;
  bgEnd: string;
  border: string;
  shadow: string;
  ring: string;
  textColor: string;
  linkColor: string;
  linkHoverColor: string;
  headerBorder: string;
  headerShadow: string;
  grainOpacity: number;
}

interface CardKeyframe {
  hour: number;
  tokens: CardTokens;
}

const CARD_KEYFRAMES: CardKeyframe[] = [
  {
    hour: 0,
    tokens: {
      bgStart: "rgba(30,45,48,0.70)",
      bgEnd: "rgba(25,38,40,0.55)",
      border: "rgba(220,225,220,0.08)",
      shadow: "rgba(0,0,0,0.35)",
      ring: "rgba(200,205,200,0.05)",
      textColor: "#D4D0C8",
      linkColor: "#8FD1CF",
      linkHoverColor: "#B0E8E6",
      headerBorder: "#C8C4BC",
      headerShadow: "rgba(180,180,170,0.4)",
      grainOpacity: 0.09,
    },
  },
  {
    hour: 5,
    tokens: {
      bgStart: "rgba(248,244,240,0.58)",
      bgEnd: "rgba(238,230,222,0.46)",
      border: "rgba(248,242,235,0.48)",
      shadow: "rgba(80,108,110,0.16)",
      ring: "rgba(115,88,58,0.06)",
      textColor: "#4B3B2F",
      linkColor: "#1A5453",
      linkHoverColor: "#0F3C3B",
      headerBorder: "#4B3B2F",
      headerShadow: "rgba(0,0,0,0.7)",
      grainOpacity: 0.05,
    },
  },
  {
    hour: 8,
    tokens: {
      bgStart: "rgba(255,252,246,0.62)",
      bgEnd: "rgba(243,235,221,0.50)",
      border: "rgba(255,252,245,0.55)",
      shadow: "rgba(80,110,110,0.18)",
      ring: "rgba(120,92,60,0.07)",
      textColor: "#4B3B2F",
      linkColor: "#1A5453",
      linkHoverColor: "#0F3C3B",
      headerBorder: "#000000",
      headerShadow: "rgba(0,0,0,1)",
      grainOpacity: 0.04,
    },
  },
  {
    hour: 16,
    tokens: {
      bgStart: "rgba(252,248,240,0.50)",
      bgEnd: "rgba(240,228,212,0.42)",
      border: "rgba(250,242,232,0.48)",
      shadow: "rgba(80,105,110,0.16)",
      ring: "rgba(110,80,50,0.06)",
      textColor: "#3D3028",
      linkColor: "#0F3C3B",
      linkHoverColor: "#0A2A29",
      headerBorder: "#3D3028",
      headerShadow: "rgba(0,0,0,0.75)",
      grainOpacity: 0.04,
    },
  },
  {
    hour: 19,
    tokens: {
      bgStart: "rgba(180,175,170,0.55)",
      bgEnd: "rgba(160,155,148,0.45)",
      border: "rgba(200,195,188,0.35)",
      shadow: "rgba(40,45,50,0.22)",
      ring: "rgba(100,95,88,0.05)",
      textColor: "#3A3530",
      linkColor: "#1A5453",
      linkHoverColor: "#0F3C3B",
      headerBorder: "#3A3530",
      headerShadow: "rgba(0,0,0,0.6)",
      grainOpacity: 0.05,
    },
  },
  {
    hour: 20,
    tokens: {
      bgStart: "rgba(70,68,72,0.62)",
      bgEnd: "rgba(55,52,56,0.50)",
      border: "rgba(140,138,142,0.15)",
      shadow: "rgba(0,0,0,0.32)",
      ring: "rgba(120,118,122,0.04)",
      textColor: "#C0BCB8",
      linkColor: "#5A9A98",
      linkHoverColor: "#8FD1CF",
      headerBorder: "#C0BCB8",
      headerShadow: "rgba(150,148,145,0.35)",
      grainOpacity: 0.07,
    },
  },
  {
    hour: 21,
    tokens: {
      bgStart: "rgba(30,45,48,0.70)",
      bgEnd: "rgba(25,38,40,0.55)",
      border: "rgba(220,225,220,0.08)",
      shadow: "rgba(0,0,0,0.35)",
      ring: "rgba(200,205,200,0.05)",
      textColor: "#D4D0C8",
      linkColor: "#8FD1CF",
      linkHoverColor: "#B0E8E6",
      headerBorder: "#C8C4BC",
      headerShadow: "rgba(180,180,170,0.4)",
      grainOpacity: 0.09,
    },
  },
  {
    hour: 24,
    tokens: {
      bgStart: "rgba(30,45,48,0.70)",
      bgEnd: "rgba(25,38,40,0.55)",
      border: "rgba(220,225,220,0.08)",
      shadow: "rgba(0,0,0,0.35)",
      ring: "rgba(200,205,200,0.05)",
      textColor: "#D4D0C8",
      linkColor: "#8FD1CF",
      linkHoverColor: "#B0E8E6",
      headerBorder: "#C8C4BC",
      headerShadow: "rgba(180,180,170,0.4)",
      grainOpacity: 0.09,
    },
  },
];

/**
 * Compute card glass tokens for a given hour by lerping between surrounding
 * CARD_KEYFRAMES entries. Uses the same piecewise-interpolation logic as
 * paletteForHour() but for CardTokens.
 */
export function cardTokensForHour(hour: number): CardTokens {
  const sorted = [...CARD_KEYFRAMES].sort((a, b) => a.hour - b.hour);
  if (sorted.length === 1) return sorted[0].tokens;

  let prev = sorted[sorted.length - 1];
  let next = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].hour <= hour) {
      prev = sorted[i];
      next = sorted[(i + 1) % sorted.length];
    }
  }

  let startH = prev.hour;
  let endH = next.hour;
  let adjustedHour = hour;

  if (endH < startH) {
    endH += 24;
    if (hour < startH) adjustedHour += 24;
  }

  const t = Math.max(0, Math.min(1, (adjustedHour - startH) / (endH - startH)));
  const a = prev.tokens;
  const b = next.tokens;

  const lerpStr = (va: string, vb: string): string => {
    if (va === vb) return va;
    return lerpColor(va, vb, t);
  };

  return {
    bgStart: lerpStr(a.bgStart, b.bgStart),
    bgEnd: lerpStr(a.bgEnd, b.bgEnd),
    border: lerpStr(a.border, b.border),
    shadow: lerpStr(a.shadow, b.shadow),
    ring: lerpStr(a.ring, b.ring),
    textColor: lerpStr(a.textColor, b.textColor),
    linkColor: lerpStr(a.linkColor, b.linkColor),
    linkHoverColor: lerpStr(a.linkHoverColor, b.linkHoverColor),
    headerBorder: lerpStr(a.headerBorder, b.headerBorder),
    headerShadow: lerpStr(a.headerShadow, b.headerShadow),
    grainOpacity: lerp(a.grainOpacity, b.grainOpacity, t),
  };
}

export function getLocalHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

// Import React for the hook (avoids circular deps since this is a lib module)
import React from "react";