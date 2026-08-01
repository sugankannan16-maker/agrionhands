import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate, useAuthUser, useProfile } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { Panel, ProductCard, StatCard, inr, useCart, useWishlist, type Product } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/buyer/dashboard")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const { data: profile } = useProfile();
  const { user } = useAuthUser();
  const cart = useCart();
  const wishlist = useWishlist();

  const orders = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fresh = useQuery({
    queryKey: ["fresh-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const cartTotal = (cart.data ?? []).reduce(
    (s, i) => s + Number(i.products?.price ?? 0) * i.quantity,
    0,
  );
  const spent = (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0);

  return (
    <ModuleLayout
      module="buyer"
      title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      sub="Your marketplace at a glance."
      actions={
        <Link to="/buyer/browse" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
          Browse products
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cart value" value={inr(cartTotal)} sub={`${cart.data?.length ?? 0} items waiting`} />
        <StatCard label="Wishlist" value={String(wishlist.data?.length ?? 0)} sub="Saved for later" />
        <StatCard label="Orders placed" value={String(orders.data?.length ?? 0)} sub="All time" />
        <StatCard label="Total spent" value={inr(spent)} sub="Across all orders" />
      </div>

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Freshly listed
      </h2>
      {fresh.data && fresh.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {fresh.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Panel className="text-sm text-grass-700">
          No produce listed yet. Check back soon — or invite a farmer you know to join as a seller.
        </Panel>
      )}

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Recent orders
      </h2>
      <Panel>
        {orders.data && orders.data.length > 0 ? (
          <ul className="divide-y divide-grass-800/10">
            {orders.data.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-mono text-xs text-grass-600">#{o.id.slice(0, 8)}</span>
                <span className="capitalize text-grass-700">{o.status}</span>
                <span className="font-semibold text-grass-900">{inr(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-grass-700">No orders yet — your first harvest delivery is one click away.</p>
        )}
      </Panel>
    </ModuleLayout>
  );
}
