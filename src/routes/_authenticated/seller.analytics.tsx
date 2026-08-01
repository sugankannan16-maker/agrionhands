import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { Panel, StatCard, inr } from "@/components/shop/shop";
import { useSellerData } from "./seller.dashboard";

export const Route = createFileRoute("/_authenticated/seller/analytics")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

function Page() {
  const { orderItems, products } = useSellerData();
  const items = (orderItems.data ?? []).filter((i) => i.status !== "cancelled");

  const revenue = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
  const units = items.reduce((s, i) => s + i.quantity, 0);
  const avg = items.length ? revenue / items.length : 0;

  // Revenue by month (last 6 months)
  const months: { key: string; label: string; total: number }[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date();
    d.setMonth(d.getMonth() - k, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      total: 0,
    });
  }
  for (const i of items) {
    const d = new Date(i.created_at);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.total += Number(i.unit_price) * i.quantity;
  }
  const peak = Math.max(1, ...months.map((m) => m.total));

  // Top products
  const byTitle = new Map<string, { units: number; revenue: number }>();
  for (const i of items) {
    const prev = byTitle.get(i.title) ?? { units: 0, revenue: 0 };
    byTitle.set(i.title, {
      units: prev.units + i.quantity,
      revenue: prev.revenue + Number(i.unit_price) * i.quantity,
    });
  }
  const top = [...byTitle.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  return (
    <ModuleLayout module="seller" title="Sales analytics" sub="Where your revenue is coming from.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={inr(revenue)} sub="Last 12 months" />
        <StatCard label="Units sold" value={String(units)} />
        <StatCard label="Avg order line" value={inr(Math.round(avg))} />
        <StatCard label="Active listings" value={String((products.data ?? []).filter((p) => p.is_active).length)} />
      </div>

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Revenue trend
      </h2>
      <Panel>
        <div className="flex h-52 items-end gap-3">
          {months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] text-grass-600">{m.total > 0 ? inr(m.total) : ""}</span>
              <div
                className="w-full rounded-t-xl bg-grass-800/85 transition-all duration-700"
                style={{ height: `${Math.max(4, (m.total / peak) * 100)}%` }}
                aria-label={`${m.label}: ${inr(m.total)}`}
              />
              <span className="text-xs text-grass-700">{m.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <h2 className="mt-10 mb-4 text-xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
        Best sellers
      </h2>
      <Panel>
        {top.length > 0 ? (
          <ul className="divide-y divide-grass-800/10 text-sm">
            {top.map(([title, v]) => (
              <li key={title} className="flex items-center justify-between gap-3 py-3">
                <span className="text-grass-900">{title}</span>
                <span className="text-grass-700">{v.units} units</span>
                <span className="font-semibold text-grass-900">{inr(v.revenue)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-grass-700">No sales recorded yet — analytics fill in as orders arrive.</p>
        )}
      </Panel>
    </ModuleLayout>
  );
}
