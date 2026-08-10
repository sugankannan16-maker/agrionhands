import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOutAndGoHome } from "@/lib/auth";

type Item = { to: string; label: string; icon: string };

const buyerNav: Item[] = [
  { to: "/buyer/dashboard", label: "Dashboard", icon: "🏡" },
  { to: "/buyer/browse", label: "Browse products", icon: "🧺" },
  { to: "/buyer/cart", label: "Shopping cart", icon: "🛒" },
  { to: "/buyer/wishlist", label: "Wishlist", icon: "💚" },
  { to: "/buyer/orders", label: "Order history", icon: "📦" },
  { to: "/buyer/settings", label: "Profile & settings", icon: "⚙️" },
];

const sellerNav: Item[] = [
  { to: "/seller/dashboard", label: "Dashboard", icon: "🌱" },
  { to: "/seller/add-product", label: "Add new product", icon: "➕" },
  { to: "/seller/products", label: "Manage products", icon: "🗂️" },
  { to: "/seller/orders", label: "View orders", icon: "📬" },
  { to: "/seller/analytics", label: "Sales analytics", icon: "📈" },
  { to: "/seller/inventory", label: "Inventory", icon: "📊" },
  { to: "/seller/settings", label: "Profile & settings", icon: "⚙️" },
];

/** Shared shell for buyer and seller module pages: side navigation + animated content area. */
export function ModuleLayout({
  module,
  title,
  sub,
  actions,
  children,
}: {
  module: "buyer" | "seller";
  title: string;
  sub?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const items = module === "buyer" ? buyerNav : sellerNav;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="container-page py-8 md:py-12">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="glass rounded-3xl p-3">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-grass-600">
              {module} module
            </p>
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = pathname === i.to;
                return (
                  <li key={i.to}>
                    <Link
                      to={i.to}
                      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        active
                          ? "bg-grass-800 text-grass-50 font-semibold shadow-md"
                          : "text-grass-800 hover:bg-grass-100 hover:translate-x-0.5"
                      }`}
                    >
                      <span aria-hidden>{i.icon}</span>
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={signOutAndGoHome}
              className="mt-2 w-full rounded-2xl px-3 py-2.5 text-left text-sm text-grass-700 transition hover:bg-grass-100"
            >
              <span aria-hidden className="mr-2.5">↩</span>Sign out
            </button>
          </nav>
        </aside>

        <section key={pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
                {title}
              </h1>
              {sub && <p className="mt-2 text-sm text-grass-700">{sub}</p>}
            </div>
            {actions}
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
