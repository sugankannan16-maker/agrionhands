import { createFileRoute, Link } from "@tanstack/react-router";
import Reveal from "@/components/nature/Reveal";
import { useSite } from "@/site/SiteProvider";
import { LeafIcon } from "@/components/site/Icons";
import heroGrass from "@/assets/hero-grass.jpg";
import farmerPortrait from "@/assets/farmer-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agri on Hands — AI Crop Yield Prediction & Voice Assistant" },
      {
        name: "description",
        content:
          "Predict harvests, optimize inputs and talk to a Tamil, English and Hindi voice AI assistant built for Indian farmers.",
      },
      { property: "og:title", content: "Agri on Hands — AI Crop Yield Prediction & Voice Assistant" },
      {
        property: "og:description",
        content: "Satellite, soil and micro-climate AI plus a multilingual voice assistant for every field.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Reveal><Metrics /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><Testimonial /></Reveal>
      <Reveal><CTA /></Reveal>
    </>
  );
}

function Hero() {
  const { c, isLatin } = useSite();
  return (
    <section className="relative py-14 lg:py-24 px-4 md:px-6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {["left-[6%] top-[18%]", "left-[28%] top-[8%]", "right-[18%] top-[26%]", "right-[6%] bottom-[18%]", "left-[14%] bottom-[10%]"].map((pos) => (
          <LeafIcon key={pos} className={`absolute ${pos} size-6 md:size-8 text-grass-600/35 float-slow`} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-end">
          <div className="space-y-6 reveal is-visible">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-800">
              <span className="size-1.5 rounded-full bg-grass-600 animate-pulse" />
              {c.hero.kicker}
            </span>
            <h1 className={`${isLatin ? "font-serif" : ""} text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-balance text-leaf-gradient`}>
              {c.hero.title1} <span className="italic">{c.hero.title2}</span>
            </h1>
            <p className="text-base md:text-lg text-grass-800 max-w-[54ch] text-pretty soft-shadow-text">{c.hero.body}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/predict" className="ripple-btn bg-grass-800 text-grass-50 text-sm font-medium py-3 px-5 rounded-full hover:bg-grass-900 inline-flex items-center gap-2">
                {c.hero.primary} <span aria-hidden>→</span>
              </Link>
              <Link to="/assistant" className="ripple-btn glass text-grass-900 text-sm font-medium py-3 px-5 rounded-full inline-flex items-center gap-2">
                🎙 {c.hero.secondary}
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-5 glass rounded-2xl lift-card float-slow">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-grass-600">{c.hero.side1Label}</span>
              <div className="mt-1 font-serif text-3xl">₹2,340<span className="text-base text-grass-600">/qtl</span></div>
              <div className="mt-1 text-sm text-grass-600 font-medium">{c.hero.side1Sub}</div>
            </div>
            <div className="p-5 glass-dark text-grass-50 rounded-2xl lift-card">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-grass-200/70">{c.hero.side2Label}</span>
              <div className={`mt-2 ${isLatin ? "font-serif" : ""} text-xl leading-tight`}>{c.hero.side2Body}</div>
              <div className="mt-3 text-xs text-grass-200/70">{c.hero.side2Sub}</div>
            </div>
          </aside>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl ring-1 ring-grass-800/10 lift-card">
          <img
            src={heroGrass}
            alt="Lush green grass field with morning dew"
            width={1920}
            height={1024}
            fetchPriority="high"
            className="w-full h-[320px] md:h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-grass-900/55 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-3 justify-between text-grass-50">
            <span className="text-[10px] font-mono uppercase tracking-widest glass-dark px-3 py-1.5 rounded-full">{c.hero.chip1}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest glass-dark px-3 py-1.5 rounded-full">{c.hero.chip2}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const { c, isLatin } = useSite();
  return (
    <section className="py-20 px-4 md:px-6 bg-grass-800/90 text-grass-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <h2 className={`${isLatin ? "font-serif" : ""} text-3xl md:text-4xl mb-12 max-w-[24ch] text-balance`}>{c.metrics.heading}</h2>
        <div className="grid md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-grass-50/10">
          {c.metrics.items.map((m, i) => (
            <div key={m.l} className={i === 0 ? "md:pr-10" : "md:px-10"}>
              <div className={`${isLatin ? "font-serif" : ""} text-5xl md:text-6xl mb-3 text-sun-500`}>{m.v}</div>
              <p className="text-xs text-grass-200/70 font-semibold uppercase tracking-widest">{m.l}</p>
              <p className="mt-3 text-grass-50/85 text-sm text-pretty max-w-[32ch]">{m.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { c, isLatin } = useSite();
  return (
    <section className="py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 max-w-[52ch]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grass-600">{c.how.kicker}</span>
          <h2 className={`${isLatin ? "font-serif" : ""} text-3xl md:text-5xl mt-3 text-balance`}>{c.how.heading}</h2>
        </div>
        <ol className="grid md:grid-cols-3 gap-5">
          {c.how.steps.map((s, i) => (
            <li key={s.t} className="glass p-7 rounded-2xl lift-card space-y-3">
              <div className={`${isLatin ? "font-serif" : ""} text-5xl text-grass-600`}>0{i + 1}</div>
              <h3 className={`${isLatin ? "font-serif" : ""} text-xl md:text-2xl`}>{s.t}</h3>
              <p className="text-grass-800 text-sm text-pretty">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonial() {
  const { c, isLatin } = useSite();
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-grass-100/40 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <img src={farmerPortrait} alt={c.testimonial.name} width={512} height={512} loading="lazy" className="size-20 mx-auto rounded-full object-cover ring-1 ring-grass-800/10" />
        <blockquote className={`${isLatin ? "font-serif" : ""} text-2xl md:text-3xl text-grass-900 leading-snug text-balance`}>
          &ldquo;{c.testimonial.quote}&rdquo;
        </blockquote>
        <div>
          <p className="font-semibold">{c.testimonial.name}</p>
          <p className="text-sm text-grass-600">{c.testimonial.role}</p>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { c, isLatin } = useSite();
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-grass-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <img src={heroGrass} alt="" aria-hidden width={1920} height={1024} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-15" />
          <div className="relative space-y-5">
            <h2 className={`${isLatin ? "font-serif" : ""} text-3xl md:text-5xl text-grass-50 text-balance`}>{c.cta2.heading}</h2>
            <p className="text-grass-50/85 max-w-[42ch] mx-auto">{c.cta2.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Link to="/predict" className="bg-sun-500 text-grass-900 text-sm font-semibold py-3 px-5 rounded-full ripple-btn">{c.cta2.primary}</Link>
              <Link to="/contact" className="text-grass-50 text-sm font-medium py-3 px-5 rounded-full ring-1 ring-grass-50/25 ripple-btn">{c.cta2.secondary}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
