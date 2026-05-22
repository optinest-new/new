import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { Card, PricingTierCard, IconSearch, IconDocument, IconCheck, IconPen, IconActivity, Button } from "@/components/ui";
import { getCountryCodeFromHeaders } from "@/lib/geo";
import { buildInvestmentSummary, getPricingCurrencyByCountry, getPricingTiersForCurrency, getServiceBySlug, serviceDefinitions } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type ServicePageProps = { params: Promise<{ slug: string }> };

function getFlowIcon(step: string) {
  const n = step.toLowerCase();
  if (n.includes("discovery") || n.includes("research") || n.includes("planning")) return <IconSearch size={16} />;
  if (n.includes("audit") || n.includes("strategy") || n.includes("map")) return <IconDocument size={16} />;
  if (n.includes("execution") || n.includes("build") || n.includes("sprint")) return <IconPen size={16} />;
  if (n.includes("report") || n.includes("launch") || n.includes("stabilization")) return <IconActivity size={16} />;
  return <IconCheck size={16} />;
}

export function generateStaticParams() {
  return serviceDefinitions.map((service) => ({ slug: service.slug }));
}

function buildServiceMetaDescription(summary: string, timeline: string, outcome: string) {
  const composed = `${summary} ${outcome ? `Expected outcome: ${outcome}. ` : ""}Timeline: ${timeline}`;
  if (composed.length <= 170) return composed;
  return `${composed.slice(0, 167).trim()}...`;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  const url = `${siteUrl}/services/${service.slug}`;
  const title = `${service.title} Services`;
  const description = buildServiceMetaDescription(service.summary, service.timeline, service.outcomes[0] || "");
  const keywords = [
    `${service.shortLabel.toLowerCase()} services`,
    `${service.shortLabel.toLowerCase()} agency`,
    `${service.title.toLowerCase()}`,
    `${service.shortLabel.toLowerCase()} services manila`,
    `${service.shortLabel.toLowerCase()} services philippines`,
    "lead generation services",
    "conversion-focused website services",
    "services for growing businesses"
  ];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/services/${service.slug}` },
    robots: { index: true, follow: true },
    openGraph: { type: "website", url, title: `${title} | Optinest Digital`, description, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: `${title} | Optinest Digital`, description, images: ["/og.png"] }
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const requestHeaders = await headers();
  const countryCode = getCountryCodeFromHeaders(requestHeaders);
  const pricingCurrency = getPricingCurrencyByCountry(countryCode);
  const pricingTiers = getPricingTiersForCurrency(service.pricingTiers, pricingCurrency);
  const investmentSummary = buildInvestmentSummary(service.pricingTiers, pricingCurrency);
  const serviceUrl = `${siteUrl}/services/${service.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "WebPage", "@id": `${serviceUrl}#webpage`, url: serviceUrl, name: `${service.title} Services | Optinest Digital`, description: service.summary, isPartOf: { "@id": `${siteUrl}/#website` } },
              { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` }, { "@type": "ListItem", position: 3, name: service.title, item: serviceUrl }] },
              { "@type": "Service", "@id": `${serviceUrl}#service`, name: service.title, serviceType: service.shortLabel, description: service.intro, areaServed: [{ "@type": "City", name: "Manila" }, { "@type": "Country", name: "Philippines" }, "Worldwide"], provider: { "@type": "Organization", name: "Optinest Digital", url: siteUrl }, offers: { "@type": "Offer", url: serviceUrl, category: service.shortLabel, availability: "https://schema.org/InStock", priceSpecification: { "@type": "PriceSpecification", priceCurrency: pricingCurrency, description: investmentSummary } } }
            ]
          })
        }}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-7 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink/55 sm:text-xs">
          <Link href="/services" className="hover:text-primary">Services</Link> / <span aria-current="page" className="text-primary">{service.title}</span>
        </nav>

        <header className="border-2 border-line/85 bg-mist p-5 shadow-hard sm:p-7">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">{service.shortLabel}</p>
          <h1 className="hero-title mt-4 font-display text-[clamp(2.6rem,8vw,5.6rem)] uppercase leading-[0.92] tracking-[-0.06em] text-ink">
            {service.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink/78">{service.intro}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="border-2 border-line/12 bg-surface-dim p-4">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-primary">Timeline</p>
              <p className="mt-2 font-display text-3xl uppercase leading-[0.92] tracking-[-0.04em] text-ink">{service.timeline}</p>
              <p className="mt-2 text-sm leading-7 text-ink/68">Timeline assumes timely feedback and content approvals.</p>
            </div>
            <div className="border-2 border-black bg-primary p-4 text-black">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em]">Pricing</p>
              <ul className="mt-3 space-y-2">
                {pricingTiers.map((tier) => (
                  <PricingTierCard key={`${service.slug}-${tier.category}`} category={tier.category} range={tier.range} />
                ))}
              </ul>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Service scope and outcomes">
          <Card as="article">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Scope</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Deliverables</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {service.deliverables.map((item) => (
                <li key={item} className="border border-line/12 bg-surface-dim px-3 py-3">{item}</li>
              ))}
            </ul>
          </Card>

          <Card as="article">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Results</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Expected outcomes</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {service.outcomes.map((item) => (
                <li key={item} className="border border-line/12 bg-surface-dim px-3 py-3">{item}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mt-8" aria-labelledby="implementation-flow-heading">
          <Card as="div">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Flow</p>
            <h2 id="implementation-flow-heading" className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Implementation flow</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {service.process.map((step, idx) => (
                <li key={step} className="border-2 border-line/14 bg-surface-dim p-4">
                  <p className="inline-flex items-center gap-2 border-2 border-black bg-primary px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-black">
                    {getFlowIcon(step)}
                    Step {idx + 1}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-ink/78">{step}</p>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        <section className="mt-8 text-center" aria-labelledby="start-service-heading">
          <Card as="div">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Ready to start?</p>
            <h2 id="start-service-heading" className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Start this service</h2>
            <p className="mt-3 text-sm leading-7 text-ink/72">Book a short call and we will confirm scope, timeline, and execution plan.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ScheduleCallModal label="Schedule a Call" className="inline-flex items-center border-2 border-black bg-primary px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg" />
              <Link href="/portal">
                <Button variant="secondary" size="md">Open Portal</Button>
              </Link>
            </div>
          </Card>
        </section>

        <FloatingShare title={`${service.title} by Optinest Digital`} url={serviceUrl} label="Share this page" />
      </main>
    </>
  );
}
