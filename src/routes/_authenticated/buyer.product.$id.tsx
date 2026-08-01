import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import {
  EmptyState,
  Panel,
  ProductImage,
  inr,
  useShopActions,
  useWishlist,
  type Product,
} from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/buyer/product/$id")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const { id } = Route.useParams();
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist } = useShopActions();
  const wishlist = useWishlist();
  const saved = (wishlist.data ?? []).some((w) => w.product_id === id);

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  if (product.isLoading) {
    return (
      <ModuleLayout module="buyer" title="Product">
        <Panel className="animate-pulse text-sm text-grass-700">Loading product…</Panel>
      </ModuleLayout>
    );
  }

  const p = product.data;
  if (!p) {
    return (
      <ModuleLayout module="buyer" title="Product not found">
        <EmptyState
          title="This listing is gone"
          body="It may have been sold out or removed by the seller."
          action={
            <Link to="/buyer/browse" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
              Back to browse
            </Link>
          }
        />
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout module="buyer" title={p.title} sub={p.location ? `Grown in ${p.location}` : undefined}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="overflow-hidden p-0">
          <ProductImage product={p} className="h-72 w-full md:h-96" />
        </Panel>

        <Panel>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-grass-100 px-3 py-1 text-xs font-semibold capitalize text-grass-800">{p.category}</span>
            {p.organic && <span className="rounded-full bg-grass-800 px-3 py-1 text-xs font-semibold text-grass-50">Organic</span>}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.stock > 0 ? "bg-grass-100 text-grass-800" : "bg-red-100 text-red-700"}`}>
              {p.stock > 0 ? `${p.stock} ${p.unit} in stock` : "Sold out"}
            </span>
          </div>

          <p className="mt-5 text-4xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
            {inr(Number(p.price))}
            <span className="text-base text-grass-600"> /{p.unit}</span>
          </p>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-grass-800">
            {p.description || "The seller has not added a description for this listing."}
          </p>

          {p.harvest_date && (
            <p className="mt-4 text-xs text-grass-600">
              Harvested on {new Date(p.harvest_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full glass">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} className="size-9 rounded-full text-lg text-grass-800">−</button>
              <span className="w-10 text-center text-sm font-semibold text-grass-900">{qty}</span>
              <button type="button" onClick={() => setQty((v) => Math.min(p.stock || 99, v + 1))} className="size-9 rounded-full text-lg text-grass-800">+</button>
            </div>
            <button
              type="button"
              disabled={p.stock <= 0}
              onClick={() => addToCart(p.id, qty)}
              className="ripple-btn rounded-full bg-grass-800 px-6 py-2.5 text-sm font-semibold text-grass-50 disabled:opacity-50"
            >
              Add {qty} to cart
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(p.id, saved)}
              className="rounded-full glass px-5 py-2.5 text-sm font-semibold text-grass-800"
            >
              {saved ? "💚 Saved" : "🤍 Save"}
            </button>
          </div>

          <p className="mt-5 text-xs text-grass-600">
            Total for {qty} {p.unit}: <strong className="text-grass-900">{inr(Number(p.price) * qty)}</strong>
          </p>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
