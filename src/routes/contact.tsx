import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/site/SiteProvider";
import { PageHeader } from "@/components/site/Chrome";
import Reveal from "@/components/nature/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Agri on Hands — Salem, Tamil Nadu" },
      { name: "description", content: "Reach the Agri on Hands agronomy team in Salem, Tamil Nadu by phone or email. We reply within one working day." },
      { property: "og:title", content: "Contact Agri on Hands — Salem, Tamil Nadu" },
      { property: "og:description", content: "Phone, email and location for the Agri on Hands agronomy team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { c, isLatin } = useSite();
  const phone = "9345475663";
  const email = "brosugantheking153143@gmail.com";
  const loc = "Salem, Tamil Nadu, India";
  const items = [
    { l: c.contact.phone, v: phone, href: `tel:${phone}` },
    { l: c.contact.email, v: email, href: `mailto:${email}` },
    { l: c.contact.location, v: loc, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` },
  ];

  return (
    <section className="py-14 md:py-20">
      <div className="container-page grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <PageHeader kicker={c.contact.kicker} heading={c.contact.heading} sub={c.contact.sub} />
          <div className="flex flex-wrap gap-3 -mt-4">
            <a href={`tel:${phone}`} className="bg-grass-800 text-grass-50 text-sm font-medium py-3 px-5 rounded-full hover:bg-grass-900 ripple-btn">{c.contact.call}</a>
            <a href={`mailto:${email}`} className="text-grass-900 text-sm font-medium py-3 px-5 rounded-full glass ripple-btn">{c.contact.write}</a>
          </div>
        </div>
        <Reveal>
          <div className="grid gap-3">
            {items.map((it) => (
              <a
                key={it.l}
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="glass rounded-2xl p-5 flex items-center justify-between gap-4 lift-card"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-grass-600 font-semibold">{it.l}</div>
                  <div className={`${isLatin ? "font-serif" : ""} text-lg md:text-xl text-grass-900 mt-0.5 break-all`}>{it.v}</div>
                </div>
                <span aria-hidden className="text-grass-600 text-xl">→</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
