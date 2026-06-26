"use client";

import { useEffect, useRef } from "react";

/**
 * Confetti léger sur canvas, sans dépendance externe.
 * Affiche une pluie de confettis pendant ~2.5s puis s'auto-nettoie.
 */
export function Confetti({ fire }: { fire: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fire <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const colors = ["#6d5bd0", "#3fb27f", "#e8b339", "#d65b78", "#4aa6e0"];
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    type P = {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rot: number; vrot: number; shape: number;
    };

    const N = 140;
    const parts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.3,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 0 : 1,
    }));

    let raf = 0;
    let start = performance.now();
    let alive = true;

    function frame(now: number) {
      if (!alive) return;
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // léère gravité
        p.rot += p.vrot;
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        const fade = elapsed > 1800 ? Math.max(0, 1 - (elapsed - 1800) / 700) : 1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (elapsed > 2500) {
        ctx.clearRect(0, 0, W, H);
        alive = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden
    />
  );
}