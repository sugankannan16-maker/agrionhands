import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate, useAuthUser, useProfile } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, Panel, ProductImage, inr, useCart } from "@/components/shop/shop";
import { logActivity } from "@/lib/activity";


export const Route = createFileRoute("/_authenticated/buyer/cart")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const cart = useCart();
  const qc = useQueryClient();
  const { user } = useAuthUser();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = cart.data ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.products?.price ?? 0) * i.quantity, 0);
  const delivery = subtotal > 0 ? Math.min(120, Math.max(40, Math.round(subtotal * 0.03))) : 0;
  const total = subtotal + delivery;

  async function setQty(id: string, quantity: number) {
    if (quantity < 1) return;
    const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  async function checkout() {
    if (!user || items.length === 0) return;
    const shipping = address.trim() || profile?.location || "";
    if (!shipping) return toast.error("Please add a delivery address.");
    setPlacing(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        total,
        shipping_address: shipping,
        contact_phone: phone.trim() || profile?.phone || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !order) {
      setPlacing(false);
      return toast.error(error?.message ?? "Could not place the order.");
    }

    const rows = items
      .filter((i) => i.products)
      .map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        seller_id: i.products!.seller_id,
        title: i.products!.title,
        unit_price: i.products!.price,
        quantity: i.quantity,
      }));

    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      setPlacing(false);
      return toast.error(itemsError.message);
    }

    await supabase.from("cart_items").delete().eq("user_id", user.id);
    void logActivity({
      category: "order",
      title: `Order placed — ${rows.length} item${rows.length === 1 ? "" : "s"}`,
      detail: `${rows.map((r) => `${r.title} ×${r.quantity}`).join(", ")} · Total ${inr(total)}`,
      meta: { order_id: order.id, total },
      link: "/buyer/orders",
    });
    qc.invalidateQueries();
    setPlacing(false);
    toast.success("Order placed! The growers have been notified.");
    navigate({ to: "/buyer/orders" });

  }

  return (
    <ModuleLayout module="buyer" title="Shopping cart" sub="Review your basket and confirm delivery.">
      {items.length === 0 ? (
        <EmptyState
          title="Your basket is empty"
          body="Fill it with something fresh from the fields."
          action={
            <Link to="/buyer/browse" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((i) => (
              <Panel key={i.id} className="flex items-center gap-4 !p-3 transition hover:-translate-y-0.5">
                {i.products && <ProductImage product={i.products} className="size-20 shrink-0 rounded-2xl" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-grass-900">{i.products?.title ?? "Unavailable"}</p>
                  <p className="text-xs text-grass-600">
                    {inr(Number(i.products?.price ?? 0))} /{i.products?.unit}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={() => setQty(i.id, i.quantity - 1)} className="size-7 rounded-full glass text-grass-800">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                    <button type="button" onClick={() => setQty(i.id, i.quantity + 1)} className="size-7 rounded-full glass text-grass-800">+</button>
                    <button type="button" onClick={() => remove(i.id)} className="ml-2 text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
                <p className="shrink-0 font-semibold text-grass-900">
                  {inr(Number(i.products?.price ?? 0) * i.quantity)}
                </p>
              </Panel>
            ))}
          </div>

          <Panel className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm text-grass-800">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Delivery</dt><dd>{inr(delivery)}</dd></div>
              <div className="flex justify-between border-t border-grass-800/10 pt-2 text-base font-semibold text-grass-900">
                <dt>Total</dt><dd>{inr(total)}</dd>
              </div>
            </dl>

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">Delivery address</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder={profile?.location ?? "House, street, city, PIN"}
                className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">Contact phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={profile?.phone ?? "9345475663"}
                className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40"
              />
            </label>

            <button
              type="button"
              onClick={checkout}
              disabled={placing}
              className="ripple-btn mt-5 w-full rounded-full bg-grass-800 py-3 text-sm font-semibold text-grass-50 disabled:opacity-60"
            >
              {placing ? "Placing order…" : `Place order · ${inr(total)}`}
            </button>
          </Panel>
        </div>
      )}
    </ModuleLayout>
  );
}
