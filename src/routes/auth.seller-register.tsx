import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, RegisterForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/seller-register")({
  head: () => ({
    meta: [
      { title: "Register Your Farm — Agri on Hands Sellers" },
      { name: "description", content: "Create a seller account on Agri on Hands to list crops, manage inventory and sell directly to buyers." },
      { property: "og:title", content: "Register Your Farm — Agri on Hands" },
      { property: "og:description", content: "List your harvest and sell directly, with no middlemen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AuthShell
      title="Sell with us"
      sub="List your harvest and reach buyers directly."
      footer={<p>Already selling? <Link to="/auth/seller-login" className="story-link font-semibold">Sign in</Link></p>}
    >
      <RegisterForm role="seller" />
    </AuthShell>
  );
}
