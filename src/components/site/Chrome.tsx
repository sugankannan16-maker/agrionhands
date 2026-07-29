import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSite } from "@/site/SiteProvider";
import { langMeta, type Lang } from "@/site/content";
import type { Weather } from "@/components/nature/NatureBackground";
import { LeafIcon } from "./Icons";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="size-8 rounded-full bg-grass-800 grid place-items-center shrink-0">
        <LeafIcon className="size-4 text-sun-500" />
      </div>
      <span
        className="text-2xl md:text-3xl leading-none text-grass-900 tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Agri on Hands
      </span>
    </Link>
  );
}

function LangToggle() {
  const { lang, setLang } = useSite();
  return (
    <div className="inline-flex items-center rounded-full bg-grass-100 p-1 text-xs font-semibold" role="group" aria-label="Language">
      {(Object.keys(langMeta) as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 rounded-full transition ${lang === l ? "bg-grass-800 text-grass-50" : "text-grass-800 hover:text-grass-900"}`}
        >
          <span aria-hidden className="mr-1">{langMeta[l].flag}</span>
          {langMeta[l].label}
        </button>
      ))}
    </div>
  );
}

const weatherIcons: Record<Weather, string> = { sunny: "☀", cloudy: "☁", rainy: "☂", night: "☾" };

function WeatherSwitch() {
  const { weather, setWeather } = useSite();
  return (
    <div className="inline-flex items-center rounded-full glass p-1 text-sm" role="group" aria-label="Scene weather">
      {(Object.keys(weatherIcons) as Weather[]).map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => setWeather(w)}
          aria-pressed={weather === w}
          aria-label={w}
          title={w}
          className={`size-7 grid place-items-center rounded-full transition-all duration-300 ${
            weather === w ? "bg-grass-800 text-sun-500 scale-105" : "text-grass-800 hover:bg-grass-100"
          }`}
        >
          <span aria-hidden>{weatherIcons[w]}</span>
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { c } = useSite();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: "/", label: c.nav.home },
    { to: "/features", label: c.nav.features },
    { to: "/crops", label: c.nav.crops },
    { to: "/predict", label: c.nav.predict },
    { to: "/assistant", label: c.nav.assistant },
    { to: "/contact", label: c.nav.contact },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-grass-800/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />
        <div className="hidden lg:flex gap-7 text-sm font-medium text-grass-800">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="story-link hover:text-grass-900 aria-[current=page]:text-grass-900 aria-[current=page]:font-semibold"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block"><WeatherSwitch /></div>
          <LangToggle />
          <Link
            to="/assistant"
            className="ripple-btn hidden sm:inline-flex bg-grass-800 text-grass-50 text-sm font-medium py-2 px-4 rounded-full hover:bg-grass-900"
          >
            {c.nav.assistant}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="lg:hidden size-9 grid place-items-center rounded-full glass text-grass-900"
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-grass-800/10 glass px-4 py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-grass-800 hover:bg-grass-100 aria-[current=page]:bg-grass-800 aria-[current=page]:text-grass-50"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 md:hidden"><WeatherSwitch /></div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  const { c } = useSite();
  const links = [
    { to: "/features", label: c.nav.features },
    { to: "/crops", label: c.nav.crops },
    { to: "/predict", label: c.nav.predict },
    { to: "/assistant", label: c.nav.assistant },
    { to: "/contact", label: c.nav.contact },
  ] as const;
  return (
    <footer className="py-10 px-4 md:px-6 border-t border-grass-800/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
        <Logo />
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-grass-800">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="story-link hover:text-grass-900">{l.label}</Link>
          ))}
        </div>
        <p className="text-xs text-grass-600 text-center">{c.footer.rights}</p>
      </div>
    </footer>
  );
}

export function PageHeader({ kicker, heading, sub }: { kicker: string; heading: string; sub?: string }) {
  const { isLatin } = useSite();
  return (
    <header className="max-w-[60ch] mb-10 md:mb-12">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">{kicker}</span>
      <h1 className={`${isLatin ? "font-serif" : ""} text-3xl md:text-5xl mt-3 text-balance text-leaf-gradient`}>{heading}</h1>
      {sub && <p className="text-grass-800 mt-4 text-pretty">{sub}</p>}
    </header>
  );
}
