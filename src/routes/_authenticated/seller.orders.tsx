import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, Panel, inr } from "@/components/shop/shop";
import { useSellerData } from "./seller.dashboard";

export const Route = createFileRoute("/_authenticated/seller/orders")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

const flow = ["pending", "confirmed", "shipped", "delivered"] as const;

function Page() {
  const { orderItems } = useSellerData();
  const qc = useQueryClient();
  const items = orderItems.data ?? [];

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("order_items").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    qc.invalidateQueries({ queryKey: ["seller-order-items"] });
  }

  return (
    <ModuleLayout module="seller" title="View orders" sub="Confirm, pack and dispatch buyer orders.">
      {items.length === 0 ? (
        !orderItems.isLoading && <EmptyState title="No orders yet" body="Orders for your listings will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((i) => {
            const next = flow[flow.indexOf(i.status as (typeof flow)[number]) + 1];
            return (
              <Panel key={i.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-grass-900">{i.title} × {i.quantity}</p>
                  <p className="text-xs text-grass-600">
                    Order #{i.order_id.slice(0, 8)} ·{" "}
                    {new Date(i.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                </div>
                <span className="rounded-full bg-grass-100 px-3 py-1 text-xs font-semibold capitalize text-grass-800">{i.status}</span>
                <p className="font-semibold text-grass-900">{inr(Number(i.unit_price) * i.quantity)}</p>
                <div className="flex gap-2">
                  {next && i.status !== "cancelled" && (
                    <button type="button" onClick={() => setStatus(i.id, next)} className="ripple-btn rounded-full bg-grass-800 px-4 py-1.5 text-xs font-semibold text-grass-50">
                      Mark {next}
                    </button>
                  )}
                  {i.status === "pending" && (
                    <button type="button" onClick={() => setStatus(i.id, "cancelled")} className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                      Cancel
                    </button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </ModuleLayout>
  );
}
