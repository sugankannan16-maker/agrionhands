import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";
import { PageHeader } from "@/components/site/Chrome";
import { activityCategories, type ActivityCategory } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Activity History — Chats, Photos & Orders | Agri on Hands" },
      { name: "description", content: "Revisit every chat, geotagged field photo, AI prediction, weather search and marketplace order in one searchable timeline." },
      { property: "og:title", content: "Activity History | Agri on Hands" },
      { property: "og:description", content: "Search, filter and manage your full Agri on Hands activity timeline." },
    ],
  }),
  component: HistoryPage,
});

type Row = {
  id: string;
  category: string;
  title: string;
  detail: string;
  link: string | null;
  created_at: string;
  capture?: { path: string; lat: number | null; lng: number | null } | null;
};

function HistoryPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ActivityCategory | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [zoom, setZoom] = useState<string | null>(null);

  const activity = useQuery({
    queryKey: ["activity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("id, category, title, detail, link, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const captures = useQuery({
    queryKey: ["captures", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captures")
        .select("id, storage_path, latitude, longitude, prediction, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const rows = data ?? [];
      const signed = await Promise.all(
        rows.map(async (r) => {
          const { data: s } = await supabase.storage.from("captures").createSignedUrl(r.storage_path, 3600);
          return { ...r, url: s?.signedUrl ?? "" };
        }),
      );
      return signed;
    },
  });

  const items = useMemo<Row[]>(() => {
    const captureRows: Row[] = (captures.data ?? []).map((cp) => ({
      id: `cap-${cp.id}`,
      category: "capture",
      title: "Field photo",
      detail: cp.prediction ?? (cp.latitude != null ? `GPS ${cp.latitude.toFixed(5)}, ${cp.longitude?.toFixed(5)}` : "No GPS"),
      link: null,
      created_at: cp.created_at,
      capture: { path: cp.url, lat: cp.latitude, lng: cp.longitude },
    }));
    const all = [...(activity.data ?? []).filter((a) => a.category !== "capture"), ...captureRows];
    const needle = q.trim().toLowerCase();
    return all
      .filter((r) => (cat === "all" ? true : r.category === cat))
      .filter((r) => (needle ? `${r.title} ${r.detail}`.toLowerCase().includes(needle) : true))
      .filter((r) => (from ? new Date(r.created_at) >= new Date(from) : true))
      .filter((r) => (to ? new Date(r.created_at) <= new Date(`${to}T23:59:59`) : true))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [activity.data, captures.data, q, cat, from, to]);

  const removeActivity = async (id: string) => {
    await supabase.from("activity_log").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["activity"] });
  };

  const removeCapture = async (id: string, path: string) => {
    const realId = id.replace("cap-", "");
    const row = (captures.data ?? []).find((c) => c.id === realId);
    if (row) await supabase.storage.from("captures").remove([row.storage_path]);
    await supabase.from("captures").delete().eq("id", realId);
    void qc.invalidateQueries({ queryKey: ["captures"] });
    void path;
  };

  const loading = activity.isLoading || captures.isLoading;

  return (
    <section className="py-10 md:py-16">
      <div className="container-page"><div className="mx-auto w-full max-w-5xl">
        <PageHeader
          kicker="Your timeline"
          heading="Activity history"
          sub="Every chat, geotagged photo, prediction, weather search and marketplace action — searchable and private to you."
        />

        <div className="glass rounded-3xl p-4 md:p-5 grid gap-3 md:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search history…"
            aria-label="Search history"
            className="md:col-span-2 bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-4 py-2.5 text-sm text-grass-900 focus:outline-none focus:ring-2 focus:ring-grass-600"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as ActivityCategory | "all")}
            aria-label="Filter by category"
            className="bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-4 py-2.5 text-sm text-grass-900"
          >
            <option value="all">All categories</option>
            {activityCategories.map((k) => (
              <option key={k.value} value={k.value}>
                {k.icon} {k.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="w-full bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-3 py-2.5 text-xs text-grass-900" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="w-full bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-3 py-2.5 text-xs text-grass-900" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-grass-700 animate-pulse text-center py-10">Loading your history…</p>}
          {!loading && items.length === 0 && (
            <p className="text-center text-grass-700 glass rounded-3xl py-12">Nothing here yet. Chat with the assistant or capture a field photo to start your timeline.</p>
          )}
          {items.map((r) => {
            const meta = activityCategories.find((k) => k.value === r.category) ?? activityCategories[activityCategories.length - 1];
            return (
              <article key={r.id} className="glass rounded-2xl p-4 flex gap-4 items-start lift-card animate-in fade-in slide-in-from-bottom-1 duration-300">
                {r.capture?.path ? (
                  <button type="button" onClick={() => setZoom(r.capture!.path)} className="shrink-0">
                    <img src={r.capture.path} alt="Captured field photo" loading="lazy" className="size-20 rounded-xl object-cover ring-1 ring-grass-800/10" />
                  </button>
                ) : (
                  <span aria-hidden className="size-10 shrink-0 grid place-items-center rounded-full bg-grass-100 text-lg">{meta.icon}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-grass-600">{meta.label}</span>
                    <span className="text-[11px] text-grass-600">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-grass-900 font-medium mt-1 break-words">{r.title}</h3>
                  {r.detail && <p className="text-sm text-grass-700 mt-1 line-clamp-3 break-words">{r.detail}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {r.link && <a href={r.link} className="story-link text-grass-800 font-semibold">Revisit</a>}
                    {r.capture?.path && (
                      <a href={r.capture.path} download className="story-link text-grass-800 font-semibold">Download</a>
                    )}
                    {r.capture?.lat != null && (
                      <a
                        href={`https://www.google.com/maps?q=${r.capture.lat},${r.capture.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="story-link text-grass-800 font-semibold"
                      >
                        Map
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void (r.capture ? removeCapture(r.id, r.capture.path) : removeActivity(r.id))}
                      className="text-destructive font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div></div>

      {zoom && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-grass-900/70 backdrop-blur-sm p-4" onClick={() => setZoom(null)}>
          <img src={zoom} alt="Captured field photo full size" className="max-h-[85vh] max-w-full rounded-2xl" />
        </div>
      )}
    </section>
  );
}
