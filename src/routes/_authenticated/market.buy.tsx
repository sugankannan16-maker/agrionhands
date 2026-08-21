import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Panel, ProductImage, inr, type Product } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/market/buy")({
  head: () => ({
    meta: [
      { title: "Buy Crops — Agri on Hands Marketplace" },
      { name: "description", content: "Browse fresh crops with prices, available quantity and farm details, and buy directly from the farmer." },
      { property: "og:title", content: "Buy Crops — Agri on Hands" },
      { property: "og:description", content: "Fresh crops with live prices and quantities from verified farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");

  const products = useQuery({
    queryKey: ["market-crops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const items = products.data ?? [];
    if (!needle) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        (p.location ?? "").toLowerCase().includes(needle),
    );
  }, [products.data, q]);

  return (
    <div className="container-page py-8 md:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
            Buy Crops
          </h1>
          <p className="mt-2 text-sm text-grass-700">Fresh from the field — buy online and pay securely with GPay or PhonePe.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crops, place…"
            className="w-52 rounded-full border border-grass-800/15 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15"
          />
          <Link to="/marketplace" className="rounded-full glass px-4 py-2.5 text-sm text-grass-800">Back</Link>
        </div>
      </header>

      {products.isLoading ? (
        <Panel className="animate-pulse text-sm text-grass-700">Loading crops…</Panel>
      ) : list.length === 0 ? (
        <EmptyState
          title="No crops listed yet"
          body="Once farmers list their harvest it will appear here."
          action={
            <Link to="/market/sell" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
              Sell your crop
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <article
              key={p.id}
              className="group glass overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <Link to="/market/checkout/$id" params={{ id: p.id }} className="block">
                <ProductImage product={p} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-tight text-grass-900">{p.title}</h2>
                  {p.organic && (
                    <span className="shrink-0 rounded-full bg-grass-800 px-2.5 py-1 text-[10px] font-semibold text-grass-50">Organic</span>
                  )}
                </div>
                <p className="mt-1 text-xs capitalize text-grass-600">
                  {p.category}
                  {p.location && ` · ${p.location}`}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-grass-700">
                  {p.description || "Freshly harvested produce from a verified farm."}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-grass-600">Price</dt>
                    <dd className="font-semibold text-grass-900">
                      {inr(Number(p.price))}<span className="text-xs font-normal text-grass-600"> /{p.unit}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-grass-600">Quantity</dt>
                    <dd className="font-semibold text-grass-900">{p.stock} {p.unit}</dd>
                  </div>
                </dl>
                <Link
                  to="/market/checkout/$id"
                  params={{ id: p.id }}
                  className={`ripple-btn mt-5 block rounded-full bg-grass-800 py-2.5 text-center text-sm font-semibold text-grass-50 ${
                    p.stock <= 0 ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {p.stock > 0 ? "Buy Now" : "Sold out"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
