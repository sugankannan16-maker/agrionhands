import { createFileRoute } from "@tanstack/react-router";
import heroField from "@/assets/hero-field.jpg";
import spectralHeatmap from "@/assets/spectral-heatmap.jpg";
import farmerPortrait from "@/assets/farmer-portrait.jpg";
import grainTexture from "@/assets/grain-texture.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="font-sans text-moss-900 bg-earth-50">
      <Nav />
      <Hero />
      <Metrics />
      <Features />
      <HowItWorks />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-earth-50/80 backdrop-blur-md border-b border-moss-900/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="size-6 bg-moss-900 rounded-sm grid place-items-center">
            <div className="size-2 bg-sun-500 rounded-full" />
          </div>
          <span className="font-semibold tracking-tight text-sm">TERRAFORM AI</span>
        </a>
        <div className="hidden md:flex gap-8 text-sm font-medium text-moss-700">
          <a href="#features" className="hover:text-moss-900 transition-colors">Forecasting</a>
          <a href="#how" className="hover:text-moss-900 transition-colors">How it works</a>
          <a href="#impact" className="hover:text-moss-900 transition-colors">Impact</a>
        </div>
        <button className="bg-moss-900 text-earth-50 text-sm font-medium py-2 px-4 rounded-sm hover:bg-moss-800 transition-colors">
          Request Demo
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="py-12 lg:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-end">
          <div className="space-y-8">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-sun-500">
              Precision Agriculture · Since 2021
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance">
              Precision yield forecasting for the{" "}
              <span className="italic text-sun-500">modern grower</span>
            </h1>
            <p className="text-lg md:text-xl text-moss-700 max-w-[52ch] text-pretty">
              Harnessing planetary-scale satellite imagery and localized sub-soil sensors to
              predict harvest outcomes — and prescribe the actions that raise them — with 94%
              accuracy.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-moss-900 text-earth-50 text-sm font-medium py-3 px-5 rounded-sm hover:bg-moss-800 transition-colors inline-flex items-center gap-2">
                Begin analysis
                <span aria-hidden>→</span>
              </button>
              <button className="bg-transparent text-moss-900 text-sm font-medium py-3 px-5 rounded-sm ring-1 ring-moss-900/10 hover:bg-earth-100 transition-colors">
                View field report
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-6 bg-earth-100 ring-1 ring-moss-900/5 rounded-lg">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-moss-700">
                Live Corn Futures
              </span>
              <div className="mt-2 font-serif text-4xl text-moss-900">$5.84</div>
              <div className="mt-1 text-sm text-emerald-700 font-medium">+2.4% vs last cycle</div>
            </div>
            <div className="p-6 bg-moss-900 text-earth-50 rounded-lg">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-earth-200/60">
                Region Advisory
              </span>
              <div className="mt-2 font-serif text-2xl leading-tight">
                Optimal planting window opens in 6 days.
              </div>
              <div className="mt-3 text-xs text-earth-200/70">Midwest Zone 5b</div>
            </div>
          </aside>
        </div>

        <div className="mt-16 relative overflow-hidden rounded-xl ring-1 ring-moss-900/10">
          <img
            src={heroField}
            alt="Wheat field at golden hour with subtle data-visualization overlay"
            width={1920}
            height={1024}
            className="w-full h-[420px] md:h-[560px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-moss-900/40 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4 justify-between text-earth-50">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-moss-900/60 backdrop-blur px-3 py-1.5 rounded-sm">
              PLOT #A-142 · CORN · 320 ACRES
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-moss-900/60 backdrop-blur px-3 py-1.5 rounded-sm">
              FORECAST: 218 BU/AC · +12%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const items = [
    {
      value: "14.2%",
      label: "Average Yield Increase",
      body: "Observed efficiency gains across 2.4M hectares of monitored cropland.",
    },
    {
      value: "$42/ac",
      label: "Input Cost Reduction",
      body: "Less fertilizer and water waste through hyper-local prescriptions.",
    },
    {
      value: "94%",
      label: "Forecast Accuracy",
      body: "Predictive precision 30 days before the harvest window closes.",
    },
  ];
  return (
    <section id="impact" className="py-20 md:py-24 px-6 bg-moss-900 text-earth-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-earth-50/10">
        {items.map((m, i) => (
          <div key={m.label} className={i === 0 ? "md:pr-12" : "md:px-12"}>
            <div className="font-serif text-6xl md:text-7xl mb-3">{m.value}</div>
            <p className="text-xs text-earth-200/60 font-medium uppercase tracking-widest">
              {m.label}
            </p>
            <p className="mt-4 text-earth-100/80 max-w-[32ch] text-sm text-pretty">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
          <div className="max-w-[52ch]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sun-500">
              The Platform
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-3 text-balance">
              Intelligent layers of growth
            </h2>
          </div>
          <p className="text-moss-700 max-w-sm text-pretty">
            One engine, three lenses on your field — from orbit to root zone to market.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-earth-100 p-8 md:p-10 rounded-xl ring-1 ring-moss-900/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-moss-900 text-earth-50 rounded-sm">
                <SatelliteIcon />
              </div>
              <span className="font-medium text-sm">Satellite Modeling</span>
            </div>
            <h3 className="font-serif text-3xl md:text-4xl">Multispectral vegetation indices</h3>
            <p className="text-moss-700 max-w-[52ch] text-pretty">
              Track biomass health in real time. Our models detect nitrogen deficiencies and
              hydration stress up to 72 hours before they're visible to the human eye.
            </p>
            <img
              src={spectralHeatmap}
              alt="Aerial heatmap of geometric farm plots showing spectral vegetation index"
              width={1024}
              height={576}
              loading="lazy"
              className="w-full aspect-[2/1] object-cover rounded-lg ring-1 ring-moss-900/5"
            />
          </div>

          <div className="md:col-span-4 bg-moss-800 text-earth-50 p-8 md:p-10 rounded-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sun-500 text-moss-900 rounded-sm">
                <CheckIcon />
              </div>
              <span className="font-medium text-sm text-earth-100">Weather Synthesis</span>
            </div>
            <h3 className="font-serif text-3xl">Micro-climate risk engine</h3>
            <p className="text-earth-200/80 text-sm leading-relaxed text-pretty">
              Local station data cross-referenced with regional atmospheric models to predict
              frost, hail, and drought windows down to the acre.
            </p>
            <div className="pt-6 border-t border-earth-50/10">
              <div className="text-[10px] uppercase tracking-widest text-earth-200/50 mb-4">
                Next 48 Hours · Plot A-142
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span>Precipitation</span><span className="font-medium">12%</span></li>
                <li className="flex justify-between"><span>Soil moisture</span><span className="font-medium">64%</span></li>
                <li className="flex justify-between"><span>Wind speed</span><span className="font-medium">8 mph</span></li>
                <li className="flex justify-between"><span>Frost risk</span><span className="font-medium text-sun-500">Low</span></li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 bg-earth-100 p-8 rounded-xl ring-1 ring-moss-900/5 space-y-4">
            <div className="p-2 bg-moss-900 text-earth-50 rounded-sm w-fit">
              <SoilIcon />
            </div>
            <h3 className="font-serif text-2xl">Sub-soil analytics</h3>
            <p className="text-moss-700 text-sm text-pretty">
              Root-zone moisture and nutrient modeling across 5m grids using deep-layer core
              samples.
            </p>
          </div>
          <div className="md:col-span-4 bg-earth-100 p-8 rounded-xl ring-1 ring-moss-900/5 space-y-4">
            <div className="p-2 bg-moss-900 text-earth-50 rounded-sm w-fit">
              <ScriptIcon />
            </div>
            <h3 className="font-serif text-2xl">Variable-rate scripts</h3>
            <p className="text-moss-700 text-sm text-pretty">
              Export prescription maps directly to John Deere, Case IH, and AGCO equipment.
            </p>
          </div>
          <div className="md:col-span-4 bg-earth-100 p-8 rounded-xl ring-1 ring-moss-900/5 space-y-4">
            <div className="p-2 bg-moss-900 text-earth-50 rounded-sm w-fit">
              <MarketIcon />
            </div>
            <h3 className="font-serif text-2xl">Market hedging</h3>
            <p className="text-moss-700 text-sm text-pretty">
              Match harvest volume against global futures to price your yield at the right moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Onboard your fields",
      d: "Draw boundaries or import shapefiles. We backfill three years of imagery in minutes.",
    },
    {
      n: "02",
      t: "Model runs continuously",
      d: "Daily satellite passes, on-site sensors, and weather feeds fuel a per-plot digital twin.",
    },
    {
      n: "03",
      t: "Act on prescriptions",
      d: "Receive rate maps, alerts, and yield forecasts. Push directly to your equipment.",
    },
  ];
  return (
    <section id="how" className="py-24 px-6 bg-earth-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 max-w-[52ch]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sun-500">
            How it works
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3 text-balance">
            From orbit to operator in three moves.
          </h2>
        </div>
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <li
              key={s.n}
              className="bg-earth-50 p-8 rounded-xl ring-1 ring-moss-900/5 space-y-4"
            >
              <div className="font-serif text-5xl text-sun-500">{s.n}</div>
              <h3 className="font-serif text-2xl">{s.t}</h3>
              <p className="text-moss-700 text-sm text-pretty">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <img
          src={farmerPortrait}
          alt="Erik Sorenson, Head of Operations at Heartland Plains Ag"
          width={512}
          height={512}
          loading="lazy"
          className="size-20 mx-auto rounded-full object-cover ring-1 ring-moss-900/10"
        />
        <blockquote className="font-serif text-3xl md:text-4xl text-moss-900 leading-tight text-balance">
          "Seeing a yield deficit coming three weeks in advance let us adjust our nitrogen
          application and save our entire corn crop."
        </blockquote>
        <div>
          <p className="font-semibold">Erik Sorenson</p>
          <p className="text-sm text-moss-600">Head of Operations · Heartland Plains Ag</p>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-moss-900 rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          <img
            src={grainTexture}
            alt=""
            aria-hidden
            width={1920}
            height={640}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="relative space-y-6">
            <h2 className="font-serif text-4xl md:text-6xl text-earth-50 text-balance">
              Ready to optimize your harvest?
            </h2>
            <p className="text-earth-200/80 max-w-[42ch] mx-auto">
              Join 4,500+ agribusinesses using Terraform AI to grow more with less.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button className="bg-sun-500 text-moss-900 text-sm font-semibold py-3 px-5 rounded-sm hover:brightness-95 transition-all">
                Schedule yield assessment
              </button>
              <button className="bg-transparent text-earth-50 text-sm font-medium py-3 px-5 rounded-sm ring-1 ring-earth-50/20 hover:bg-earth-50/10 transition-colors">
                Speak with an agronomist
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-moss-900/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-5 bg-moss-900 rounded-sm" />
          <span className="font-semibold tracking-tight text-xs">TERRAFORM AI</span>
        </div>
        <div className="flex gap-8 text-xs font-medium text-moss-600 uppercase tracking-widest">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Data policy</a>
          <a href="#">Support</a>
        </div>
        <p className="text-xs text-moss-600">© 2026 Terraform AgSystems Inc.</p>
      </div>
    </footer>
  );
}

/* Icons */
function SatelliteIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.5 1.5M12 12l-1.5-1.5M4 12l1.5-1.5M12 4l-1.5 1.5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}
function SoilIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v6M6 4l2 2 2-2M2 10h12M2 13h12" />
    </svg>
  );
}
function ScriptIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3" width="11" height="10" rx="1" />
      <path d="M5 6h6M5 8.5h6M5 11h4" />
    </svg>
  );
}
function MarketIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l4-4 3 3 5-6" />
      <path d="M10 5h4v4" />
    </svg>
  );
}
