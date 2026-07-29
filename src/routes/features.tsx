import { createFileRoute, Link } from "@tanstack/react-router";
import Reveal from "@/components/nature/Reveal";
import { useSite } from "@/site/SiteProvider";
import { PageHeader } from "@/components/site/Chrome";
import { SatelliteIcon, CloudIcon, SoilIcon, ScriptIcon, MarketIcon } from "@/components/site/Icons";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Platform Features — Agri on Hands" },
      { name: "description", content: "Multispectral vegetation indices, micro-climate risk, sub-soil analytics, variable-rate scripts and market hedging for every field." },
      { property: "og:title", content: "Platform Features — Agri on Hands" },
      { property: "og:description", content: "Satellite to root zone to market: the intelligence layers behind Agri on Hands." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const { c, isLatin } = useSite();
  const cards = [
    { t: c.features.f1t, b: c.features.f1b, icon: <SatelliteIcon /> },
    { t: c.features.f2t, b: c.features.f2b, icon: <CloudIcon /> },
    { t: c.features.f3t, b: c.features.f3b, icon: <SoilIcon /> },
    { t: c.features.f4t, b: c.features.f4b, icon: <ScriptIcon /> },
    { t: c.features.f5t, b: c.features.f5b, icon: <MarketIcon /> },
  ];

  return (
    <section className="py-14 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader kicker={c.features.kicker} heading={c.features.heading} sub={c.features.sub} />
        <Reveal>
          <div className="grid md:grid-cols-6 gap-4">
            {cards.map((f, i) => (
              <div key={f.t} className={`group glass p-6 md:p-7 rounded-2xl lift-card ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}>
                <div className="p-2.5 bg-grass-100 text-grass-800 rounded-xl w-fit">{f.icon}</div>
                <h2 className={`${isLatin ? "font-serif" : ""} text-xl md:text-2xl mt-4`}>{f.t}</h2>
                <p className="text-grass-800 text-sm mt-2 text-pretty">{f.b}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 glass-dark text-grass-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-[46ch]">
              <h2 className={`${isLatin ? "font-serif" : ""} text-2xl md:text-3xl`}>{c.cta2.heading}</h2>
              <p className="text-grass-50/80 mt-2 text-sm">{c.cta2.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/predict" className="bg-sun-500 text-grass-900 text-sm font-semibold py-3 px-5 rounded-full ripple-btn">{c.nav.predict}</Link>
              <Link to="/assistant" className="text-grass-50 text-sm font-medium py-3 px-5 rounded-full ring-1 ring-grass-50/25 ripple-btn">{c.nav.assistant}</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
