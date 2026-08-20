import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";
import { EmptyState, Panel, ProductImage, inr, type Product } from "@/components/shop/shop";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/market/checkout/$id")({
  component: Page,
});

type Method = "gpay" | "phonepe";

const methods: { id: Method; label: string; icon: string; note: string }[] = [
  { id: "gpay", label: "Google Pay", icon: "🅖", note: "UPI · instant" },
  { id: "phonepe", label: "PhonePe", icon: "🟣", note: "UPI · instant" },
];

const field =
  "mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15";
const label = "text-xs font-semibold uppercase tracking-wider text-grass-700";

function Page() {
  const { id } = Route.useParams();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState<Method>("gpay");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const p = product.data;

  if (product.isLoading) {
    return (
      <div className="container-page py-12">
        <Panel className="animate-pulse text-sm text-grass-700">Loading crop…</Panel>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="This crop is no longer available"
          body="It may have been sold out or removed by the farmer."
          action={
            <Link to="/market/buy" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
              Back to crops
            </Link>
          }
        />
      </div>
    );
  }

  const total = Number(p.price) * qty;

  async function pay() {
    if (!user || !p) return;
    if (!address.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPaying(true);
    // Simulated UPI handoff to the chosen payment app.
    await new Promise((r) => setTimeout(r, 1400));

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        total,
        status: "successful",
        shipping_address: address.trim(),
        contact_phone: phone.trim(),
        payment_method: method,
      })
      .select("id")
      .single();

    if (error || !order) {
      setPaying(false);
      toast.error(error?.message ?? "Payment could not be recorded.");
      return;
    }

    const { error: itemErr } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: p.id,
      seller_id: p.seller_id,
      title: p.title,
      quantity: qty,
      unit_price: Number(p.price),
      status: "pending",
    });
    if (itemErr) {
      setPaying(false);
      toast.error(itemErr.message);
      return;
    }

    await logActivity({
      category: "order",
      title: `Bought ${qty} ${p.unit} of ${p.title}`,
      detail: `Paid ${inr(total)} via ${method === "gpay" ? "Google Pay" : "PhonePe"}`,
      link: `/market/order/${order.id}`,
    });

    setPaying(false);
    navigate({ to: "/market/order/$id", params: { id: order.id } });
  }

  return (
    <div className="container-page py-8 md:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
            Confirm & pay
          </h1>
          <p className="mt-2 text-sm text-grass-700">Review your crop and complete the payment.</p>
        </div>
        <Link to="/market/buy" className="rounded-full glass px-4 py-2.5 text-sm text-grass-800">Back to crops</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Panel className="overflow-hidden p-0">
          <ProductImage product={p} className="aspect-[4/3] w-full" />
          <div className="p-6">
            <h2 className="text-2xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h2>
            <p className="mt-1 text-xs capitalize text-grass-600">
              {p.category}
              {p.organic && " · organic"}
              {p.location && ` · ${p.location}`}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-grass-800">
              {p.description || "Freshly harvested produce from a verified farm."}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-grass-600">Price</dt>
                <dd className="font-semibold text-grass-900">{inr(Number(p.price))} /{p.unit}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-grass-600">Available</dt>
                <dd className="font-semibold text-grass-900">{p.stock} {p.unit}</dd>
              </div>
              {p.harvest_date && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-grass-600">Harvested</dt>
                  <dd className="font-semibold text-grass-900">
                    {new Date(p.harvest_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </Panel>

        <Panel>
          <div>
            <span className={label}>Quantity ({p.unit})</span>
            <div className="mt-2 inline-flex items-center rounded-full glass">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} className="size-10 rounded-full text-lg text-grass-800">−</button>
              <span className="w-12 text-center text-sm font-semibold text-grass-900">{qty}</span>
              <button type="button" onClick={() => setQty((v) => Math.min(p.stock || 99, v + 1))} className="size-10 rounded-full text-lg text-grass-800">+</button>
            </div>
          </div>

          <label className="mt-5 block">
            <span className={label}>Delivery address</span>
            <input className={field} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} placeholder="Door no, street, city, pincode" />
          </label>
          <label className="mt-4 block">
            <span className={label}>Mobile number</span>
            <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={10} placeholder="10-digit number" />
          </label>

          <p className={`${label} mt-6 block`}>Payment method</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  method === m.id
                    ? "border-grass-800 bg-grass-100 shadow-sm"
                    : "border-grass-800/15 bg-white/60 hover:border-grass-800/40"
                }`}
              >
                <span className="text-xl" aria-hidden>{m.icon}</span>
                <span className="mt-1 block text-sm font-semibold text-grass-900">{m.label}</span>
                <span className="block text-[11px] text-grass-600">{m.note}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-grass-100/70 p-4 text-sm">
            <div className="flex justify-between text-grass-700">
              <span>{qty} {p.unit} × {inr(Number(p.price))}</span>
              <span>{inr(total)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-grass-900">
              <span>Total amount</span>
              <span>{inr(total)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={paying || p.stock <= 0}
            onClick={pay}
            className="ripple-btn mt-5 w-full rounded-full bg-grass-800 py-3 text-sm font-semibold text-grass-50 disabled:opacity-60"
          >
            {paying
              ? `Opening ${method === "gpay" ? "Google Pay" : "PhonePe"}…`
              : `Pay ${inr(total)} with ${method === "gpay" ? "GPay" : "PhonePe"}`}
          </button>
          <p className="mt-3 text-center text-[11px] text-grass-600">
            Payments are processed through your UPI app. You will see the order confirmation right after.
          </p>
        </Panel>
      </div>
    </div>
  );
}
