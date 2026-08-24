import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Chrome";
import { Button } from "@/components/ui/button";

export function AuthShell({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-14 md:py-20">
      <div className="glass rounded-3xl p-7 md:p-9 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-3xl text-center text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        <p className="text-sm text-grass-700 text-center mt-2">{sub}</p>
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-grass-700 space-y-1.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-grass-700">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-grass-800/15 bg-white/70 px-3.5 py-2.5 text-sm text-grass-900 outline-none transition focus:border-grass-800/40 focus:ring-2 focus:ring-grass-800/15"
      />
    </label>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="ripple-btn w-full rounded-full bg-grass-800 py-3 text-sm font-semibold text-grass-50 transition hover:bg-grass-900 disabled:opacity-60"
    >
      {busy ? "Please wait…" : children}
    </button>
  );
}

/** Shared login form for both buyer and seller portals. */
export function LoginForm({ role }: { role: "buyer" | "seller" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNeedsConfirmation(false);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      if (error.code === "email_not_confirmed") {
        setNeedsConfirmation(true);
        toast.error("Confirm your email before signing in.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/marketplace" });
  }

  async function resendConfirmation() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error("Enter your email address first.");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/buyer-login` },
    });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation email sent. Please check your inbox and spam folder.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <SubmitButton busy={busy}>Sign in</SubmitButton>
      {needsConfirmation && (
        <div role="alert" className="rounded-xl border border-grass-800/15 bg-grass-50/80 p-3 text-center">
          <p className="text-sm font-semibold text-grass-900">Please confirm your email</p>
          <p className="mt-1 text-xs text-grass-700">Open the confirmation link we sent, then return here to sign in.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resending}
            onClick={resendConfirmation}
            className="mt-3 rounded-full border-grass-800/20 bg-transparent text-grass-800 hover:bg-grass-800/10"
          >
            {resending ? "Sending…" : "Resend confirmation email"}
          </Button>
        </div>
      )}
      <p className="text-center text-xs text-grass-700">
        <Link to="/auth/forgot-password" className="story-link">Forgot your password?</Link>
      </p>
    </form>
  );
}

/** Shared registration form for both portals. */
export function RegisterForm({ role }: { role: "buyer" | "seller" }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", business: "", location: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          business_name: form.business.trim(),
          location: form.location.trim(),
          role,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Account created. Check your email to confirm your account before signing in.");
      navigate({ to: role === "buyer" ? "/auth/buyer-login" : "/auth/seller-login" });
      return;
    }
    toast.success("Account created. Welcome to Agri on Hands!");
    navigate({ to: "/marketplace" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name" required value={form.fullName} onChange={set("fullName")} placeholder="Kumar S." />
      <Field label="Email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
      <Field label="Password" type="password" required minLength={8} value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
      <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="9345475663" />
      <Field
        label={role === "seller" ? "Farm / shop name" : "Company (optional)"}
        value={form.business}
        onChange={set("business")}
        placeholder={role === "seller" ? "Green Valley Farms" : ""}
      />
      <Field label="Location" value={form.location} onChange={set("location")} placeholder="Salem, Tamil Nadu" />
      <SubmitButton busy={busy}>Create {role} account</SubmitButton>
    </form>
  );
}
