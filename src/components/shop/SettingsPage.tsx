import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser, useProfile, signOutAndGoHome } from "@/lib/auth";
import { ModuleLayout } from "@/components/shop/ModuleLayout";
import { Panel } from "@/components/shop/shop";

const field =
  "mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15";
const label = "text-xs font-semibold uppercase tracking-wider text-grass-700";

/** Shared profile & settings screen for both buyer and seller modules. */
export function SettingsPage({ module }: { module: "buyer" | "seller" }) {
  const { user } = useAuthUser();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "", business_name: "", avatar_url: "" });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      business_name: profile.business_name ?? "",
      avatar_url: profile.avatar_url ?? "",
    });
  }, [profile]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim().slice(0, 120),
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        business_name: form.business_name.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function resetPassword() {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent to your email.");
  }

  return (
    <ModuleLayout module={module} title="Profile & settings" sub="Keep your details current for smooth deliveries.">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Panel>
          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={label}>Full name</span>
              <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className={label}>Phone</span>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="9345475663" className={field} />
            </label>
            <label className="block">
              <span className={label}>Location</span>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Salem, Tamil Nadu" className={field} />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>{module === "seller" ? "Farm / business name" : "Household or business name"}</span>
              <input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className={field} />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>Avatar URL</span>
              <input value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} placeholder="https://…" className={field} />
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="ripple-btn rounded-full bg-grass-800 px-8 py-3 text-sm font-semibold text-grass-50 disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Panel>

        <Panel className="h-fit">
          <h2 className="text-lg text-grass-900" style={{ fontFamily: "var(--font-display)" }}>Account</h2>
          <p className="mt-2 break-all text-sm text-grass-700">{user?.email}</p>
          <p className="mt-1 text-xs capitalize text-grass-600">{module} account</p>
          <button type="button" onClick={resetPassword} className="mt-5 w-full rounded-full glass py-2.5 text-sm font-semibold text-grass-800">
            Send password reset
          </button>
          <button type="button" onClick={signOutAndGoHome} className="mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            Sign out
          </button>
        </Panel>
      </div>
    </ModuleLayout>
  );
}
