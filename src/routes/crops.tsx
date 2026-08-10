import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Reveal from "@/components/nature/Reveal";
import { useSite } from "@/site/SiteProvider";
import { PageHeader } from "@/components/site/Chrome";
import { cropData } from "@/data/crops";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "Crop Library — Features & Uses | Agri on Hands" },
      { name: "description", content: "Explore rice, wheat, maize, sugarcane, cotton and tomato — tap any crop to see its growing features and end uses in English, Tamil and Hindi." },
      { property: "og:title", content: "Crop Library — Features & Uses | Agri on Hands" },
      { property: "og:description", content: "Localized AI crop models for every major crop grown across India." },
    ],
  }),
  component: CropsPage,
});

function CropsPage() {
  const { c, lang, isLatin } = useSite();
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="py-14 md:py-20">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <PageHeader kicker={c.crops.kicker} heading={c.crops.heading} sub={c.crops.sub} />
          <span className="mb-10 text-xs font-semibold uppercase tracking-widest text-grass-600 glass px-3 py-1.5 rounded-full self-start">
            {c.crops.hint}
          </span>
        </div>

        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {cropData.map((crop) => {
              const info = crop[lang];
              const isActive = active === crop.key;
              return (
                <button
                  key={crop.key}
                  type="button"
                  onClick={() => setActive(isActive ? null : crop.key)}
                  onMouseEnter={() => setActive(crop.key)}
                  onMouseLeave={() => setActive((prev) => (prev === crop.key ? null : prev))}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] text-left ring-1 ring-grass-800/10 lift-card focus:outline-none focus:ring-2 focus:ring-grass-600"
                  aria-expanded={isActive}
                >
                  <img
                    src={crop.img}
                    alt={info.name}
                    width={640}
                    height={640}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-grass-900/85 via-grass-900/30 to-transparent" />

                  <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-5 text-grass-50 transition-opacity duration-300 ${isActive ? "opacity-0" : "opacity-100"}`}>
                    <div className={`${isLatin ? "font-serif" : ""} text-2xl md:text-3xl leading-tight`}>{info.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-grass-200/80 mt-1">{c.crops.hint} →</div>
                  </div>

                  <div className={`absolute inset-0 p-4 md:p-5 text-grass-50 flex flex-col justify-end transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <div className={`${isLatin ? "font-serif" : ""} text-xl md:text-2xl mb-3`}>{info.name}</div>
                    <div className="space-y-3 text-xs md:text-sm">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-sun-500 font-semibold mb-1">{c.crops.features}</div>
                        <ul className="space-y-0.5 text-grass-50/90">
                          {info.features.map((f) => (
                            <li key={f} className="flex gap-1.5"><span className="text-sun-500">·</span><span>{f}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-sun-500 font-semibold mb-1">{c.crops.uses}</div>
                        <ul className="space-y-0.5 text-grass-50/90">
                          {info.uses.map((u) => (
                            <li key={u} className="flex gap-1.5"><span className="text-sun-500">·</span><span>{u}</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
