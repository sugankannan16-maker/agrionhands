import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, Panel, StatCard } from "@/components/shop/shop";
import { useSellerData } from "./seller.dashboard";

export const Route = createFileRoute("/_authenticated/seller/inventory")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const { products } = useSellerData();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const list = products.data ?? [];

  const out = list.filter((p) => p.stock <= 0).length;
  const low = list.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const totalUnits = list.reduce((s, p) => s + p.stock, 0);

  async function save(id: string, current: number) {
    const next = Number(draft[id] ?? current);
    if (!Number.isFinite(next) || next < 0) return toast.error("Enter a valid quantity.");
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Stock updated");
    qc.invalidateQueries({ queryKey: ["seller-products"] });
  }

  return (
    <ModuleLayout module="seller" title="Inventory management" sub="Keep stock levels accurate so buyers aren't disappointed.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total units" value={String(totalUnits)} sub="Across all listings" />
        <StatCard label="Low stock" value={String(low)} sub="10 or fewer units" />
        <StatCard label="Out of stock" value={String(out)} sub="Needs restocking" />
      </div>

      <div className="mt-8 space-y-3">
        {list.length === 0
          ? !products.isLoading && <EmptyState title="Nothing to track yet" body="Add products to manage their inventory." />
          : list.map((p) => (
              <Panel key={p.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-grass-900">{p.title}</p>
                  <p className="text-xs capitalize text-grass-600">{p.category} · priced per {p.unit}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.stock <= 0 ? "bg-red-100 text-red-700" : p.stock <= 10 ? "bg-amber-100 text-amber-800" : "bg-grass-100 text-grass-800"
                  }`}
                >
                  {p.stock <= 0 ? "Out of stock" : p.stock <= 10 ? "Low stock" : "Healthy"}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={draft[p.id] ?? String(p.stock)}
                    onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="w-24 rounded-xl border border-grass-800/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-grass-800/40"
                    aria-label={`Stock for ${p.title}`}
                  />
                  <button type="button" onClick={() => save(p.id, p.stock)} className="ripple-btn rounded-full bg-grass-800 px-4 py-2 text-xs font-semibold text-grass-50">
                    Update
                  </button>
                </div>
              </Panel>
            ))}
      </div>
    </ModuleLayout>
  );
}
