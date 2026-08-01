import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { EmptyState, ProductCard, useWishlist } from "@/components/shop/shop";

export const Route = createFileRoute("/_authenticated/buyer/wishlist")({
  component: () => (
    <RoleGate role="buyer">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const wishlist = useWishlist();
  const items = (wishlist.data ?? []).filter((w) => w.products);

  return (
    <ModuleLayout module="buyer" title="Wishlist" sub="Produce you saved for the next harvest run.">
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((w) => (
            <ProductCard key={w.id} product={w.products!} saved />
          ))}
        </div>
      ) : (
        !wishlist.isLoading && (
          <EmptyState
            title="Nothing saved yet"
            body="Tap the heart on any product to keep it here."
            action={
              <Link to="/buyer/browse" className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 text-sm font-semibold text-grass-50">
                Browse products
              </Link>
            }
          />
        )
      )}
    </ModuleLayout>
  );
}
