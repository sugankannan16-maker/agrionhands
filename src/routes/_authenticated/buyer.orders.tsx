import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate, useAuthUser } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, Panel, inr } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/buyer/orders")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

type OrderItem = { id: string; title: string; quantity: number; unit_price: number; status: string };
type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: string;
  order_items: OrderItem[];
};

const statusTone: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-grass-100 text-grass-800",
  cancelled: "bg-red-100 text-red-700",
};

function Page() {
  const { user } = useAuthUser();
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: ["orders-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, shipping_address, order_items(id, title, quantity, unit_price, status)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  async function cancel(id: string) {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order cancelled.");
    qc.invalidateQueries({ queryKey: ["orders-full"] });
  }

  const list = orders.data ?? [];

  return (
    <ModuleLayout module="buyer" title="Order history" sub="Every basket you've sent to the fields.">
      {list.length === 0 ? (
        !orders.isLoading && (
          <EmptyState
            title="No orders yet"
            body="Once you check out, your orders and their status appear here."
            action={
              <Link to="/buyer/browse" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
                Start shopping
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <Panel key={o.id} className="transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-grass-600">#{o.id.slice(0, 8)}</p>
                  <p className="text-sm text-grass-700">
                    {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone[o.status] ?? "bg-grass-100 text-grass-800"}`}>
                  {o.status}
                </span>
                <p className="text-lg font-semibold text-grass-900">{inr(Number(o.total))}</p>
              </div>

              <ul className="mt-4 divide-y divide-grass-800/10 text-sm">
                {o.order_items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-grass-900">{i.title} × {i.quantity}</span>
                    <span className="text-grass-700">{inr(Number(i.unit_price) * i.quantity)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-grass-600">Delivering to: {o.shipping_address}</p>

              {o.status === "pending" && (
                <button type="button" onClick={() => cancel(o.id)} className="mt-3 text-xs font-semibold text-red-600 hover:underline">
                  Cancel order
                </button>
              )}
            </Panel>
          ))}
        </div>
      )}
    </ModuleLayout>
  );
}
