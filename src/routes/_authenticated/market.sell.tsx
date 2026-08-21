import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser, useProfile } from "@/lib/auth";
import { Panel, inr } from "@/components/shop/shop";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/market/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Crops — Agri on Hands" },
      { name: "description", content: "Submit your harvest details — crop, variety, quantity, expected price, quality and photo — to sell directly to buyers." },
      { property: "og:title", content: "Sell Your Crops — Agri on Hands" },
      { property: "og:description", content: "Submit your harvest and reach verified buyers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const field =
  "mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm text-grass-900 outline-none transition focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15";
const labelCls = "text-xs font-semibold uppercase tracking-wider text-grass-700";

type Submitted = {
  ref_code: string;
  crop_name: string;
  variety: string;
  quantity: string;
  expected_price: number;
  location: string;
  harvest_date: string;
  grade: string;
  organic: boolean;
  notes: string;
};

const empty = {
  seller_name: "",
  mobile: "",
  crop_name: "",
  variety: "",
  quantity: "",
  expected_price: "",
  location: "",
  harvest_date: "",
  grade: "A",
  organic: "normal",
  notes: "",
};

function Page() {
  const { user } = useAuthUser();
  const { data: profile } = useProfile();
  const [form, setForm] = useState({ ...empty });
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Submitted | null>(null);

  const set =
    (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const name = form.seller_name.trim() || profile?.full_name?.trim() || "";
    if (!name) return toast.error("Please enter your name.");
    if (!/^\d{10}$/.test(form.mobile.trim())) return toast.error("Enter a valid 10-digit mobile number.");
    if (!form.crop_name.trim()) return toast.error("Please enter the crop name.");
    if (!form.quantity.trim()) return toast.error("Please enter the quantity.");
    if (!Number(form.expected_price)) return toast.error("Please enter an expected price.");
    if (!form.location.trim()) return toast.error("Please enter your location.");

    setBusy(true);
    let photo_path: string | null = null;
    if (photo) {
      const ext = photo.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("crop-photos").upload(path, photo);
      if (upErr) {
        setBusy(false);
        toast.error(upErr.message);
        return;
      }
      photo_path = path;
    }

    const { data, error } = await supabase
      .from("sell_requests")
      .insert({
        user_id: user.id,
        seller_name: name,
        mobile: form.mobile.trim(),
        crop_name: form.crop_name.trim(),
        variety: form.variety.trim() || null,
        quantity: form.quantity.trim(),
        expected_price: Number(form.expected_price),
        location: form.location.trim(),
        harvest_date: form.harvest_date || null,
        grade: form.grade,
        organic: form.organic === "organic",
        notes: form.notes.trim() || null,
        photo_path,
      })
      .select("ref_code")
      .single();

    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not submit your request.");
      return;
    }

    await logActivity({
      category: "marketplace",
      title: `Submitted a crop selling request for ${form.crop_name.trim()}`,
      detail: `Reference ${data.ref_code} · ${form.quantity.trim()} at ${inr(Number(form.expected_price))}`,
      link: "/market/sell",
    });

    toast.success("Your crop selling request has been submitted successfully!");
    setDone({
      ref_code: data.ref_code,
      crop_name: form.crop_name.trim(),
      variety: form.variety.trim(),
      quantity: form.quantity.trim(),
      expected_price: Number(form.expected_price),
      location: form.location.trim(),
      harvest_date: form.harvest_date,
      grade: form.grade,
      organic: form.organic === "organic",
      notes: form.notes.trim(),
    });
    setForm({ ...empty });
    setPhoto(null);
  }

  if (done) {
    return (
      <div className="container-page py-10 md:py-16">
        <div className="mx-auto max-w-xl text-center animate-in fade-in zoom-in-95 duration-500">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-grass-100 text-4xl" aria-hidden>🌾</span>
          <h1 className="mt-5 text-3xl md:text-4xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
            Your crop selling request has been submitted successfully!
          </h1>
          <p className="mt-3 text-sm text-grass-700">Our team will contact you on your mobile number shortly.</p>
        </div>

        <Panel className="mx-auto mt-8 max-w-xl">
          <dl className="text-sm">
            {[
              ["Request ID", done.ref_code],
              ["Crop", done.crop_name],
              ["Variety", done.variety || "—"],
              ["Quantity", done.quantity],
              ["Expected price", inr(done.expected_price)],
              ["Location", done.location],
              ["Harvest date", done.harvest_date ? new Date(done.harvest_date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"],
              ["Quality grade", done.grade],
              ["Type", done.organic ? "Organic" : "Normal"],
              ["Additional info", done.notes || "—"],
              ["Status", "Submitted"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-start justify-between gap-4 border-b border-grass-800/10 py-2.5 last:border-0">
                <dt className="text-xs uppercase tracking-wider text-grass-600">{k}</dt>
                <dd className="text-right font-semibold text-grass-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setDone(null)}
            className="ripple-btn rounded-full bg-grass-800 px-5 py-2.5 font-semibold text-grass-50"
          >
            Submit another crop
          </button>
          <Link to="/marketplace" className="rounded-full glass px-5 py-2.5 text-grass-800">Marketplace</Link>
          <Link to="/market/buy" className="rounded-full glass px-5 py-2.5 text-grass-800">Buy crops</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
            Sell your crops
          </h1>
          <p className="mt-2 text-sm text-grass-700">Tell us about your harvest and we will connect you with buyers.</p>
        </div>
        <Link to="/marketplace" className="rounded-full glass px-4 py-2.5 text-sm text-grass-800">Back</Link>
      </header>

      <Panel className="mx-auto max-w-3xl">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Your name *</span>
            <input className={field} required value={form.seller_name} onChange={set("seller_name")} placeholder={profile?.full_name ?? "Kumar S."} />
          </label>
          <label className="block">
            <span className={labelCls}>Mobile number *</span>
            <input className={field} required inputMode="numeric" maxLength={10} value={form.mobile} onChange={set("mobile")} placeholder="10-digit number" />
          </label>
          <label className="block">
            <span className={labelCls}>Crop name *</span>
            <input className={field} required value={form.crop_name} onChange={set("crop_name")} placeholder="Paddy" />
          </label>
          <label className="block">
            <span className={labelCls}>Variety</span>
            <input className={field} value={form.variety} onChange={set("variety")} placeholder="Ponni" />
          </label>
          <label className="block">
            <span className={labelCls}>Quantity *</span>
            <input className={field} required value={form.quantity} onChange={set("quantity")} placeholder="500 kg" />
          </label>
          <label className="block">
            <span className={labelCls}>Expected price (₹) *</span>
            <input className={field} required type="number" min={1} value={form.expected_price} onChange={set("expected_price")} placeholder="12000" />
          </label>
          <label className="block">
            <span className={labelCls}>Location *</span>
            <input className={field} required value={form.location} onChange={set("location")} placeholder="Salem, Tamil Nadu" />
          </label>
          <label className="block">
            <span className={labelCls}>Harvest date</span>
            <input className={field} type="date" value={form.harvest_date} onChange={set("harvest_date")} />
          </label>
          <label className="block">
            <span className={labelCls}>Quality grade</span>
            <select className={field} value={form.grade} onChange={set("grade")}>
              <option value="A">Grade A — premium</option>
              <option value="B">Grade B — standard</option>
              <option value="C">Grade C — basic</option>
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Type</span>
            <select className={field} value={form.organic} onChange={set("organic")}>
              <option value="normal">Normal</option>
              <option value="organic">Organic</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Crop photo</span>
            <input
              className={field}
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Additional information</span>
            <textarea className={field} rows={4} value={form.notes} onChange={set("notes")} maxLength={1000} placeholder="Storage, transport, or anything a buyer should know." />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="ripple-btn w-full rounded-full bg-grass-800 py-3 text-sm font-semibold text-grass-50 disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit selling request"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
