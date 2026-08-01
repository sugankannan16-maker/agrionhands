import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AuthShell, LoginForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/auth/buyer-login")({
  head: () => ({
    meta: [
      { title: "Buyer Sign In — Agri on Hands Marketplace" },
      { name: "description", content: "Sign in to your Agri on Hands buyer account to browse fresh farm produce, track orders and manage your cart." },
      { property: "og:title", content: "Buyer Sign In — Agri on Hands" },
      { property: "og:description", content: "Access your buyer dashboard, cart, wishlist and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AuthShell
      title="Buyer sign in"
      sub="Fresh produce, straight from the field."
      footer={
        <>
          <p>New here? <Link to="/auth/buyer-register" className="story-link font-semibold">Create a buyer account</Link></p>
          <p>Selling instead? <Link to="/auth/seller-login" className="story-link">Seller portal</Link></p>
        </>
      }
    >
      <LoginForm role="buyer" />
    </AuthShell>
  );
}
