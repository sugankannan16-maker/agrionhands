import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Chrome";
import { Panel } from "@/components/shop/shop";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather Prediction & Farm Advisory — Agri on Hands" },
      { name: "description", content: "Live weather, 7-day forecast and crop suitability guidance for any farm location in India." },
      { property: "og:title", content: "Weather Prediction & Farm Advisory — Agri on Hands" },
      { property: "og:description", content: "Live weather, 7-day forecast and crop suitability guidance for any farm location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherPage,
});

type Place = { name: string; lat: number; lon: number };

type Current = {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
};

type Daily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
};

const codeInfo = (c: number): { icon: string; label: string } => {
  if (c === 0) return { icon: "☀️", label: "Clear sky" };
  if (c <= 2) return { icon: "🌤️", label: "Mostly sunny" };
  if (c === 3) return { icon: "☁️", label: "Overcast" };
  if (c <= 48) return { icon: "🌫️", label: "Fog" };
  if (c <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (c <= 67) return { icon: "🌧️", label: "Rain" };
  if (c <= 77) return { icon: "🌨️", label: "Snow" };
  if (c <= 82) return { icon: "🌧️", label: "Rain showers" };
  if (c <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
};

function advisories(c: Current, rainChance: number) {
  const out: { title: string; body: string }[] = [];
  if (rainChance >= 60) {
    out.push({ title: "Hold off on spraying", body: "High rain probability will wash off foliar sprays and fertiliser. Postpone by 24–48 hours." });
    out.push({ title: "Check field drainage", body: "Clear channels now to prevent waterlogging in paddy bunds and vegetable beds." });
  } else if (rainChance < 20 && c.temperature_2m > 32) {
    out.push({ title: "Irrigate early morning", body: "Hot and dry conditions — irrigate before 8am to cut evaporation losses." });
    out.push({ title: "Mulch exposed soil", body: "A straw or residue mulch keeps root-zone moisture and soil temperature stable." });
  } else {
    out.push({ title: "Good field-work window", body: "Conditions favour sowing, weeding, transplanting and harvesting operations." });
  }
  if (c.relative_humidity_2m > 80) {
    out.push({ title: "Watch for fungal disease", body: "High humidity encourages blast, blight and mildew. Scout leaves and act early." });
  }
  if (c.wind_speed_10m > 25) {
    out.push({ title: "Avoid pesticide spray", body: "Wind above 25 km/h causes drift. Stake tall crops such as banana and maize." });
  }
  return out;
}

function suitability(tempMax: number, rainChance: number) {
  const crops = [
    { name: "Rice", emoji: "🌾", ok: tempMax >= 22 && tempMax <= 37 && rainChance >= 30 },
    { name: "Wheat", emoji: "🌿", ok: tempMax >= 10 && tempMax <= 27 },
    { name: "Maize", emoji: "🌽", ok: tempMax >= 18 && tempMax <= 33 },
    { name: "Tomato", emoji: "🍅", ok: tempMax >= 18 && tempMax <= 30 && rainChance < 60 },
    { name: "Sugarcane", emoji: "🎋", ok: tempMax >= 20 && tempMax <= 38 },
    { name: "Groundnut", emoji: "🥜", ok: tempMax >= 22 && tempMax <= 34 && rainChance < 70 },
  ];
  return crops;
}

const DEFAULT: Place = { name: "Salem, Tamil Nadu", lat: 11.6643, lon: 78.146 };

function WeatherPage() {
  const [place, setPlace] = useState<Place>(DEFAULT);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
      `&timezone=auto&forecast_days=7`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setCurrent(d.current as Current);
        setDaily(d.daily as Daily);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError("Could not load weather right now. Please try again.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [place]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5`);
      const d = await r.json();
      setResults(
        (d.results ?? []).map((x: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
          name: [x.name, x.admin1, x.country].filter(Boolean).join(", "),
          lat: x.latitude,
          lon: x.longitude,
        })),
      );
    } catch {
      setError("Location search failed.");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setError("Geolocation is not available in this browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setResults([]);
        setPlace({ name: "My current location", lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => setError("Location permission denied."),
    );
  }

  const rainChance = daily?.precipitation_probability_max?.[0] ?? 0;
  const info = current ? codeInfo(current.weather_code) : null;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${place.lon - 0.35}%2C${place.lat - 0.25}%2C${place.lon + 0.35}%2C${place.lat + 0.25}&layer=mapnik&marker=${place.lat}%2C${place.lon}`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <PageHeader
        kicker="Weather intelligence"
        heading="Weather prediction & farm advisory"
        sub="Live conditions, a 7-day outlook and crop guidance for any field location."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel>
            <form onSubmit={search} className="flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any location — Salem, Coimbatore, Nashik…"
                className="min-w-[200px] flex-1 rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40"
              />
              <button type="submit" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
                Search
              </button>
              <button type="button" onClick={useMyLocation} className="rounded-full glass px-5 py-2.5 text-sm font-semibold text-grass-800">
                📍 My location
              </button>
            </form>
            {results.length > 0 && (
              <ul className="mt-3 space-y-1">
                {results.map((r) => (
                  <li key={`${r.lat}${r.lon}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setPlace(r);
                        setResults([]);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-grass-800 hover:bg-grass-100"
                    >
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </Panel>

          <Panel className="overflow-hidden !p-0">
            <iframe
              key={`${place.lat},${place.lon}`}
              title={`Map of ${place.name}`}
              src={mapSrc}
              className="h-72 w-full border-0 md:h-96"
              loading="lazy"
            />
          </Panel>

          <div>
            <h2 className="mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
              7-day forecast
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {(daily?.time ?? []).map((t, idx) => {
                const ci = codeInfo(daily!.weather_code[idx]);
                return (
                  <Panel key={t} className="text-center transition hover:-translate-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-grass-600">
                      {new Date(t).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="mt-2 text-4xl" aria-hidden>{ci.icon}</p>
                    <p className="mt-1 text-xs text-grass-700">{ci.label}</p>
                    <p className="mt-2 text-lg font-semibold text-grass-900">
                      {Math.round(daily!.temperature_2m_max[idx])}° / {Math.round(daily!.temperature_2m_min[idx])}°
                    </p>
                    <p className="mt-1 text-xs text-grass-700">
                      🌧 {daily!.precipitation_probability_max[idx] ?? 0}% · 💨 {Math.round(daily!.wind_speed_10m_max[idx])} km/h
                    </p>
                  </Panel>
                );
              })}
              {loading && <Panel className="text-sm text-grass-700">Loading forecast…</Panel>}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-grass-600">{place.name}</p>
            {current && info ? (
              <>
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-6xl" aria-hidden>{info.icon}</span>
                  <div>
                    <p className="text-5xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
                      {Math.round(current.temperature_2m)}°C
                    </p>
                    <p className="text-sm text-grass-700">{info.label}</p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-grass-100/70 p-3">
                    <dt className="text-xs text-grass-600">Humidity</dt>
                    <dd className="font-semibold text-grass-900">{current.relative_humidity_2m}%</dd>
                  </div>
                  <div className="rounded-2xl bg-grass-100/70 p-3">
                    <dt className="text-xs text-grass-600">Rain chance</dt>
                    <dd className="font-semibold text-grass-900">{rainChance}%</dd>
                  </div>
                  <div className="rounded-2xl bg-grass-100/70 p-3">
                    <dt className="text-xs text-grass-600">Rainfall</dt>
                    <dd className="font-semibold text-grass-900">{current.precipitation} mm</dd>
                  </div>
                  <div className="rounded-2xl bg-grass-100/70 p-3">
                    <dt className="text-xs text-grass-600">Wind</dt>
                    <dd className="font-semibold text-grass-900">{Math.round(current.wind_speed_10m)} km/h</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm text-grass-700">{loading ? "Reading the sky…" : "No data available."}</p>
            )}
          </Panel>

          {current && (
            <Panel>
              <h2 className="text-lg text-grass-900" style={{ fontFamily: "var(--font-display)" }}>Farming recommendations</h2>
              <ul className="mt-3 space-y-3">
                {advisories(current, rainChance).map((a) => (
                  <li key={a.title} className="rounded-2xl bg-grass-100/60 p-3">
                    <p className="text-sm font-semibold text-grass-900">{a.title}</p>
                    <p className="mt-1 text-xs text-grass-700">{a.body}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {daily && (
            <Panel>
              <h2 className="text-lg text-grass-900" style={{ fontFamily: "var(--font-display)" }}>Crop suitability today</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {suitability(daily.temperature_2m_max[0], rainChance).map((c) => (
                  <li key={c.name} className={`flex items-center gap-2 rounded-2xl p-2.5 ${c.ok ? "bg-grass-100 text-grass-900" : "bg-grass-800/5 text-grass-600"}`}>
                    <span aria-hidden>{c.emoji}</span>
                    <span className="flex-1">{c.name}</span>
                    <span aria-hidden>{c.ok ? "✓" : "—"}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-grass-600">Weather data by Open-Meteo; map tiles by OpenStreetMap.</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
