import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field, SubmitButton } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — Agri on Hands" },
      { name: "description", content: "Request a secure password reset link for your Agri on Hands buyer or seller account." },
      { property: "og:title", content: "Reset Your Password — Agri on Hands" },
      { property: "og:description", content: "We'll email you a secure link to set a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  }

  return (
    <AuthShell
      title="Forgot password"
      sub="We'll email you a secure link to set a new one."
      footer={
        <>
          <p><Link to="/auth/buyer-login" className="story-link">Back to buyer sign in</Link></p>
          <p><Link to="/auth/seller-login" className="story-link">Back to seller sign in</Link></p>
        </>
      }
    >
      {sent ? (
        <p className="rounded-2xl bg-grass-100 p-4 text-center text-sm text-grass-800">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
