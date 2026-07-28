import { useEffect, useState } from "react";

/** True when the user prefers reduced motion, or the device looks low-powered. */
export function useCalmMotion() {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowEnd =
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      // deviceMemory is not in every TS lib
      ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    const apply = () => setCalm(mql.matches || lowEnd);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return calm;
}

/** Density multiplier for particle systems: 1 desktop, lower on small / weak devices. */
export function useIntensity() {
  const calm = useCalmMotion();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      setScale(w < 640 ? 0.45 : w < 1024 ? 0.7 : 1);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return calm ? 0 : scale;
}
