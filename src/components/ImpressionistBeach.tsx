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

const ImpressionistBeach: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const horizonY = canvas.height * 0.58;

    const clouds: Cloud[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width * 1.3 - canvas.width * 0.15,
      y: canvas.height * 0.05 + Math.random() * canvas.height * 0.25,
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
      const sunY = horizonY - 20;

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
      const seaTop = horizonY + 5;
      const seaBottom = horizonY + canvas.height * 0.25;

      ctx.save();
      ctx.shadowBlur = 0;

      const seaGrad = ctx.createLinearGradient(0, seaTop, 0, seaBottom);
      seaGrad.addColorStop(0, "#7AADAD");
      seaGrad.addColorStop(0.3, "#71A0A0");
      seaGrad.addColorStop(0.6, "#6B9895");
      seaGrad.addColorStop(1, "#689090");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaTop, canvas.width, seaBottom - seaTop);

      for (const w of waves) {
        ctx.strokeStyle = `rgba(170, 210, 210, ${0.08 + waves.indexOf(w) * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = seaTop + 10 + waves.indexOf(w) * 18 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      for (const w of waves.slice(2)) {
        ctx.strokeStyle = `rgba(140, 190, 190, ${0.05 + waves.indexOf(w) * 0.015})`;
        ctx.lineWidth = 15;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 6) {
          const y = seaTop + 30 + waves.indexOf(w) * 25 + Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude * 1.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawFoamLine = (time: number) => {
      const foamY = horizonY + 8;

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
      const beachTop = horizonY + canvas.height * 0.22;

      const wetSand = ctx.createLinearGradient(0, beachTop, 0, beachTop + canvas.height * 0.08);
      wetSand.addColorStop(0, "#8A8A80");
      wetSand.addColorStop(0.5, "#9E9688");
      wetSand.addColorStop(1, "#B0A08A");
      ctx.fillStyle = wetSand;
      ctx.fillRect(0, beachTop, canvas.width, canvas.height * 0.08);

      const dampSand = ctx.createLinearGradient(0, beachTop + canvas.height * 0.08, 0, beachTop + canvas.height * 0.2);
      dampSand.addColorStop(0, "#B0A08A");
      dampSand.addColorStop(0.5, "#C0B090");
      dampSand.addColorStop(1, "#C8B898");
      ctx.fillStyle = dampSand;
      ctx.fillRect(0, beachTop + canvas.height * 0.08, canvas.width, canvas.height * 0.12);

      const drySand = ctx.createLinearGradient(0, beachTop + canvas.height * 0.2, 0, canvas.height);
      drySand.addColorStop(0, "#C8B898");
      drySand.addColorStop(0.3, "#D0C0A0");
      drySand.addColorStop(0.7, "#D4C4A4");
      drySand.addColorStop(1, "#D8C8A8");
      ctx.fillStyle = drySand;
      ctx.fillRect(0, beachTop + canvas.height * 0.2, canvas.width, canvas.height - beachTop - canvas.height * 0.2);

      ctx.save();
      ctx.shadowBlur = 6;
      for (let i = 0; i < 4; i++) {
        const alpha = 0.08 - i * 0.015;
        if (alpha <= 0) continue;
        const y = beachTop + canvas.height * 0.02 + i * canvas.height * 0.03;
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

    const render = (time: number) => {
      drawSky();

      for (const c of clouds) {
        drawCloud(c);
      }

      drawSunGlow();
      drawSea(time);
      drawFoamLine(time);
      drawBeach(time);
    };

    const update = () => {
      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > canvas.width + c.width) {
          c.x = -c.width;
          c.y = canvas.height * 0.05 + Math.random() * canvas.height * 0.25;
        }
      }
    };

    const loop = (time: number) => {
      update();
      render(time);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
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