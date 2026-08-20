import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Crop Marketplace — Agri on Hands" },
      { name: "description", content: "Buy fresh crops directly from farmers or submit your harvest for sale on the Agri on Hands crop marketplace." },
      { property: "og:title", content: "Crop Marketplace — Agri on Hands" },
      { property: "og:description", content: "Buy crops or sell your harvest in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: profile } = useProfile();

  return (
    <div className="container-page py-10 md:py-16">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl text-leaf-gradient" style={{ fontFamily: "var(--font-display)" }}>
          Crop Marketplace
        </h1>
        <p className="mt-3 text-sm md:text-base text-grass-700">
          {profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}. ` : ""}
          What would you like to do today?
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Link
          to="/market/buy"
          className="glass group rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
        >
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-grass-100 text-4xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
            🧺
          </span>
          <h2 className="mt-5 text-2xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
            Buy Crops
          </h2>
          <p className="mt-2 text-sm text-grass-700">
            Browse fresh harvests with prices and quantities, then pay securely with GPay or PhonePe.
          </p>
          <span className="ripple-btn mt-6 inline-block rounded-full bg-grass-800 px-6 py-2.5 text-sm font-semibold text-grass-50">
            Start buying
          </span>
        </Link>

        <Link
          to="/market/sell"
          className="glass group rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
        >
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-grass-100 text-4xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
            🌾
          </span>
          <h2 className="mt-5 text-2xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
            Sell Crops
          </h2>
          <p className="mt-2 text-sm text-grass-700">
            Tell us about your harvest — crop, quantity, price and photo — and we will list it for buyers.
          </p>
          <span className="ripple-btn mt-6 inline-block rounded-full bg-grass-800 px-6 py-2.5 text-sm font-semibold text-grass-50">
            Start selling
          </span>
        </Link>
      </div>

      <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3 text-sm">
        <Link to="/buyer/dashboard" className="rounded-full glass px-5 py-2.5 text-grass-800">Buyer dashboard</Link>
        <Link to="/seller/dashboard" className="rounded-full glass px-5 py-2.5 text-grass-800">Seller dashboard</Link>
        <Link to="/history" className="rounded-full glass px-5 py-2.5 text-grass-800">My activity</Link>
      </div>
    </div>
  );
}
