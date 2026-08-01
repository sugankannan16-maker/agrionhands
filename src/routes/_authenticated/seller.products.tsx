import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, Panel, ProductImage, inr } from "@/components/shop/shop";
import { useSellerData } from "./seller.dashboard";

export const Route = createFileRoute("/_authenticated/seller/products")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const { products } = useSellerData();
  const qc = useQueryClient();
  const list = products.data ?? [];

  async function toggleActive(id: string, next: boolean) {
    const { error } = await supabase.from("products").update({ is_active: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next ? "Listing is live" : "Listing hidden");
    qc.invalidateQueries({ queryKey: ["seller-products"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    qc.invalidateQueries({ queryKey: ["seller-products"] });
  }

  return (
    <ModuleLayout
      module="seller"
      title="Manage products"
      sub="Update pricing, visibility and availability."
      actions={
        <Link to="/seller/add-product" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
          Add new product
        </Link>
      }
    >
      {list.length === 0 ? (
        !products.isLoading && (
          <EmptyState
            title="No listings yet"
            body="Add your first product so buyers can find your harvest."
            action={
              <Link to="/seller/add-product" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
                Add new product
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <Panel key={p.id} className="flex flex-wrap items-center gap-4 !p-3">
              <ProductImage product={p} className="size-20 shrink-0 rounded-2xl" />
              <div className="min-w-[160px] flex-1">
                <p className="font-semibold text-grass-900">{p.title}</p>
                <p className="text-xs capitalize text-grass-600">
                  {p.category} · {p.stock} {p.unit} in stock {p.organic && "· organic"}
                </p>
              </div>
              <p className="font-semibold text-grass-900">{inr(Number(p.price))}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.is_active ? "bg-grass-100 text-grass-800" : "bg-grass-800/10 text-grass-700"}`}>
                {p.is_active ? "Live" : "Hidden"}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => toggleActive(p.id, !p.is_active)} className="rounded-full glass px-4 py-1.5 text-xs font-semibold text-grass-800">
                  {p.is_active ? "Hide" : "Publish"}
                </button>
                <button type="button" onClick={() => remove(p.id)} className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </ModuleLayout>
  );
}
