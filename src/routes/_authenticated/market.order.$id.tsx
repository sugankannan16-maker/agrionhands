import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, Panel, inr } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/market/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Successful — Agri on Hands" },
      { name: "description", content: "Your crop order confirmation with order ID, crop, quantity, amount paid and status." },
      { property: "og:title", content: "Order Successful — Agri on Hands" },
      { property: "og:description", content: "Crop order confirmation details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type OrderRow = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string | null;
  shipping_address: string | null;
  contact_phone: string | null;
};

type ItemRow = { id: string; title: string; quantity: number; unit_price: number; status: string };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-grass-800/10 py-2.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-grass-600">{label}</dt>
      <dd className="text-right text-sm font-semibold text-grass-900">{value}</dd>
    </div>
  );
}

function Page() {
  const { id } = Route.useParams();

  const order = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, payment_method, shipping_address, contact_phone")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as OrderRow | null;
    },
  });

  const items = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, title, quantity, unit_price, status")
        .eq("order_id", id);
      if (error) throw error;
      return (data ?? []) as ItemRow[];
    },
  });

  if (order.isLoading) {
    return (
      <div className="container-page py-12">
        <Panel className="animate-pulse text-sm text-grass-700">Loading your order…</Panel>
      </div>
    );
  }

  if (!order.data) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Order not found"
          body="We couldn't find this order on your account."
          action={
            <Link to="/market/buy" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
              Back to crops
            </Link>
          }
        />
      </div>
    );
  }

  const o = order.data;
  const list = items.data ?? [];

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mx-auto max-w-xl text-center animate-in fade-in zoom-in-95 duration-500">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-grass-100 text-4xl" aria-hidden>✅</span>
        <h1 className="mt-5 text-4xl md:text-5xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
          Your Order is Successful!
        </h1>
        <p className="mt-3 text-sm text-grass-700">
          Thank you — the farmer has been notified and will start preparing your crop.
        </p>
      </div>

      <Panel className="mx-auto mt-8 max-w-xl">
        <dl>
          <Row label="Order ID" value={`#${o.id.slice(0, 8).toUpperCase()}`} />
          {list.map((i) => (
            <Row key={i.id} label="Crop" value={`${i.title} × ${i.quantity}`} />
          ))}
          <Row label="Amount paid" value={inr(Number(o.total))} />
          <Row
            label="Order date"
            value={new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          />
          <Row label="Payment" value={o.payment_method === "phonepe" ? "PhonePe" : o.payment_method === "gpay" ? "Google Pay" : "UPI"} />
          {o.shipping_address && <Row label="Delivery to" value={o.shipping_address} />}
          {o.contact_phone && <Row label="Contact" value={o.contact_phone} />}
          <Row label="Order status" value="Successful" />
        </dl>
      </Panel>

      <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-3 text-sm">
        <Link to="/market/buy" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 font-semibold text-grass-50">
          Continue shopping
        </Link>
        <Link to="/buyer/orders" className="rounded-full glass px-5 py-2.5 text-grass-800">My orders</Link>
        <Link to="/marketplace" className="rounded-full glass px-5 py-2.5 text-grass-800">Marketplace</Link>
      </div>
    </div>
  );
}
