import { useEffect, useRef } from "react";
import { useCalmMotion } from "./useReducedMotion";

type Trail = { x: number; y: number; life: number; rot: number; size: number };

/**
 * Custom nature cursor: a glowing leaf that follows the pointer with easing,
 * blooms over interactive elements, drops a fading trail of leaf particles,
 * and bursts a small ripple of leaves on click. Fine pointers only.
 */
export default function LeafCursor() {
  const calm = useCalmMotion();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (calm) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("has-leaf-cursor");

    const dot = dotRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const target = { x: w / 2, y: h / 2 };
    const pos = { x: w / 2, y: h / 2 };
    const trail: Trail[] = [];
    const ripples: (Trail & { vx: number; vy: number })[] = [];
    let lastDrop = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest("a, button, input, select, textarea, [role='button'], label");
      dot.dataset.state = interactive ? "bloom" : "leaf";
    };

    const onDown = (e: PointerEvent) => {
      dot.dataset.press = "1";
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
        const sp = 1.8 + Math.random() * 2.4;
        ripples.push({
          x: e.clientX, y: e.clientY, life: 1,
          rot: Math.random() * Math.PI * 2,
          size: 5 + Math.random() * 5,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        });
      }
    };
    const onUp = () => { dot.dataset.press = "0"; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    const leaf = (x: number, y: number, size: number, rot: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(74, 190, 110, 1)";
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.85, -size * 0.15, 0, size);
      ctx.quadraticCurveTo(-size * 0.85, -size * 0.15, 0, -size);
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    const loop = (now: number) => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      if (now - lastDrop > 45) {
        lastDrop = now;
        trail.push({ x: pos.x, y: pos.y, life: 1, rot: Math.random() * Math.PI * 2, size: 3 + Math.random() * 3 });
        if (trail.length > 26) trail.shift();
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life -= 0.028;
        p.y += 0.35;
        p.rot += 0.04;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        leaf(p.x, p.y, p.size, p.rot, p.life * 0.55);
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const p = ripples[i];
        p.life -= 0.022;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.97;
        p.rot += 0.12;
        if (p.life <= 0) { ripples.splice(i, 1); continue; }
        leaf(p.x, p.y, p.size, p.rot, p.life * 0.8);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-leaf-cursor");
    };
  }, [calm]);

  if (calm) return null;

  return (
    <div aria-hidden className="leaf-cursor-root pointer-events-none fixed inset-0 z-[9999]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div ref={dotRef} className="leaf-cursor" data-state="leaf" data-press="0">
        <svg viewBox="0 0 24 24" className="leaf-cursor-leaf">
          <path d="M20 3s-9 0-13.5 4.5S3 20 3 20s9 0 13.5-4.5S20 3 20 3z" fill="currentColor" />
          <path d="M6 18L15 9" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 24 24" className="leaf-cursor-bloom">
          {[0, 60, 120, 180, 240, 300].map((d) => (
            <ellipse key={d} cx="12" cy="6.5" rx="3" ry="5" fill="currentColor" transform={`rotate(${d} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="2.6" fill="rgba(255,225,120,1)" />
        </svg>
      </div>
    </div>
  );
}
