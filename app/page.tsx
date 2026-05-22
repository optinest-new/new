import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ScheduleCallModal } from "@/components/schedule-call-modal";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
const localAddress = {
  "@type": "PostalAddress",
  addressLocality: "Manila",
  addressRegion: "Metro Manila",
  addressCountry: "PH"
};
const servedAreas = [
  { "@type": "City", name: "Manila" },
  { "@type": "Country", name: "Philippines" },
  "Worldwide"
];

export const metadata: Metadata = {
  title: "Manila SEO, Web Design, and Web Development Services for Businesses",
  description:
    "Optinest Digital is a Manila, Philippines-based agency helping businesses worldwide with technical SEO, conversion-focused web design, and web development for qualified lead growth.",
  keywords: [
    "manila seo agency",
    "seo services philippines",
    "web design manila",
    "web development philippines",
    "local seo manila",
    "technical seo for businesses",
    "lead generation website services"
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Optinest Digital | Manila SEO, Web Design, and Development for Businesses",
    description:
      "Based in Manila, Philippines and serving worldwide businesses with technical SEO and conversion-focused website services.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinest Digital | Manila SEO and Web Design Agency",
    description:
      "Manila-based SEO, web design, and web development for businesses that need qualified leads and measurable growth.",
    images: ["/og.png"]
  }
};

const seoSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Optinest Digital",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/icon.svg`,
      description:
        "Optinest Digital is a Manila, Philippines-based SEO, web design, and web development agency serving businesses worldwide with technical execution focused on qualified leads.",
      founder: { "@type": "Person", name: "Optinest Digital", jobTitle: "Senior SEO Specialist and Web Developer" },
      address: localAddress,
      areaServed: servedAreas,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "optinestdigital@gmail.com",
          areaServed: ["PH", "Worldwide"],
          availableLanguage: ["English"]
        }
      ],
      sameAs: ["https://facebook.com/optinestdigital", "https://x.com/optinestdigital"]
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#localbusiness`,
      name: "Optinest Digital",
      url: `${siteUrl}/`,
      image: `${siteUrl}/og.png`,
      email: "optinestdigital@gmail.com",
      address: localAddress,
      areaServed: servedAreas,
      serviceType: [
        "Technical SEO Services",
        "Local SEO Services",
        "Web Design Services",
        "Web Development Services"
      ],
      parentOrganization: { "@id": `${siteUrl}/#organization` }
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Optinest Digital",
      publisher: { "@id": `${siteUrl}/#organization` }
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: "Optinest Digital | Manila SEO, Web Design, and Development for Businesses",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` }
    }
  ]
};

const metrics = [
  { value: "+150%", label: "Average lead growth", tone: "bg-primary text-black" },
  { value: "0.8s", label: "Load speed targets", tone: "bg-mist text-ink" },
  { value: "24/7", label: "SEO visibility tracking", tone: "bg-mist text-ink" }
];

const services = [
  {
    title: "Web design",
    description: "Conversion-first websites with stronger messaging, cleaner UX, and harder-working landing pages.",
    tags: ["UX Strategy", "Conversion Systems"]
  },
  {
    title: "SEO execution",
    description: "Technical audits, content architecture, internal linking, and ranking systems mapped to business goals.",
    tags: ["Technical SEO", "Content Mapping"]
  },
  {
    title: "Web development",
    description: "Fast builds, scalable components, and clean implementation across public sites, tools, and client portals.",
    tags: ["Next.js", "Performance"]
  }
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
      <main className="relative overflow-hidden">
        <div aria-hidden="true" className="checker-bg" />

        <section className="relative mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_380px] lg:gap-10">
            <div>
              <p className="eyebrow-pop animate-fade-up opacity-0" style={{ animationDelay: "0ms" }}>
                Digital growth agency
              </p>
              <h1
                className="hero-title mt-6 max-w-5xl font-display text-[clamp(3.1rem,11vw,7rem)] uppercase leading-[0.9] tracking-[-0.06em] animate-fade-up opacity-0"
                style={{ animationDelay: "120ms" }}
              >
                <span className="hero-line hero-line-top">Web design & seo</span>
                <br />
                <span className="hero-line hero-line-bottom">that drives growth</span>
              </h1>
              <p
                className="tagline-pop mt-6 max-w-3xl border-2 border-line/85 px-5 py-5 text-base font-medium leading-8 text-ink/88 animate-fade-up opacity-0 sm:text-lg"
                style={{ animationDelay: "240ms" }}
              >
                We build high-performance websites, SEO systems, and conversion-focused user journeys for businesses that need clearer positioning and more qualified leads.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 animate-fade-up opacity-0" style={{ animationDelay: "360ms" }}>
                <ScheduleCallModal label="Launch Growth Sprint" className="inline-flex items-center border-2 border-black bg-primary px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg" />
                <Link href="/services">
                  <Button variant="secondary" size="lg">Explore Services</Button>
                </Link>
              </div>
            </div>

            <aside className="grid gap-4 animate-fade-up opacity-0" style={{ animationDelay: "420ms" }}>
              <div className="neo-panel p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Growth metric</p>
                <div className="mt-4 space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className={`border-2 border-black px-4 py-4 ${metric.tone}`}>
                      <p className="font-display text-5xl uppercase leading-none tracking-[-0.06em]">{metric.value}</p>
                      <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-2 border-line/85 bg-surface-dim p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Positioning</p>
                <p className="mt-3 font-display text-3xl uppercase leading-[0.92] tracking-[-0.04em] text-ink">
                  Built for serious brands that want sharper digital systems.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y-2 border-line/15 bg-surface-dim">
          <div className="mx-auto grid w-full max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={`${metric.label}-rail`}
                className={`border-line/15 px-5 py-6 ${index < metrics.length - 1 ? "lg:border-r-2" : ""}`}
              >
                <p className="font-display text-5xl uppercase leading-none tracking-[-0.05em] text-primary">{metric.value}</p>
                <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink/62">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary">Core expertise</p>
              <h2 className="mt-2 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink sm:text-5xl">
                Services built on a harder visual system.
              </h2>
            </div>
            <Link href="/clients" className="font-mono text-xs uppercase tracking-[0.16em] text-ink/65 hover:text-primary">
              View client work →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className={`${index === 2 ? "bg-primary text-black" : "bg-mist text-ink"} border-2 border-line/85 p-6 shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg`}
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] opacity-75">Service {index + 1}</p>
                <h3 className="mt-4 font-display text-3xl uppercase leading-[0.94] tracking-[-0.04em]">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 opacity-85">{service.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className={`border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${index === 2 ? "border-black/35 bg-black text-primary" : "border-line/15 bg-surface-dim text-primary"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
