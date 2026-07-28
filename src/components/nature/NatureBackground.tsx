import { useEffect, useRef } from "react";
import { useIntensity } from "./useReducedMotion";

export type Weather = "sunny" | "rainy" | "cloudy" | "night";

type P = {
  x: number; y: number; vx: number; vy: number; r: number; a: number; phase: number; len: number;
};

/**
 * Full-viewport fixed animated nature layer: sky wash, sun/moon, drifting clouds,
 * birds, sunlight rays, wind-blown grass, and a canvas particle system
 * (pollen / rain / fireflies / stars) driven by the current weather.
 */
export default function NatureBackground({ weather }: { weather: Weather }) {
  const intensity = useIntensity();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef(0);
  const layerRef = useRef<HTMLDivElement | null>(null);

  /* --- parallax on scroll (transform only, rAF throttled) --- */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scrollRef.current = window.scrollY;
        const el = layerRef.current;
        if (el) el.style.setProperty("--scroll", String(window.scrollY));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* --- particle canvas --- */
  useEffect(() => {
    if (!intensity) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const counts: Record<Weather, number> = { sunny: 46, rainy: 120, cloudy: 30, night: 60 };
    const n = Math.max(8, Math.round(counts[weather] * intensity));

    const make = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: weather === "rainy" ? 5 + Math.random() * 4 : -0.12 - Math.random() * 0.22,
      r: weather === "rainy" ? 1 : 1 + Math.random() * 2.2,
      a: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      len: 8 + Math.random() * 12,
    });

    const parts: P[] = Array.from({ length: n }, make);
    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        if (weather === "rainy") {
          p.y += p.vy;
          p.x += 0.6;
          if (p.y > h) { p.y = -20; p.x = Math.random() * w; }
          ctx.strokeStyle = `rgba(150, 200, 230, ${p.a * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1.5, p.y + p.len);
          ctx.stroke();
          continue;
        }

        p.phase += 0.01;
        p.x += p.vx + Math.sin(p.phase) * 0.35;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const twinkle = weather === "night" ? 0.4 + Math.abs(Math.sin(p.phase * 2)) * 0.6 : 1;
        const color =
          weather === "night" ? "255, 235, 150" : weather === "cloudy" ? "220, 235, 210" : "245, 225, 130";
        const alpha = p.a * twinkle;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${color}, ${alpha})`);
        g.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [weather, intensity]);

  const night = weather === "night";

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="nature-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-weather={weather}
    >
      {/* sky wash */}
      <div className="absolute inset-0 nature-sky" />

      {/* sun / moon */}
      <div className="nature-sun absolute" />

      {/* light rays */}
      {!night && weather !== "rainy" ? <div className="nature-rays absolute inset-0" /> : null}

      {/* clouds */}
      <div className="nature-clouds absolute inset-x-0 top-0 h-[60vh]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`nature-cloud nature-cloud-${i}`} />
        ))}
      </div>

      {/* birds / butterflies */}
      {intensity > 0 && !night ? (
        <div className="nature-birds absolute inset-x-0 top-[14vh]">
          {[0, 1, 2].map((i) => (
            <svg key={i} className={`nature-bird nature-bird-${i}`} viewBox="0 0 24 12" fill="none">
              <path d="M1 7c3.5 0 4.5-5 5.5-5S11 7 11 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M13 7c3.5 0 4.5-5 5.5-5S23 7 23 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ))}
        </div>
      ) : null}

      {/* fog band */}
      <div className="nature-fog absolute inset-x-0" />

      {/* particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* wind-blown grass at the base of the viewport */}
      <div className="nature-grass absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full h-[16vh] min-h-[90px]">
          <path className="nature-blades nature-blades-back" d="M0 160 C 80 90 120 140 200 100 S 340 60 420 110 S 560 70 640 120 S 800 60 880 105 S 1040 70 1120 115 S 1300 70 1440 120 L1440 160 Z" />
          <path className="nature-blades nature-blades-front" d="M0 160 C 100 120 160 150 260 120 S 420 100 520 135 S 700 95 800 130 S 980 100 1080 132 S 1300 105 1440 140 L1440 160 Z" />
        </svg>
      </div>
    </div>
  );
}
