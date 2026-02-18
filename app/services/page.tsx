import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { serviceDefinitions } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Optinest Digital services for SEO growth, web design, and web development with clear scope, timeline, and investment ranges.",
  alternates: {
    canonical: "/services"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/services`,
    title: "Services | Optinest Digital",
    description:
      "SEO, web design, and web development services focused on qualified traffic and conversion growth.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Optinest Digital",
    description:
      "SEO, web design, and web development services focused on qualified traffic and conversion growth.",
    images: ["/og.png"]
  }
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <header className="mx-auto max-w-4xl text-center">
        <p className="eyebrow-pop mx-auto inline-block">Service Stack</p>
        <h1 className="hero-title mt-5 text-balance font-display text-[clamp(2rem,7vw,4.4rem)] uppercase leading-[0.9] tracking-tight">
          Services Built For Growth
        </h1>
        <p className="tagline-pop mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-4 py-4 font-mono text-sm font-bold leading-relaxed sm:px-6 sm:text-base">
          Choose focused support for SEO, web design, or web development with transparent scope and practical execution.
        </p>
      </header>

      <section aria-label="Service cards" className="mt-10 grid gap-5 md:grid-cols-3">
        {serviceDefinitions.map((service) => (
          <article key={service.slug} className="flex h-full flex-col rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">{service.shortLabel}</p>
            <h2 className="mt-2 font-display text-2xl uppercase leading-[0.95] text-ink">{service.title}</h2>
            <p className="mt-3 flex-1 text-sm text-ink/80">{service.summary}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#1f56c2]">{service.timeline}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#8a5a00]">{service.investment}</p>
            <Link
              href={`/services/${service.slug}`}
              className="mt-5 inline-flex w-fit rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist transition hover:-translate-y-0.5"
            >
              View Service
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border-2 border-ink/80 bg-mist p-5 text-center shadow-hard sm:p-6">
        <p className="text-sm text-ink/80">Need help choosing the right starting point?</p>
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

      <FloatingShare title="Services by Optinest Digital" url={`${siteUrl}/services`} label="Share this page" />
    </main>
  );
}
