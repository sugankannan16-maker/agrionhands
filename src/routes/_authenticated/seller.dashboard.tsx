import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate, useAuthUser, useProfile } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { Panel, StatCard, inr, type Product } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/seller/dashboard")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

export function useSellerData() {
  const { user } = useAuthUser();

  const products = useQuery({
    queryKey: ["seller-products", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const orderItems = useQuery({
    queryKey: ["seller-order-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, title, quantity, unit_price, status, created_at, product_id")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        order_id: string;
        title: string;
        quantity: number;
        unit_price: number;
        status: string;
        created_at: string;
        product_id: string | null;
      }[];
    },
  });

  return { products, orderItems };
}

function Page() {
  const { data: profile } = useProfile();
  const { products, orderItems } = useSellerData();

  const items = orderItems.data ?? [];
  const revenue = items
    .filter((i) => i.status !== "cancelled")
    .reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
  const pending = items.filter((i) => i.status === "pending").length;
  const live = (products.data ?? []).filter((p) => p.is_active).length;
  const lowStock = (products.data ?? []).filter((p) => p.stock > 0 && p.stock <= 10).length;

  return (
    <ModuleLayout
      module="seller"
      title={`Namaste${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      sub="How your farm shop is performing today."
      actions={
        <Link to="/seller/add-product" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
          Add new product
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={inr(revenue)} sub="Excluding cancelled" />
        <StatCard label="Live listings" value={String(live)} sub={`${products.data?.length ?? 0} total`} />
        <StatCard label="Pending orders" value={String(pending)} sub="Awaiting confirmation" />
        <StatCard label="Low stock" value={String(lowStock)} sub="10 units or fewer" />
      </div>

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Latest orders
      </h2>
      <Panel>
        {items.length > 0 ? (
          <ul className="divide-y divide-grass-800/10 text-sm">
            {items.slice(0, 6).map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="text-grass-900">{i.title} × {i.quantity}</span>
                <span className="capitalize text-grass-700">{i.status}</span>
                <span className="font-semibold text-grass-900">{inr(Number(i.unit_price) * i.quantity)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-grass-700">No orders yet. Listing more produce helps buyers find you.</p>
        )}
      </Panel>

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Your listings
      </h2>
      <Panel>
        {products.data && products.data.length > 0 ? (
          <ul className="divide-y divide-grass-800/10 text-sm">
            {products.data.slice(0, 6).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link to="/seller/products" className="text-grass-900 hover:underline">{p.title}</Link>
                <span className="text-grass-700">{p.stock} {p.unit} left</span>
                <span className="font-semibold text-grass-900">{inr(Number(p.price))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-grass-700">
            You haven't listed anything yet.{" "}
            <Link to="/seller/add-product" className="font-semibold underline">Add your first product</Link>.
          </p>
        )}
      </Panel>
    </ModuleLayout>
  );
}
