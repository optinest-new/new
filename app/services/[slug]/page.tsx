import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { getServiceBySlug, serviceDefinitions } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

function getFlowIcon(step: string, index: number) {
  const normalized = step.toLowerCase();

  if (normalized.includes("discovery") || normalized.includes("research") || normalized.includes("planning")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  if (normalized.includes("audit") || normalized.includes("strategy") || normalized.includes("map")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  }

  if (normalized.includes("execution") || normalized.includes("build") || normalized.includes("sprint")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 2.4-8.4z" />
      </svg>
    );
  }

  if (normalized.includes("report") || normalized.includes("launch") || normalized.includes("stabilization")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 19V5M10 19V9M14 19V12M18 19V7" />
      </svg>
    );
  }

  const fallbackIndex = index % 4;
  if (fallbackIndex === 0) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="7" />
      </svg>
    );
  }

  if (fallbackIndex === 1) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5v14" />
      </svg>
    );
  }

  if (fallbackIndex === 2) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m5 12 4 4 10-10" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}

export function generateStaticParams() {
  return serviceDefinitions.map((service) => ({ slug: service.slug }));
}

function buildServiceMetaDescription(
  summary: string,
  timeline: string,
  outcome: string
) {
  const composed = `${summary} ${outcome ? `Expected outcome: ${outcome}. ` : ""}Timeline: ${timeline}`;
  if (composed.length <= 170) {
    return composed;
  }
  return `${composed.slice(0, 167).trim()}...`;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    return {};
  }

  const url = `${siteUrl}/services/${service.slug}`;
  const title = `${service.title} Services`;
  const description = buildServiceMetaDescription(
    service.summary,
    service.timeline,
    service.outcomes[0] || ""
  );
  const keywords = [
    `${service.shortLabel.toLowerCase()} services`,
    `${service.shortLabel.toLowerCase()} agency`,
    `${service.title.toLowerCase()}`,
    "lead generation services",
    "conversion-focused website services"
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/services/${service.slug}`
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} | Optinest Digital`,
      description,
      images: ["/og.png"]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Optinest Digital`,
      description,
      images: ["/og.png"]
    }
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  const serviceUrl = `${siteUrl}/services/${service.slug}`;
  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${serviceUrl}#webpage`,
        url: serviceUrl,
        name: `${service.title} Services | Optinest Digital`,
        description: service.summary,
        isPartOf: {
          "@id": `${siteUrl}/#website`
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${siteUrl}/services`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: serviceUrl
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${serviceUrl}#service`,
        name: service.title,
        serviceType: service.shortLabel,
        description: service.intro,
        areaServed: "Worldwide",
        provider: {
          "@type": "Organization",
          name: "Optinest Digital",
          url: siteUrl
        },
        offers: {
          "@type": "Offer",
          url: serviceUrl,
          category: service.shortLabel,
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            description: service.investment
          }
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/services" className="hover:underline">
          Services
        </Link>{" "}
        / <span aria-current="page">{service.title}</span>
      </nav>

      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">{service.shortLabel}</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          {service.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">{service.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#d8ecff] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#134d7a]">
            {service.timeline}
          </span>
          <span className="rounded-full bg-[#fff1c5] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8a5a00]">
            {service.investment}
          </span>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="Service scope and outcomes">
        <article className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6" aria-labelledby="deliverables-heading">
          <h2 id="deliverables-heading" className="font-display text-2xl uppercase leading-[0.95] text-ink">Deliverables</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            {service.deliverables.map((item) => (
              <li key={item} className="rounded-lg border border-ink/15 bg-white px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6" aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="font-display text-2xl uppercase leading-[0.95] text-ink">Expected Outcomes</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            {service.outcomes.map((item) => (
              <li key={item} className="rounded-lg border border-ink/15 bg-white px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6" aria-labelledby="implementation-flow-heading">
        <h2 id="implementation-flow-heading" className="font-display text-2xl uppercase leading-[0.95] text-ink">Implementation Flow</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {service.process.map((step, idx) => (
            <li key={step} className="rounded-xl border border-ink/20 bg-white p-3">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4ff] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#1d4ea5]">
                {getFlowIcon(step, idx)}
                Step {idx + 1}
              </p>
              <p className="mt-1 text-sm text-ink/80">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 text-center shadow-hard sm:p-6" aria-labelledby="start-service-heading">
        <h2 id="start-service-heading" className="font-display text-2xl uppercase leading-[0.95] text-ink">Start This Service</h2>
        <p className="mt-2 text-sm text-ink/80">
          Book a short call and we will confirm scope, timeline, and execution plan.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <ScheduleCallModal
            label="Schedule a Call"
            className="inline-flex items-center rounded-full border-2 border-[#0f7663] bg-[#16a085] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#0f8d74]"
          />
          <Link
            href="/portal"
            className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
          >
            Open Portal
          </Link>
        </div>
      </section>

      <FloatingShare
        title={`${service.title} by Optinest Digital`}
        url={`${siteUrl}/services/${service.slug}`}
        label="Share this page"
      />
      </main>
    </>
  );
}
