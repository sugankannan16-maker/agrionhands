import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RoleGate, useAuthUser } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { CATEGORIES, Panel } from "@/components/shop/shop";
import { logActivity } from "@/lib/activity";


export const Route = createFileRoute("/_authenticated/seller/add-product")({
  component: () => (
    <RoleGate role="seller">
      <Page />
    </RoleGate>
  ),
});

const field =
  "mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15";
const label = "text-xs font-semibold uppercase tracking-wider text-grass-700";

function Page() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "grains",
    price: "",
    unit: "kg",
    stock: "",
    image_url: "",
    location: "",
    organic: false,
    harvest_date: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) return toast.error("Give your product a name.");
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price <= 0) return toast.error("Enter a valid price.");
    if (!Number.isFinite(stock) || stock < 0) return toast.error("Enter a valid stock quantity.");

    setSaving(true);
    const { error } = await supabase.from("products").insert({
      seller_id: user.id,
      title: form.title.trim().slice(0, 120),
      description: form.description.trim().slice(0, 2000),
      category: form.category,
      price,
      unit: form.unit,
      stock,
      image_url: form.image_url.trim() || null,
      location: form.location.trim() || null,
      organic: form.organic,
      harvest_date: form.harvest_date || null,
      is_active: true,
    });
    setSaving(false);

    if (error) return toast.error(error.message);
    void logActivity({
      category: "marketplace",
      title: `Listed product — ${form.title.trim()}`,
      detail: `${form.category} · ₹${price}/${form.unit} · stock ${stock}`,
      link: "/seller/products",
    });
    toast.success("Product listed!");
    qc.invalidateQueries();
    navigate({ to: "/seller/products" });

  }

  return (
    <ModuleLayout module="seller" title="Add new product" sub="List fresh produce for buyers across the region.">
      <Panel>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={label}>Product name</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Organic Ponni rice" className={field} required />
          </label>

          <label className="block md:col-span-2">
            <span className={label}>Description</span>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Variety, growing method, packaging…" className={field} />
          </label>

          <label className="block">
            <span className={label}>Category</span>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={`${field} capitalize`}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={label}>Unit</span>
            <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={field}>
              {["kg", "quintal", "litre", "dozen", "piece", "bag"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={label}>Price per unit (₹)</span>
            <input type="number" min="1" step="0.5" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="65" className={field} required />
          </label>

          <label className="block">
            <span className={label}>Stock available</span>
            <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="500" className={field} required />
          </label>

          <label className="block">
            <span className={label}>Farm location</span>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Salem, Tamil Nadu" className={field} />
          </label>

          <label className="block">
            <span className={label}>Harvest date</span>
            <input type="date" value={form.harvest_date} onChange={(e) => set("harvest_date", e.target.value)} className={field} />
          </label>

          <label className="block md:col-span-2">
            <span className={label}>Image URL (optional)</span>
            <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" className={field} />
          </label>

          <label className="flex items-center gap-2 text-sm text-grass-800 md:col-span-2">
            <input type="checkbox" checked={form.organic} onChange={(e) => set("organic", e.target.checked)} className="accent-grass-800" />
            Certified organic
          </label>

          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className="ripple-btn w-full rounded-full bg-grass-800 py-3 text-sm font-semibold text-grass-50 disabled:opacity-60 md:w-auto md:px-8">
              {saving ? "Publishing…" : "Publish listing"}
            </button>
          </div>
        </form>
      </Panel>
    </ModuleLayout>
  );
}
