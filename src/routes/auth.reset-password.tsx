import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field, SubmitButton } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — Agri on Hands" },
      { name: "description", content: "Choose a new password for your Agri on Hands account." },
      { property: "og:title", content: "Set a New Password — Agri on Hands" },
      { property: "og:description", content: "Choose a new password to secure your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/auth/buyer-login" });
  }

  return (
    <AuthShell title="New password" sub="Pick something strong and memorable.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm password" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <SubmitButton busy={busy}>Update password</SubmitButton>
      </form>
    </AuthShell>
  );
}
