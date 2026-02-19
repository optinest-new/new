import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { serviceDefinitions } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type StackItem = {
  key:
    | "nextjs"
    | "react"
    | "tailwind"
    | "supabase"
    | "ruby"
    | "jekyll"
    | "vercel"
    | "netlify"
    | "astro"
    | "headless-cms"
    | "ga4"
    | "search-console"
    | "tag-manager"
    | "wordpress";
  label: string;
  detail: string;
};

const stackItems: StackItem[] = [
  {
    key: "nextjs",
    label: "Next.js",
    detail: "Fast, SEO-friendly service and landing page builds."
  },
  {
    key: "react",
    label: "React",
    detail: "Reusable UI architecture for scalable client portals."
  },
  {
    key: "tailwind",
    label: "Tailwind CSS",
    detail: "Rapid design system delivery with consistent frontend quality."
  },
  {
    key: "supabase",
    label: "Supabase",
    detail: "Auth, database, and storage for portal workflows."
  },
  {
    key: "ruby",
    label: "Ruby",
    detail: "Reliable scripting and content/data processing workflows."
  },
  {
    key: "jekyll",
    label: "Jekyll",
    detail: "Static site generation for lean JAMstack publishing."
  },
  {
    key: "vercel",
    label: "Vercel",
    detail: "Edge deployment and preview workflows for frontend teams."
  },
  {
    key: "netlify",
    label: "Netlify",
    detail: "Static hosting, forms, and build pipelines for JAMstack sites."
  },
  {
    key: "astro",
    label: "Astro",
    detail: "Content-first static pages with strong performance defaults."
  },
  {
    key: "headless-cms",
    label: "Headless CMS",
    detail: "Structured content management for scalable multi-channel sites."
  },
  {
    key: "ga4",
    label: "Google Analytics 4",
    detail: "Event-based reporting for lead and conversion tracking."
  },
  {
    key: "search-console",
    label: "Google Search Console",
    detail: "Indexation, query visibility, and technical SEO monitoring."
  },
  {
    key: "tag-manager",
    label: "Google Tag Manager",
    detail: "Flexible implementation of analytics and marketing tags."
  },
  {
    key: "wordpress",
    label: "WordPress",
    detail: "SEO and content operations for WordPress-based projects."
  }
];

function renderStackIcon(key: StackItem["key"]) {
  if (key === "nextjs") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 16V8l8 8V8" />
      </svg>
    );
  }

  if (key === "react") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="1.8" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(120 12 12)" />
      </svg>
    );
  }

  if (key === "tailwind") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 9c1.5-2 3-3 5-3 3 0 3.5 2 5.5 2S19 6.5 20 5c-1.2 3.5-3 5-5.5 5-2.8 0-3.2-2-5.5-2S6.2 9.5 5 12" />
        <path d="M4 15c1.2-1.8 2.6-2.6 4.5-2.6 2.6 0 3 1.8 5 1.8 1.6 0 2.8-.9 4-2.3-1.2 3.3-3 4.8-5.3 4.8-2.4 0-2.8-1.8-5.1-1.8-1.2 0-2.1.5-3.1 1.5" />
      </svg>
    );
  }

  if (key === "supabase") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 18 13 6h4l-6 12H7Z" />
        <path d="m11 18 6-12" />
      </svg>
    );
  }

  if (key === "ruby") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 4 6 4-2 8h-8L6 8l6-4Z" />
        <path d="M12 4v12" />
      </svg>
    );
  }

  if (key === "jekyll") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V7l4-2 4 2v12H5Z" />
        <path d="M13 19v-9l3-1.5L19 10v9h-6Z" />
      </svg>
    );
  }

  if (key === "vercel") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5 5 18h14L12 5Z" />
      </svg>
    );
  }

  if (key === "netlify") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="5" width="6" height="6" rx="1" />
        <rect x="13" y="13" width="6" height="6" rx="1" />
        <path d="M11 8h2M8 11v2M16 11v2M11 16h2" />
      </svg>
    );
  }

  if (key === "astro") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 17c0 1.7 1.8 3 4 3s4-1.3 4-3" />
        <path d="m7 17 2.2-10h5.6L17 17" />
      </svg>
    );
  }

  if (key === "headless-cms") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="7" height="6" rx="1.5" />
        <rect x="13" y="5" width="7" height="6" rx="1.5" />
        <rect x="4" y="13" width="16" height="6" rx="1.5" />
      </svg>
    );
  }

  if (key === "ga4") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="12" width="3" height="7" rx="1" />
        <rect x="10.5" y="9" width="3" height="10" rx="1" />
        <rect x="16" y="5" width="3" height="14" rx="1" />
      </svg>
    );
  }

  if (key === "search-console") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="12" height="14" rx="2" />
        <path d="M8 8h4M8 11h4M8 14h3" />
        <path d="m15 15 5 5" />
        <circle cx="14" cy="14" r="3" />
      </svg>
    );
  }

  if (key === "tag-manager") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m6 6 6 6-6 6" />
        <path d="m12 6 6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  );
}

function stackIconBadgeClass(key: StackItem["key"]) {
  if (key === "nextjs") {
    return "border-[#1f2937]/30 bg-[#f3f4f6] text-[#111827]";
  }
  if (key === "react") {
    return "border-[#0e7490]/30 bg-[#ecfeff] text-[#0891b2]";
  }
  if (key === "tailwind") {
    return "border-[#0c4a6e]/30 bg-[#e0f2fe] text-[#0369a1]";
  }
  if (key === "supabase") {
    return "border-[#166534]/30 bg-[#ecfdf3] text-[#16a34a]";
  }
  if (key === "ruby") {
    return "border-[#9f1239]/30 bg-[#fff1f2] text-[#be123c]";
  }
  if (key === "jekyll") {
    return "border-[#991b1b]/30 bg-[#fef2f2] text-[#b91c1c]";
  }
  if (key === "vercel") {
    return "border-[#111827]/30 bg-[#f3f4f6] text-[#111827]";
  }
  if (key === "netlify") {
    return "border-[#0f766e]/30 bg-[#f0fdfa] text-[#0f766e]";
  }
  if (key === "astro") {
    return "border-[#7c3aed]/30 bg-[#f5f3ff] text-[#7c3aed]";
  }
  if (key === "headless-cms") {
    return "border-[#4338ca]/30 bg-[#eef2ff] text-[#4338ca]";
  }
  if (key === "ga4") {
    return "border-[#9a6700]/30 bg-[#fffbeb] text-[#a16207]";
  }
  if (key === "search-console") {
    return "border-[#1d4ed8]/30 bg-[#eff6ff] text-[#1d4ed8]";
  }
  if (key === "tag-manager") {
    return "border-[#7e22ce]/30 bg-[#faf5ff] text-[#9333ea]";
  }
  return "border-[#0f7663]/30 bg-[#f0fdf4] text-[#15803d]";
}

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

      <section className="mt-10 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <h2 className="font-display text-2xl uppercase leading-[0.95] text-ink">Stack We Use</h2>
        <p className="mt-2 text-sm text-ink/80">
          Core platforms we use across JAMstack builds, SEO execution, analytics, and client portal delivery.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stackItems.map((item) => (
            <li key={item.key} className="rounded-xl border border-ink/20 bg-white p-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${stackIconBadgeClass(item.key)}`}
              >
                {renderStackIcon(item.key)}
              </span>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink">{item.label}</p>
              <p className="mt-1 text-xs text-ink/70">{item.detail}</p>
            </li>
          ))}
        </ul>
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
