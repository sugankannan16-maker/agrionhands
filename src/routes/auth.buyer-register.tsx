import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, RegisterForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/buyer-register")({
  head: () => ({
    meta: [
      { title: "Create a Buyer Account — Agri on Hands" },
      { name: "description", content: "Register as a buyer on Agri on Hands to purchase grains, vegetables and fruits directly from verified farmers." },
      { property: "og:title", content: "Create a Buyer Account — Agri on Hands" },
      { property: "og:description", content: "Buy directly from verified farmers across Tamil Nadu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AuthShell
      title="Join as a buyer"
      sub="Source produce directly from verified growers."
      footer={<p>Already registered? <Link to="/auth/buyer-login" className="story-link font-semibold">Sign in</Link></p>}
    >
      <RegisterForm role="buyer" />
    </AuthShell>
  );
}
