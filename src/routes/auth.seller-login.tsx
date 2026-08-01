import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, LoginForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/seller-login")({
  head: () => ({
    meta: [
      { title: "Seller Sign In — Agri on Hands" },
      { name: "description", content: "Sign in to your Agri on Hands seller account to list produce, manage inventory and track sales." },
      { property: "og:title", content: "Seller Sign In — Agri on Hands" },
      { property: "og:description", content: "Manage your listings, orders and sales analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AuthShell
      title="Seller sign in"
      sub="Bring your harvest to the market."
      footer={
        <>
          <p>New seller? <Link to="/auth/seller-register" className="story-link font-semibold">Register your farm</Link></p>
          <p>Buying instead? <Link to="/auth/buyer-login" className="story-link">Buyer portal</Link></p>
        </>
      }
    >
      <LoginForm role="seller" />
    </AuthShell>
  );
}
