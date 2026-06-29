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
  xOffset: number;
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
      { xOffset: 0, amplitude: 4, frequency: 0.008, speed: 0.0006, phase: 0 },
      { xOffset: 0, amplitude: 3, frequency: 0.012, speed: 0.0008, phase: 1.5 },
      { xOffset: 0, amplitude: 2.5, frequency: 0.015, speed: 0.001, phase: 3 },
      { xOffset: 0, amplitude: 1.5, frequency: 0.02, speed: 0.0012, phase: 4.5 },
      { xOffset: 0, amplitude: 6, frequency: 0.005, speed: 0.0004, phase: 0.8 },
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

    const drawShore = (time: number) => {
      const shoreTop = horizonY + canvas.height * 0.22;

      const shoreGrad = ctx.createLinearGradient(0, shoreTop, 0, canvas.height);
      shoreGrad.addColorStop(0, "#8BB8A8");
      shoreGrad.addColorStop(0.2, "#92B8A5");
      shoreGrad.addColorStop(0.5, "#A0BEAC");
      shoreGrad.addColorStop(0.8, "#A8C0B0");
      shoreGrad.addColorStop(1, "#A5BDA8");
      ctx.fillStyle = shoreGrad;
      ctx.fillRect(0, shoreTop, canvas.width, canvas.height - shoreTop);

      ctx.save();
      ctx.shadowBlur = 8;
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(180, 210, 200, ${0.1 - i * 0.025})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 6) {
          const y = shoreTop + 10 + i * 20 + Math.sin(x * 0.01 + time * 0.0005 + i) * 3 + Math.cos(x * 0.007 + time * 0.0003 + i) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSand = (time: number) => {
      const sandTop = canvas.height * 0.88;
      const sandGrad = ctx.createLinearGradient(0, sandTop - 20, 0, canvas.height);
      sandGrad.addColorStop(0, "rgba(180, 170, 150, 0)");
      sandGrad.addColorStop(0.3, "rgba(180, 165, 140, 0.15)");
      sandGrad.addColorStop(0.6, "rgba(175, 160, 135, 0.25)");
      sandGrad.addColorStop(1, "rgba(170, 155, 130, 0.3)");
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, sandTop - 20, canvas.width, canvas.height - sandTop + 20);

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 0, 0, 0.04)";
      ctx.strokeStyle = "rgba(190, 180, 160, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 8) {
        const y = sandTop + Math.sin(x * 0.02 + time * 0.0002) * 2 + Math.sin(x * 0.04 + time * 0.0001) * 1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
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
      drawShore(time);
      drawSand(time);
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
