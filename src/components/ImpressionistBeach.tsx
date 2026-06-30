import React, { FC, useEffect, useRef } from "react";
import { Palette, DAY_PALETTE, getLocalHour, paletteForHour, KEYFRAMES } from "../lib/palette";

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number; // 0.04–0.12
}

interface Wave {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
}

// ---- Phase 2: shoreline "lapping wash" ----
// A single continuous water sheet spans the full width. The leading edge is
// shaped by multiple superimposed spatial sine waves at incommensurate
// frequencies — each also drifts slowly over time — so the shoreline arrives
// unevenly along its length without ever breaking into disconnected blobs.
// One global easeReach cycle drives the overall advance/recede rhythm.
interface WashCfg {
  reachScale: number; // multiplies every tongue's reach
  waterAlpha: number; // translucent sheet alpha
  dampPeak: number; // peak alpha of the damp-sand memory tint
  foamPeak: number; // peak alpha of the leading-edge foam crest
}

const WASH_STEP = 5; // px between sampled columns for the damp-sand memory buffer
const WASH_FADE_SECONDS = 2.0; // damp sand stays darkened this long after water recedes
const TWO_PI = Math.PI * 2;

// Band boundary FRACTIONS of canvas height — the single source of truth for
// vertical layout. Pixels are derived live per-frame (see computeGeom), never
// stored across frames, so resize can never desync the bands.
const SKY_END = 0.6; // sky occupies 0 -> 0.60H; horizon sits here
const SEA_END = 0.8; // sea occupies SKY_END -> 0.80H; beach is 0.80H -> 1.0
const WET_END = 0.83; // thin wet strip occupies SEA_END -> 0.83H (~3% of H)

// Clouds drift in the upper sky. Single source for the y spawn range so the
// init and recycle paths can't desync from each other or from the horizon.
const CLOUD_Y_MIN = 0.05; // top of cloud band, fraction of H
const CLOUD_Y_RANGE = 0.25; // vertical spread of cloud band, fraction of H

interface Geom {
  W: number; // CSS-pixel canvas width (backing store width / dpr)
  H: number; // CSS-pixel canvas height (backing store height / dpr)
  horizonY: number; // live sky/sea meeting line (kills the stale-horizonY bug)
  skyBottom: number;
  seaBottom: number; // drawn a few px PAST seamY for an explicit overlap
  seamY: number; // beach top; Phase 2's wash will anchor here
  beachTopFrac: number;
  wetStripBottom: number;
  beachBottom: number; // LITERAL canvas CSS-pixel height — never a computed fraction
}

interface ImpressionistBeachProps {
  palette?: Palette;
}

const ImpressionistBeach: FC<ImpressionistBeachProps> = ({
  palette: paletteProp,
}) => {
  // Hold the current palette in a ref so the rAF loop always reads the latest
  // without needing to close over React state.
  const paletteRef = useRef<Palette>(paletteProp ?? DAY_PALETTE);

  // Sync prop → ref. When parent drives the palette (living-light mode),
  // this is the only React re-render path; the rAF loop stays decoupled.
  useEffect(() => {
    if (paletteProp) {
      paletteRef.current = paletteProp;
    }
  }, [paletteProp]);

  // If no prop supplied, self-drive from local clock (backward-compat / standalone).
  // This also covers the HMR case where the prop hasn't been wired yet.
  useEffect(() => {
    if (paletteProp) return; // parent drives it
    let id: number;
    const tick = () => {
      paletteRef.current = paletteForHour(KEYFRAMES, getLocalHour());
      // When self-driving with only day keyframes, palette is constant.
      // Stop the interval early to save cycles.
      if (KEYFRAMES.length <= 2) {
        clearInterval(id);
        return;
      }
    };
    tick();
    id = window.setInterval(tick, 500);
    return () => clearInterval(id);
  }, [paletteProp]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let running = false; // is the rAF loop scheduled?
    let ready = false; // becomes true once all draw fns are defined (TDZ guard)

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    // DPR for Retina rendering. Derived once per resize; draw coordinates stay
    // in CSS pixels (ctx.scale handles the physical mapping).
    let dpr = window.devicePixelRatio || 1;

    // Damp-sand memory: O(width) per-column buffers, NOT getImageData/offscreen.
    // lastWet[col] = seconds-clock value when that column was last under water.
    // wetReach[col] = px depth below seam the water reached during that episode.
    // washEdge[col] = THIS frame's leading-edge depth below seam (px).
    // Sized to logical width (canvas.width / dpr) and realloc'd on resize.
    let lastWet = new Float32Array(0);
    let wetReach = new Float32Array(0);
    let washEdge = new Float32Array(0);

    // Filled by configureWash() from canvas.height; read per-frame by the wash.
    // waterAlpha is now a MASTER multiplier (0..1) on the water-body gradient,
    // not a flat fill alpha — the body has volume via its own vertical gradient.
    let washCfg: WashCfg = { reachScale: 1, waterAlpha: 1.0, dampPeak: 0.26, foamPeak: 0.38 };

    const allocWashBuffers = () => {
      const logicalW = Math.round(canvas.width / dpr);
      const cols = Math.ceil(logicalW / WASH_STEP);
      lastWet = new Float32Array(cols);
      lastWet.fill(-1e9); // sentinel: "never wet" => age >> fade => never drawn
      wetReach = new Float32Array(cols); // 0 = no remembered reach
      washEdge = new Float32Array(cols);
    };

    // Short viewports: keep the wash shorter/lower AND quieter. Derived once per
    // resize, never per-frame (no innerHeight reads inside the rAF loop).
    const configureWash = () => {
      const short = canvas.height / dpr < 600;
      washCfg = {
        reachScale: short ? 0.6 : 1.0,
        waterAlpha: short ? 0.7 : 1.0, // master multiplier on the body gradient
        dampPeak: short ? 0.18 : 0.26,
        foamPeak: short ? 0.26 : 0.38,
      };
    };

    // Derive all band pixels from LIVE dimensions, once per frame. Boundaries are
    // Math.round()'d so adjacent bands share an integer seam (no hairline gaps).
    // The last band's bottom is the literal CSS-pixel canvas height, which is what
    // structurally prevents the old zero-height warm-sand fill.
    // MUST be defined before resize() which calls it to build the static cache.
    const computeGeom = (): Geom => {
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      const skyBottom = Math.round(SKY_END * cssH);
      const seamY = Math.round(SEA_END * cssH);
      const g: Geom = {
        W: cssW,
        H: cssH,
        horizonY: skyBottom,
        skyBottom,
        seamY,
        seaBottom: seamY + 4, // explicit overlap: sea draws past beach top
        beachTopFrac: SEA_END,
        wetStripBottom: Math.round(WET_END * cssH),
        beachBottom: cssH,
      };

      // Dev assert: the band-coverage invariant must hold (strictly increasing
      // boundaries => no gaps, no zero-height fills). Load-bearing, not cosmetic.
      if (process.env.NODE_ENV !== "production") {
        const bounds = [g.skyBottom, g.seamY, g.wetStripBottom, g.beachBottom];
        for (let i = 1; i < bounds.length; i++) {
          if (bounds[i] <= bounds[i - 1]) {
            // eslint-disable-next-line no-console
            console.warn("ImpressionistBeach: non-increasing band boundaries", bounds);
            break;
          }
        }
      }

      return g;
    };

    // Live geometry, recomputed each frame by render() and on resize for the
    // static cache. Must be declared before any function that references it.
    let geom: Geom = computeGeom();

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // all draw coords now in CSS pixels

      allocWashBuffers(); // tracks logical width
      configureWash(); // tracks height for short-viewport gating
      // The loop isn't running under reduced-motion, so refresh the static frame
      // to pick up the new size. Guarded by `ready` to avoid TDZ on first call.
      if (ready && mql.matches) renderStatic();
    };
    resize();
    window.addEventListener("resize", resize);

    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    const clouds: Cloud[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * cssW * 1.3 - cssW * 0.15,
      y: (CLOUD_Y_MIN + Math.random() * CLOUD_Y_RANGE) * cssH,
      width: 80 + Math.random() * 200,
      height: 20 + Math.random() * 50,
      speed: 0.03 + Math.random() * 0.06,
      opacity: 0.15 + Math.random() * 0.2,
    }));

    // Stars: 25 faint stippled dots in the upper sky, only visible at night.
    // Reuses the cloud-array thinking — generated once, drawn per-frame.
    const stars: Star[] = Array.from({ length: 25 }, () => ({
      x: Math.random() * cssW,
      y: (CLOUD_Y_MIN + Math.random() * CLOUD_Y_RANGE * 0.8) * cssH,
      radius: 0.6 + Math.random() * 1.2,
      baseOpacity: 0.04 + Math.random() * 0.08,
    }));

    const waves: Wave[] = [
      { amplitude: 4, frequency: 0.008, speed: 0.0006, phase: 0 },
      { amplitude: 3, frequency: 0.012, speed: 0.0008, phase: 1.5 },
      { amplitude: 2.5, frequency: 0.015, speed: 0.001, phase: 3 },
      { amplitude: 1.5, frequency: 0.02, speed: 0.0012, phase: 4.5 },
      { amplitude: 6, frequency: 0.005, speed: 0.0004, phase: 0.8 },
    ];

    const drawSky = () => {
      const { W, horizonY } = geom;
      const p = paletteRef.current;
      const grad = ctx.createLinearGradient(0, 0, 0, horizonY + 30);
      grad.addColorStop(0, p.skyTop);
      grad.addColorStop(0.25, p.skyMid1);
      grad.addColorStop(0.5, p.skyMid2);
      grad.addColorStop(0.75, p.skyMid3);
      grad.addColorStop(1, p.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, horizonY + 30);
    };

    const drawSunGlow = () => {
      const { W, H, horizonY } = geom;
      const p = paletteRef.current;
      const sunX = W * p.sunXFrac;
      const sunY = horizonY - p.sunYOffset;

      const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.6);
      grad.addColorStop(0, p.sunGlowInner);
      grad.addColorStop(0.1, p.sunGlowMid);
      grad.addColorStop(0.3, p.sunGlowOuter);
      grad.addColorStop(0.6, p.sunGlowFar);
      grad.addColorStop(1, p.sunGlowEdge);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.shadowBlur = 60;
      ctx.shadowColor = p.sunEllipseShadow;
      ctx.fillStyle = p.sunEllipseFill;
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, p.sunRadiusX, p.sunRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawCloud = (c: Cloud) => {
      const p = paletteRef.current;
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = p.cloudShadow;
      ctx.fillStyle = `rgba(${Math.round(p.cloudFillR)},${Math.round(p.cloudFillG)},${Math.round(p.cloudFillB)},${c.opacity})`;

      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(c.x - c.width * 0.2, c.y + c.height * 0.1, c.width * 0.35, c.height * 0.45, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(c.x + c.width * 0.25, c.y - c.height * 0.05, c.width * 0.3, c.height * 0.4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(c.x + c.width * 0.1, c.y - c.height * 0.15, c.width * 0.25, c.height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    /**
     * Stars — 25 faint stippled dots only visible at night.
     * Opacity fades in from 21:00–22:00 and out from 04:00–05:00,
     * with a small per-star sine wobble for organic variety.
     */
    const starVisibility = (hour: number): number => {
      if (hour >= 22 || hour < 4) return 1.0;
      if (hour >= 21 && hour < 22) return (hour - 21) / 1.0;
      if (hour >= 4 && hour < 5) return 1.0 - (hour - 4) / 1.0;
      return 0;
    };

    const drawStars = (time: number) => {
      const hour = getLocalHour();
      const vis = starVisibility(hour);
      if (vis <= 0.001) return;

      const p = paletteRef.current;
      const starColor = `rgba(${Math.round(p.cloudFillR)},${Math.round(p.cloudFillG)},${Math.round(p.cloudFillB)},`;

      for (const s of stars) {
        const wobble = 0.85 + 0.15 * Math.sin(time * 0.0002 + s.x * 0.01);
        const alpha = s.baseOpacity * vis * wobble;
        if (alpha < 0.005) continue;

        ctx.save();
        ctx.fillStyle = starColor + alpha.toFixed(3) + ")";
        ctx.shadowBlur = 3;
        ctx.shadowColor = starColor + (alpha * 0.5).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawSea = (time: number) => {
      const { W, skyBottom, seaBottom } = geom;
      const seaTop = skyBottom; // flush with sky bottom — no gap
      const p = paletteRef.current;

      ctx.save();
      ctx.shadowBlur = 0;

      const seaGrad = ctx.createLinearGradient(0, seaTop, 0, seaBottom);
      seaGrad.addColorStop(0, p.seaTop);
      seaGrad.addColorStop(0.3, p.seaMid1);
      seaGrad.addColorStop(0.6, p.seaMid2);
      seaGrad.addColorStop(1, p.seaBottom);
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaTop, W, seaBottom - seaTop);

      waves.forEach((w, i) => {
        ctx.strokeStyle = `rgba(${Math.round(p.waveStroke1R)},${Math.round(p.waveStroke1G)},${Math.round(p.waveStroke1B)},${(0.08 + i * 0.02).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = seaTop + 10 + i * 18 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      for (const w of waves.slice(2)) {
        const i = waves.indexOf(w);
        ctx.strokeStyle = `rgba(${Math.round(p.waveStroke2R)},${Math.round(p.waveStroke2G)},${Math.round(p.waveStroke2B)},${(0.05 + i * 0.015).toFixed(3)})`;
        ctx.lineWidth = 15;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const y = seaTop + 30 + i * 25 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude * 1.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawFoamLine = (time: number) => {
      const { W, horizonY } = geom;
      const foamY = horizonY + 8;
      const p = paletteRef.current;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.foamShadow;

      ctx.strokeStyle = p.foamStroke1;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = foamY + Math.sin(x * 0.006 + time * 0.0005) * 3 + Math.sin(x * 0.015 + time * 0.0007) * 1.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = p.foamStroke2;
      ctx.lineWidth = 12;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = foamY + 2 + Math.sin(x * 0.005 + time * 0.0004 + 1) * 2.5 + Math.sin(x * 0.013 + time * 0.0006 + 2) * 1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    };

    const drawBeach = (time: number) => {
      const { W, H, seamY, wetStripBottom, beachBottom } = geom;
      const p = paletteRef.current;

      // THIN wet strip at the seam (~3% of H). Cooler/darker tone as the wet
      // transition off the sea — a sliver, NOT the dominant beach color.
      const wetSand = ctx.createLinearGradient(0, seamY, 0, wetStripBottom);
      wetSand.addColorStop(0, p.wetSandTop);
      wetSand.addColorStop(1, p.wetSandBottom);
      ctx.fillStyle = wetSand;
      ctx.fillRect(0, seamY, W, wetStripBottom - seamY);

      // WARM dry sand fills the ENTIRE rest down to the literal canvas bottom.
      const drySand = ctx.createLinearGradient(0, wetStripBottom, 0, beachBottom);
      drySand.addColorStop(0, p.drySandTop);
      drySand.addColorStop(0.3, p.drySandMid1);
      drySand.addColorStop(0.7, p.drySandMid2);
      drySand.addColorStop(1, p.drySandBottom);
      ctx.fillStyle = drySand;
      ctx.fillRect(0, wetStripBottom, W, beachBottom - wetStripBottom);

      ctx.save();
      ctx.shadowBlur = 6;
      for (let i = 0; i < 4; i++) {
        const alpha = 0.08 - i * 0.015;
        if (alpha <= 0) continue;
        const y = wetStripBottom + H * 0.02 + i * H * 0.03;
        ctx.strokeStyle = `rgba(${Math.round(p.sandTextureR)},${Math.round(p.sandTextureG)},${Math.round(p.sandTextureB)},${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const wy = y + Math.sin(x * 0.012 + time * 0.0004 + i) * 2 + Math.cos(x * 0.008 + time * 0.0003 + i) * 1.5;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    // Asymmetric ease of a tongue's reach over its [0,1) cycle: a quick ease-out
    // rush DOWN onto the sand (first 35%), then a slower ease-in drain back up
    // (last 65%). Returns 0..1 (fraction of the tongue's max reach). NOT a raw
    // sin() — that would read as a mechanical pulse.
    const easeReach = (p: number): number => {
      let raw: number;
      if (p < 0.35) {
        const x = p / 0.35;
        raw = 1 - Math.pow(1 - x, 3); // easeOutCubic: 0→1
      } else {
        const x = (p - 0.35) / 0.65;
        raw = 1 - Math.pow(x, 3); // easeInCubic: 1→0
      }
      // Floor at 0.025: the water never fully drains. Without this, all three
      // tongues can hit 0 simultaneously when their incommensurate cycles
      // align — the water body vanishes for a frame, then reappears as the
      // fastest tongue rises, creating a jarring left-to-right "wipe" effect.
      return 0.025 + raw * 0.975;
    };

    // The lapping wash. ONE save/restore, explicit source-over (NOT "lighter" —
    // that blows foam to white). Sub-order: damp memory -> water sheet -> foam.
    // Strictly confined to seamY .. seamY + 0.06*H (≈0.80–0.86H); never climbs
    // above the seam, never near the content cards (which bottom out ~0.65H).
    const drawShoreWash = (time: number, animated: boolean) => {
      if (!animated) return; // resting frame = plain beach (no wash)

      const t = time / 1000; // seconds
      const { W, H, seamY } = geom;
      const cols = lastWet.length;
      const maxReachAbs = 0.06 * H; // hard clamp: leading edge never passes 0.86H
      const coverThresh = 0.004 * H; // below this depth a column doesn't count as wet

      const p = paletteRef.current;

      // One global advance/recede cycle (~11s). The water sheet rises and falls
      // as a single unit — no more distinct blobs breaking apart.
      const globalCycle = easeReach((t / 11.3) % 1);

      // Slow tide-like modulation so some laps reach further than others.
      const reachMod =
        0.8 +
        0.2 *
          (0.4 * Math.sin((t / 17.3) * TWO_PI) +
            0.35 * Math.sin((t / 29.1) * TWO_PI + 1.3) +
            0.25 * Math.sin((t / 41.7) * TWO_PI + 2.7));

      const baseReach = 0.05 * H * globalCycle * reachMod * washCfg.reachScale;

      // Spatial undulation: 4 superimposed sine waves across x, each drifting
      // at its own slow temporal rate. This creates an organic, never-repeating
      // shoreline shape without ever breaking into disconnected segments.
      const spatialVar = (x: number): number => {
        const xf = x / W; // 0..1 across the width
        return (
          0.35 * Math.sin(xf * 3.7 * TWO_PI + t * 0.12) +
          0.25 * Math.sin(xf * 5.3 * TWO_PI + t * 0.08 + 1.7) +
          0.22 * Math.sin(xf * 7.1 * TWO_PI + t * 0.15 + 3.1) +
          0.18 * Math.sin(xf * 2.3 * TWO_PI + t * 0.06 + 5.4)
        );
      };

      // O(width) pass: leading edge per column + damp-memory bookkeeping.
      for (let col = 0; col < cols; col++) {
        const x = col * WASH_STEP;
        // Spatial variation ranges roughly [-0.7, 0.7] after summing 4 sines.
        // Map to [0.3, 1.0] so the water always reaches at least 30% of base
        // reach — never fully drains at any column.
        const sv = spatialVar(x);
        const spatialFactor = 0.3 + 0.7 * ((sv + 1.0) / 2.0); // 0.3..1.0
        let depth = baseReach * spatialFactor;
        if (depth > maxReachAbs) depth = maxReachAbs;
        washEdge[col] = depth;

        if (depth > coverThresh) {
          if (t - lastWet[col] > WASH_FADE_SECONDS) wetReach[col] = depth;
          else if (depth > wetReach[col]) wetReach[col] = depth;
          lastWet[col] = t;
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "source-over"; // explicit: never "lighter"

      // 1. Damp-sand memory — single filled path, always continuous. Where
      // wetReach is 0 the path sits at seamY (zero-height fill there), so the
      // shape naturally tapers off at the drying edges.
      const dampAlpha = washCfg.dampPeak;
      ctx.fillStyle = `rgba(${Math.round(p.washDampR)},${Math.round(p.washDampG)},${Math.round(p.washDampB)},${dampAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(0, seamY);
      for (let col = 0; col < cols; col++) {
        const age = t - lastWet[col];
        const reach = age < WASH_FADE_SECONDS ? wetReach[col] : 0;
        ctx.lineTo(col * WASH_STEP, seamY + Math.max(0, reach));
      }
      // Extend to full width so the right edge has no gap
      const lastReach = (() => {
        const age = t - lastWet[cols - 1];
        return age < WASH_FADE_SECONDS ? wetReach[cols - 1] : 0;
      })();
      ctx.lineTo(W, seamY + Math.max(0, lastReach));
      ctx.lineTo(W, seamY);
      ctx.closePath();
      ctx.fill();

      // 2. The water BODY — one filled path (flat top at the waterline, wavy
      // bottom = the leading edge), filled with a single vertical gradient so it
      // reads as a MASS with volume: denser & sea-coloured near the seam (visually
      // continuous with the sea above), thinning as it spreads up the beach. This
      // is the fix for "a wire moving up and down" — it's a connected sheet now.
      const m = washCfg.waterAlpha; // master multiplier
      const bodyGrad = ctx.createLinearGradient(0, seamY, 0, seamY + maxReachAbs);
      bodyGrad.addColorStop(0, `rgba(${Math.round(p.washBodyTopR)},${Math.round(p.washBodyTopG)},${Math.round(p.washBodyTopB)},${(0.5 * m).toFixed(3)})`);
      bodyGrad.addColorStop(0.5, `rgba(${Math.round(p.washBodyMidR)},${Math.round(p.washBodyMidG)},${Math.round(p.washBodyMidB)},${(0.34 * m).toFixed(3)})`);
      bodyGrad.addColorStop(1, `rgba(${Math.round(p.washBodyBottomR)},${Math.round(p.washBodyBottomG)},${Math.round(p.washBodyBottomB)},${(0.14 * m).toFixed(3)})`);
      ctx.shadowBlur = 0;
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, seamY);
      for (let col = 0; col < cols; col++) {
        ctx.lineTo(col * WASH_STEP, seamY + washEdge[col]); // wavy leading edge L->R
      }
      ctx.lineTo(W, seamY + washEdge[cols - 1]); // extend to full width
      ctx.lineTo(W, seamY); // up to the top-right corner
      ctx.closePath(); // back along the flat waterline to (0, seamY)
      ctx.fill();

      // 3. Foam lip — a soft warm off-white line riding the leading edge,
      // continuous across the full width since the water sheet never breaks.
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.washFoamShadow;
      ctx.strokeStyle = `rgba(${Math.round(p.washFoamR)},${Math.round(p.washFoamG)},${Math.round(p.washFoamB)},${washCfg.foamPeak.toFixed(3)})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, seamY + washEdge[0]);
      for (let col = 1; col < cols; col++) {
        ctx.lineTo(col * WASH_STEP, seamY + washEdge[col]);
      }
      ctx.lineTo(W, seamY + washEdge[cols - 1]); // extend to full width
      ctx.stroke();

      ctx.restore();
    };

    const render = (time: number, animated: boolean) => {
      geom = computeGeom(); // recompute pixels from live dimensions, once per frame

      drawSky();

      for (const c of clouds) {
        drawCloud(c);
      }

      drawStars(time);
      drawSunGlow();
      drawSea(time);
      drawFoamLine(time);
      drawBeach(time);
      drawShoreWash(time, animated); // AFTER the beach; skipped on the static frame
    };

    // One resting frame = the plain beach with the wash drained to nothing.
    const renderStatic = () => render(performance.now(), false);

    const update = () => {
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > cssW + c.width) {
          c.x = -c.width;
          c.y = (CLOUD_Y_MIN + Math.random() * CLOUD_Y_RANGE) * cssH;
        }
      }
    };

    const loop = (time: number) => {
      update();
      render(time, true);
      animId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return; // never stack rAF loops (HMR / repeated change events)
      running = true;
      animId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(animId);
    };

    // Reduced-motion: stop the loop and paint one clean static beach; otherwise run.
    const handleMotionPref = () => {
      if (mql.matches) {
        stop();
        renderStatic();
      } else {
        start();
      }
    };
    mql.addEventListener("change", handleMotionPref);

    ready = true; // all draw fns defined — resize() may now paint static frames
    if (mql.matches) renderStatic();
    else start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      mql.removeEventListener("change", handleMotionPref);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      aria-hidden="true"
    />
  );
};

export default ImpressionistBeach;