import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import Reveal from "@/components/nature/Reveal";
import { useSite } from "@/site/SiteProvider";
import { PageHeader } from "@/components/site/Chrome";
import { cropData, cropBaselines } from "@/data/crops";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "AI Crop Yield Prediction — Agri on Hands" },
      { name: "description", content: "Enter crop, location, soil nutrients and forecast dates to get an instant AI yield estimate, confidence score and advisory." },
      { property: "og:title", content: "AI Crop Yield Prediction — Agri on Hands" },
      { property: "og:description", content: "Forecast your harvest in seconds with soil, rainfall and crop-specific AI modelling." },
    ],
  }),
  component: PredictPage,
});

function PredictPage() {
  const { c, lang, isLatin } = useSite();
  const cropKeys = cropData.map((cr) => ({ key: cr.key, name: cr[lang].name }));

  const [form, setForm] = useState({
    crop: "rice",
    location: "Salem, Tamil Nadu",
    area: "5",
    soilIndex: 0,
    n: "80",
    p: "40",
    k: "40",
    ph: "6.5",
    rainfall: "900",
    start: "",
    end: "",
  });
  const [result, setResult] = useState<null | { perAcre: number; total: number; confidence: number; advisory: string }>(null);

  const update = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = cropBaselines[form.crop] ?? 20;
    const ph = parseFloat(form.ph) || 6.5;
    const rain = parseFloat(form.rainfall) || 800;
    const n = parseFloat(form.n) || 60;
    const area = Math.max(0, parseFloat(form.area) || 0);
    const phScore = 1 - Math.min(Math.abs(ph - 6.5) / 3, 0.35);
    const rainScore = 1 - Math.min(Math.abs(rain - 900) / 1800, 0.3);
    const nScore = Math.min(n / 80, 1.15);
    const soilBoost = form.soilIndex === 0 ? 1.08 : 1.0;
    const perAcre = +(base * phScore * rainScore * nScore * soilBoost).toFixed(1);
    const total = +(perAcre * area).toFixed(1);
    const confidence = Math.round(phScore * rainScore * 92 + 4);

    const advisories = {
      en: {
        acid: "Soil is acidic — consider liming before sowing.",
        dry: "Low rainfall expected — plan drip irrigation.",
        ok: "Conditions look favorable. Continue with current plan.",
      },
      ta: {
        acid: "மண் அமிலத்தன்மை அதிகம் — சுண்ணாம்பு சேர்க்கவும்.",
        dry: "மழை குறைவு — சொட்டு நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.",
        ok: "நிலைமைகள் சாதகமாக உள்ளன. தற்போதைய திட்டத்தைத் தொடருங்கள்.",
      },
      hi: {
        acid: "मिट्टी अम्लीय है — बुवाई से पहले चूना डालें।",
        dry: "कम वर्षा की संभावना — ड्रिप सिंचाई की योजना बनाएँ।",
        ok: "परिस्थितियाँ अनुकूल हैं। मौजूदा योजना जारी रखें।",
      },
    } as const;
    const a = advisories[lang];
    const advisory = ph < 6 ? a.acid : rain < 500 ? a.dry : a.ok;

    setResult({ perAcre, total, confidence, advisory });
  };

  const inputCls =
    "w-full bg-white/80 ring-1 ring-grass-800/15 rounded-xl px-3.5 py-2.5 text-sm text-grass-900 placeholder:text-grass-600/60 focus:outline-none focus:ring-2 focus:ring-grass-600";
  const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-grass-600 mb-1.5 block";

  return (
    <section className="py-14 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader kicker={c.predict.kicker} heading={c.predict.heading} sub={c.predict.sub} />

        <Reveal>
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6">
            <form onSubmit={onSubmit} className="glass p-6 md:p-8 rounded-3xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="crop">{c.predict.crop}</label>
                  <select id="crop" className={inputCls} value={form.crop} onChange={(e) => update("crop", e.target.value)}>
                    {cropKeys.map((cr) => <option key={cr.key} value={cr.key}>{cr.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="loc">{c.predict.location}</label>
                  <input id="loc" className={inputCls} value={form.location} placeholder={c.predict.locationPh} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="area">{c.predict.area}</label>
                  <input id="area" type="number" min="0" step="0.1" className={inputCls} value={form.area} onChange={(e) => update("area", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="soil">{c.predict.soilType}</label>
                  <select id="soil" className={inputCls} value={form.soilIndex} onChange={(e) => update("soilIndex", Number(e.target.value))}>
                    {c.predict.soils.map((s, i) => <option key={s} value={i}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="n">{c.predict.soilN}</label>
                  <input id="n" type="number" className={inputCls} value={form.n} onChange={(e) => update("n", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="p">{c.predict.soilP}</label>
                  <input id="p" type="number" className={inputCls} value={form.p} onChange={(e) => update("p", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="k">{c.predict.soilK}</label>
                  <input id="k" type="number" className={inputCls} value={form.k} onChange={(e) => update("k", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ph">{c.predict.soilPH}</label>
                  <input id="ph" type="number" step="0.1" className={inputCls} value={form.ph} onChange={(e) => update("ph", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="rain">{c.predict.rainfall}</label>
                  <input id="rain" type="number" className={inputCls} value={form.rainfall} onChange={(e) => update("rainfall", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} htmlFor="start">{c.predict.start}</label>
                    <input id="start" type="date" className={inputCls} value={form.start} onChange={(e) => update("start", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="end">{c.predict.end}</label>
                    <input id="end" type="date" className={inputCls} value={form.end} onChange={(e) => update("end", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button type="submit" className="bg-grass-800 text-grass-50 text-sm font-medium py-3 px-5 rounded-full hover:bg-grass-900 ripple-btn inline-flex items-center gap-2">
                  {c.predict.submit} <span aria-hidden>→</span>
                </button>
                <button type="button" onClick={() => setResult(null)} className="text-grass-900 text-sm font-medium py-3 px-5 rounded-full glass ripple-btn">
                  {c.predict.reset}
                </button>
              </div>
            </form>

            <aside className="glass-dark text-grass-50 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[320px]">
              {result ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-grass-200/70 font-semibold">{c.predict.result}</div>
                    <div className={`${isLatin ? "font-serif" : ""} text-5xl mt-1 text-sun-500`}>
                      {result.perAcre}<span className="text-lg text-grass-50/80"> q/{c.predict.perAcre}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-grass-50/15 pt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-grass-200/70 font-semibold">{c.predict.total}</div>
                      <div className={`${isLatin ? "font-serif" : ""} text-2xl mt-1`}>{result.total} q</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-grass-200/70 font-semibold">{c.predict.confidence}</div>
                      <div className={`${isLatin ? "font-serif" : ""} text-2xl mt-1`}>{result.confidence}%</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-sun-500 font-semibold mb-1.5">{c.predict.advisory}</div>
                    <p className="text-sm text-grass-50/90 leading-relaxed">{result.advisory}</p>
                  </div>
                  <Link to="/assistant" className="inline-flex items-center gap-2 text-sm font-medium rounded-full bg-sun-500 text-grass-900 py-2.5 px-4 ripple-btn">
                    🎙 {c.predict.askAi}
                  </Link>
                </div>
              ) : (
                <div className="m-auto text-center text-grass-50/70 text-sm max-w-[28ch]">
                  <div className={`${isLatin ? "font-serif" : ""} text-3xl text-sun-500 mb-3`}>—</div>
                  {c.predict.sub}
                </div>
              )}
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
