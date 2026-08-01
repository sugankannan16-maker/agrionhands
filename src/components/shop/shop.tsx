import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  image_url: string | null;
  location: string | null;
  organic: boolean;
  harvest_date: string | null;
  is_active: boolean;
  created_at: string;
};

export const CATEGORIES = ["grains", "vegetables", "fruits", "pulses", "spices", "dairy", "seeds", "other"] as const;

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-5 md:p-6 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Panel className="transition-transform duration-300 hover:-translate-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-grass-600">{label}</p>
      <p className="mt-2 text-3xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-grass-700">{sub}</p>}
    </Panel>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Panel className="text-center py-12">
      <p className="text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
      <p className="mt-2 text-sm text-grass-700">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Panel>
  );
}

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  if (product.image_url) {
    return <img src={product.image_url} alt={product.title} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`grid place-items-center bg-grass-100 text-4xl ${className}`} aria-hidden>
      🌾
    </div>
  );
}

export function useCart() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; quantity: number; product_id: string; products: Product | null }[];
    },
  });
}

export function useWishlist() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id, product_id, products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; product_id: string; products: Product | null }[];
    },
  });
}

export function useShopActions() {
  const qc = useQueryClient();
  const { user } = useAuthUser();

  async function addToCart(productId: string, quantity = 1) {
    if (!user) return toast.error("Please sign in first.");
    const { error } = await supabase
      .from("cart_items")
      .upsert({ user_id: user.id, product_id: productId, quantity }, { onConflict: "user_id,product_id" });
    if (error) return toast.error(error.message);
    toast.success("Added to cart");
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  async function toggleWishlist(productId: string, exists: boolean) {
    if (!user) return toast.error("Please sign in first.");
    const { error } = exists
      ? await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId)
      : await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    if (error) return toast.error(error.message);
    toast.success(exists ? "Removed from wishlist" : "Saved to wishlist");
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  }

  return { addToCart, toggleWishlist };
}

export function ProductCard({ product, saved = false }: { product: Product; saved?: boolean }) {
  const { addToCart, toggleWishlist } = useShopActions();
  return (
    <article className="group glass rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link to="/buyer/product/$id" params={{ id: product.id }} className="block">
        <ProductImage product={product} className="h-40 w-full transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/buyer/product/$id" params={{ id: product.id }} className="text-base font-semibold text-grass-900 leading-tight hover:underline">
            {product.title}
          </Link>
          <button
            type="button"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => toggleWishlist(product.id, saved)}
            className="shrink-0 text-lg leading-none transition-transform hover:scale-125"
          >
            {saved ? "💚" : "🤍"}
          </button>
        </div>
        <p className="mt-1 text-xs capitalize text-grass-600">
          {product.category}
          {product.organic && " · organic"}
          {product.location && ` · ${product.location}`}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-semibold text-grass-900">
            {inr(Number(product.price))}
            <span className="text-xs font-normal text-grass-600"> /{product.unit}</span>
          </p>
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id)}
            className="ripple-btn rounded-full bg-grass-800 px-3.5 py-1.5 text-xs font-semibold text-grass-50 disabled:opacity-50"
          >
            {product.stock > 0 ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}
