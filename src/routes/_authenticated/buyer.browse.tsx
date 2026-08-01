import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { CATEGORIES, EmptyState, Panel, ProductCard, useWishlist, type Product } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/buyer/browse")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

type Sort = "new" | "price-asc" | "price-desc";

function Page() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [sort, setSort] = useState<Sort>("new");

  const wishlist = useWishlist();
  const saved = new Set((wishlist.data ?? []).map((w) => w.product_id));

  const products = useQuery({
    queryKey: ["products", "all"],
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
    let items = products.data ?? [];
    const needle = q.trim().toLowerCase();
    if (needle) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          (p.location ?? "").toLowerCase().includes(needle),
      );
    }
    if (category !== "all") items = items.filter((p) => p.category === category);
    if (organicOnly) items = items.filter((p) => p.organic);
    if (inStock) items = items.filter((p) => p.stock > 0);
    items = items.filter((p) => Number(p.price) <= maxPrice);
    if (sort === "price-asc") items = [...items].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") items = [...items].sort((a, b) => Number(b.price) - Number(a.price));
    return items;
  }, [products.data, q, category, organicOnly, inStock, maxPrice, sort]);

  return (
    <ModuleLayout module="buyer" title="Browse products" sub="Search, filter and sort produce from verified growers.">
      <Panel className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rice, tomatoes, Salem…"
              className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm capitalize outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none"
            >
              <option value="new">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">
              Max price · ₹{maxPrice}
            </span>
            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-grass-800"
            />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-grass-800 md:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={organicOnly} onChange={(e) => setOrganicOnly(e.target.checked)} className="accent-grass-800" />
              Organic only
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-grass-800" />
              In stock only
            </label>
          </div>
        </div>
      </Panel>

      <p className="mb-4 text-sm text-grass-700">
        {products.isLoading ? "Loading produce…" : `${list.length} product${list.length === 1 ? "" : "s"} found`}
      </p>

      {list.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} saved={saved.has(p.id)} />
          ))}
        </div>
      ) : (
        !products.isLoading && (
          <EmptyState title="Nothing matches yet" body="Try widening your price range or clearing the filters." />
        )
      )}
    </ModuleLayout>
  );
}
