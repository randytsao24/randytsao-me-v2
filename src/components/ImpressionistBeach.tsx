import React, { FC, useEffect, useRef } from "react";

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Wave {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
}

// ---- Phase 2: shoreline "lapping wash" ----
// A "tongue" is one sheet of water that slides down onto the sand and recedes.
// 2–3 of these overlap across the width at incommensurate periods/centers so the
// shoreline arrives UNEVENLY along its length (never a rigid horizontal bar).
interface Tongue {
  centerFrac: number; // horizontal center, fraction of width
  widthFrac: number; // gaussian sigma across x, fraction of width
  period: number; // seconds per lap (8–14s+, slow)
  phase: number; // cycle offset, fraction of a period (0..1)
  reachFrac: number; // base max reach BELOW seam, fraction of H (each <= 0.06)
}

// Per-viewport-height config, derived in configureWash() (resize-time, not per
// frame). Short viewports keep the wash shorter/lower and quieter.
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
  H: number;
  horizonY: number; // live sky/sea meeting line (kills the stale-horizonY bug)
  skyBottom: number;
  seaBottom: number; // drawn a few px PAST seamY for an explicit overlap
  seamY: number; // beach top; Phase 2's wash will anchor here
  beachTopFrac: number;
  wetStripBottom: number;
  beachBottom: number; // LITERAL canvas.height — never a computed fraction
}

const ImpressionistBeach: FC = () => {
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

    const tongues: Tongue[] = [
      { centerFrac: 0.24, widthFrac: 0.22, period: 10.5, phase: 0.0, reachFrac: 0.055 },
      { centerFrac: 0.6, widthFrac: 0.28, period: 13.7, phase: 0.37, reachFrac: 0.05 },
      { centerFrac: 0.85, widthFrac: 0.18, period: 21.0, phase: 0.72, reachFrac: 0.045 },
    ];

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
      const short = canvas.height < 600;
      washCfg = {
        reachScale: short ? 0.6 : 1.0,
        waterAlpha: short ? 0.7 : 1.0, // master multiplier on the body gradient
        dampPeak: short ? 0.18 : 0.26,
        foamPeak: short ? 0.26 : 0.38,
      };
    };

    // Derive all band pixels from LIVE dimensions, once per frame. Boundaries are
    // Math.round()'d so adjacent bands share an integer seam (no hairline gaps).
    // The last band's bottom is the literal canvas.height, which is what
    // structurally prevents the old zero-height warm-sand fill.
    // MUST be defined before resize() which calls it to build the static cache.
    const computeGeom = (): Geom => {
      const H = canvas.height;
      const skyBottom = Math.round(SKY_END * H);
      const seamY = Math.round(SEA_END * H);
      const g: Geom = {
        H,
        horizonY: skyBottom,
        skyBottom,
        seamY,
        seaBottom: seamY + 4, // explicit overlap: sea draws past beach top
        beachTopFrac: SEA_END,
        wetStripBottom: Math.round(WET_END * H),
        beachBottom: canvas.height,
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

    const clouds: Cloud[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width * 1.3 - canvas.width * 0.15,
      y: (CLOUD_Y_MIN + Math.random() * CLOUD_Y_RANGE) * canvas.height,
      width: 80 + Math.random() * 200,
      height: 20 + Math.random() * 50,
      speed: 0.03 + Math.random() * 0.06,
      opacity: 0.15 + Math.random() * 0.2,
    }));

    const waves: Wave[] = [
      { amplitude: 4, frequency: 0.008, speed: 0.0006, phase: 0 },
      { amplitude: 3, frequency: 0.012, speed: 0.0008, phase: 1.5 },
      { amplitude: 2.5, frequency: 0.015, speed: 0.001, phase: 3 },
      { amplitude: 1.5, frequency: 0.02, speed: 0.0012, phase: 4.5 },
      { amplitude: 6, frequency: 0.005, speed: 0.0004, phase: 0.8 },
    ];

    const drawSky = () => {
      const horizonY = geom.horizonY;
      const grad = ctx.createLinearGradient(0, 0, 0, horizonY + 30);
      grad.addColorStop(0, "#87CEEB");
      grad.addColorStop(0.25, "#98D4D9");
      grad.addColorStop(0.5, "#A3DBD8");
      grad.addColorStop(0.75, "#9BC7C5");
      grad.addColorStop(1, "#8BB5B4");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, horizonY + 30);
    };

    const drawSunGlow = () => {
      const sunX = canvas.width * 0.65;
      const sunY = geom.horizonY - 20;

      const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, canvas.height * 0.6);
      grad.addColorStop(0, "rgba(255, 245, 220, 0.25)");
      grad.addColorStop(0.1, "rgba(255, 240, 210, 0.15)");
      grad.addColorStop(0.3, "rgba(255, 230, 190, 0.06)");
      grad.addColorStop(0.6, "rgba(220, 220, 200, 0.02)");
      grad.addColorStop(1, "rgba(200, 200, 180, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.shadowBlur = 60;
      ctx.shadowColor = "rgba(255, 235, 190, 0.4)";
      ctx.fillStyle = "rgba(255, 240, 210, 0.2)";
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, 40, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawCloud = (c: Cloud) => {
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(255, 255, 255, 0.15)";
      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;

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

    const drawSea = (time: number) => {
      const seaTop = geom.skyBottom; // flush with sky bottom — no gap
      const seaBottom = geom.seaBottom; // a few px past beach top (explicit overlap)

      ctx.save();
      ctx.shadowBlur = 0;

      const seaGrad = ctx.createLinearGradient(0, seaTop, 0, seaBottom);
      seaGrad.addColorStop(0, "#7AADAD");
      seaGrad.addColorStop(0.3, "#71A0A0");
      seaGrad.addColorStop(0.6, "#6B9895");
      seaGrad.addColorStop(1, "#689090");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaTop, canvas.width, seaBottom - seaTop);

      waves.forEach((w, i) => {
        ctx.strokeStyle = `rgba(170, 210, 210, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = seaTop + 10 + i * 18 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      for (const w of waves.slice(2)) {
        const i = waves.indexOf(w);
        ctx.strokeStyle = `rgba(140, 190, 190, ${0.05 + i * 0.015})`;
        ctx.lineWidth = 15;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 6) {
          const y = seaTop + 30 + i * 25 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude * 1.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawFoamLine = (time: number) => {
      const foamY = geom.horizonY + 8;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(220, 240, 240, 0.12)";

      ctx.strokeStyle = "rgba(200, 230, 230, 0.12)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 3) {
        const y = foamY + Math.sin(x * 0.006 + time * 0.0005) * 3 + Math.sin(x * 0.015 + time * 0.0007) * 1.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(240, 250, 250, 0.08)";
      ctx.lineWidth = 12;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 6) {
        const y = foamY + 2 + Math.sin(x * 0.005 + time * 0.0004 + 1) * 2.5 + Math.sin(x * 0.013 + time * 0.0006 + 2) * 1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    };

    const drawBeach = (time: number) => {
      const { seamY, wetStripBottom, beachBottom, H } = geom;

      // THIN wet strip at the seam (~3% of H). Cooler/darker tone as the wet
      // transition off the sea — a sliver, NOT the dominant beach color.
      const wetSand = ctx.createLinearGradient(0, seamY, 0, wetStripBottom);
      wetSand.addColorStop(0, "#9E9688");
      wetSand.addColorStop(1, "#B0A08A");
      ctx.fillStyle = wetSand;
      ctx.fillRect(0, seamY, canvas.width, wetStripBottom - seamY);

      // WARM dry sand fills the ENTIRE rest down to the literal canvas bottom.
      // This is the band that was previously zero-height; it is now the bulk of
      // the beach. Height is derived (beachBottom - wetStripBottom), never literal.
      const drySand = ctx.createLinearGradient(0, wetStripBottom, 0, beachBottom);
      drySand.addColorStop(0, "#C8B898");
      drySand.addColorStop(0.3, "#D0C0A0");
      drySand.addColorStop(0.7, "#D4C4A4");
      drySand.addColorStop(1, "#D8C8A8");
      ctx.fillStyle = drySand;
      ctx.fillRect(0, wetStripBottom, canvas.width, beachBottom - wetStripBottom);

      ctx.save();
      ctx.shadowBlur = 6;
      for (let i = 0; i < 4; i++) {
        const alpha = 0.08 - i * 0.015;
        if (alpha <= 0) continue;
        // Re-anchored to the warm-sand region so the texture sits ON the warm
        // sand (below the wet strip), not off-screen as before.
        const y = wetStripBottom + H * 0.02 + i * H * 0.03;
        ctx.strokeStyle = `rgba(180, 170, 155, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 6) {
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
      if (p < 0.35) {
        const x = p / 0.35;
        return 1 - Math.pow(1 - x, 3); // easeOutCubic: fast arrival
      }
      const x = (p - 0.35) / 0.65;
      return 1 - Math.pow(x, 3); // 1 -> 0, slow at the start (water lingers, then drains)
    };

    // The lapping wash. ONE save/restore, explicit source-over (NOT "lighter" —
    // that blows foam to white). Sub-order: damp memory -> water sheet -> foam.
    // Strictly confined to seamY .. seamY + 0.06*H (≈0.80–0.86H); never climbs
    // above the seam, never near the content cards (which bottom out ~0.65H).
    const drawShoreWash = (time: number, animated: boolean) => {
      if (!animated) return; // resting frame = plain beach (no tongues, no tint)

      const t = time / 1000; // seconds, off the SAME rAF clock as every other draw
      const { seamY, H } = geom;
      const W = canvas.width;
      const cols = lastWet.length;
      const maxReachAbs = 0.06 * H; // hard clamp: leading edge never passes 0.86H
      const coverThresh = 0.004 * H; // below this depth a column doesn't count as wet

      // Never-repeating reach: sum of incommensurate low-freq sines, mapped to
      // [0.6, 1.0] so some laps reach further than others.
      const reachMod =
        0.8 +
        0.2 *
          (0.4 * Math.sin((t / 17.3) * TWO_PI) +
            0.35 * Math.sin((t / 29.1) * TWO_PI + 1.3) +
            0.25 * Math.sin((t / 41.7) * TWO_PI + 2.7));

      // Each tongue's eased reach position this frame (one value per tongue).
      const pos = tongues.map((tg) => easeReach(((t / tg.period) + tg.phase) % 1));

      // O(width) pass 1: leading edge per column + damp-memory bookkeeping.
      for (let col = 0; col < cols; col++) {
        const x = col * WASH_STEP;
        let depth = 0; // px below seam, = max over the overlapping tongues at this x
        for (let i = 0; i < tongues.length; i++) {
          const tg = tongues[i];
          const dx = (x - tg.centerFrac * W) / (tg.widthFrac * W);
          const gauss = Math.exp(-0.5 * dx * dx); // gaussian falloff across the width
          const d = tg.reachFrac * H * pos[i] * reachMod * gauss * washCfg.reachScale;
          if (d > depth) depth = d;
        }
        if (depth > maxReachAbs) depth = maxReachAbs;
        washEdge[col] = depth;

        if (depth > coverThresh) {
          // New episode (was fully dry) resets remembered reach; otherwise grow it
          // so the damp band records the FURTHEST the water came this lap.
          if (t - lastWet[col] > WASH_FADE_SECONDS) wetReach[col] = depth;
          else if (depth > wetReach[col]) wetReach[col] = depth;
          lastWet[col] = t;
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "source-over"; // explicit: never "lighter"

      // 1. Damp-sand memory — where the water RECENTLY reached and is now drying.
      // Drawn as a single filled path (not per-column rects) to avoid grid-line
      // artifacts from adjacent rects with slightly different alphas overlapping.
      // Uniform alpha: the visual drying comes from the shrinking reach over time,
      // not from per-column alpha variation.
      // Rendered in two passes: first a sharp-edged fill for the body, then a
      // feathered shadow pass so the top edge at the waterline stays crisp.
      const dampAlpha = washCfg.dampPeak;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.fillStyle = `rgba(120, 92, 58, ${dampAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(0, seamY);
      let inRun = false;
      for (let col = 0; col < cols; col++) {
        const age = t - lastWet[col];
        if (age < WASH_FADE_SECONDS && wetReach[col] > 0) {
          const x = col * WASH_STEP;
          if (!inRun) {
            ctx.lineTo(x, seamY); // top edge along the seam
            inRun = true;
          }
          ctx.lineTo(x, seamY + wetReach[col]); // wavy bottom follows the reach
        } else if (inRun) {
          // Close this run: go up to seamY at the last wet column
          const x = (col - 1) * WASH_STEP;
          ctx.lineTo(x, seamY);
          inRun = false;
        }
      }
      if (inRun) {
        ctx.lineTo((cols - 1) * WASH_STEP, seamY);
      }
      ctx.closePath();
      ctx.fill();

      // 2. The water BODY — one filled path (flat top at the waterline, wavy
      // bottom = the leading edge), filled with a single vertical gradient so it
      // reads as a MASS with volume: denser & sea-coloured near the seam (visually
      // continuous with the sea above), thinning as it spreads up the beach. This
      // is the fix for "a wire moving up and down" — it's a connected sheet now.
      const m = washCfg.waterAlpha; // master multiplier
      const bodyGrad = ctx.createLinearGradient(0, seamY, 0, seamY + maxReachAbs);
      bodyGrad.addColorStop(0, `rgba(108, 146, 144, ${(0.5 * m).toFixed(3)})`); // at sea edge
      bodyGrad.addColorStop(0.5, `rgba(126, 164, 159, ${(0.34 * m).toFixed(3)})`);
      bodyGrad.addColorStop(1, `rgba(150, 184, 178, ${(0.14 * m).toFixed(3)})`); // thin frontier
      ctx.shadowBlur = 0;
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, seamY);
      for (let col = 0; col < cols; col++) {
        ctx.lineTo(col * WASH_STEP, seamY + washEdge[col]); // wavy leading edge L->R
      }
      ctx.lineTo((cols - 1) * WASH_STEP, seamY); // up to the top-right
      ctx.closePath(); // back along the flat waterline to (0, seamY)
      ctx.fill();

      // 3. Foam lip — a soft warm off-white line riding the leading edge (the
      // wave's crest), feathered. Continuous along each wet run, broken where the
      // wash falls back to nothing between tongues. No pure white.
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(242, 239, 230, 0.3)";
      ctx.strokeStyle = `rgba(242, 239, 230, ${washCfg.foamPeak.toFixed(3)})`;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const foamMin = 0.012 * H; // tongue must have arrived this far to grow foam
      ctx.beginPath();
      let penDown = false;
      for (let col = 0; col < cols; col++) {
        const depth = washEdge[col];
        if (depth > foamMin) {
          const px = col * WASH_STEP;
          const py = seamY + depth;
          if (!penDown) {
            ctx.moveTo(px, py);
            penDown = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          penDown = false; // break the lip where the water has pulled back
        }
      }
      ctx.stroke();

      ctx.restore();
    };

    const render = (time: number, animated: boolean) => {
      geom = computeGeom(); // recompute pixels from live dimensions, once per frame

      drawSky();

      for (const c of clouds) {
        drawCloud(c);
      }

      drawSunGlow();
      drawSea(time);
      drawFoamLine(time);
      drawBeach(time);
      drawShoreWash(time, animated); // AFTER the beach; skipped on the static frame
    };

    // One resting frame = the plain beach with the wash drained to nothing.
    const renderStatic = () => render(performance.now(), false);

    const update = () => {
      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > canvas.width + c.width) {
          c.x = -c.width;
          c.y = (CLOUD_Y_MIN + Math.random() * CLOUD_Y_RANGE) * canvas.height;
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