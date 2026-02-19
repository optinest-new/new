import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { serviceDefinitions } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type StackItem = {
  category: StackCategory;
  key:
    | "nextjs"
    | "react"
    | "tailwind"
    | "supabase"
    | "ruby"
    | "javascript"
    | "php"
    | "mysql"
    | "firebase"
    | "jekyll"
    | "vercel"
    | "netlify"
    | "github-pages"
    | "astro"
    | "headless-cms"
    | "decap-cms"
    | "ga4"
    | "search-console"
    | "tag-manager"
    | "wordpress";
  label: string;
  detail: string;
};

type StackCategory =
  | "programming_language"
  | "frontend_frameworks"
  | "backend_server"
  | "hosting_deployment"
  | "cms_content"
  | "analytics_seo";

type StackCategoryBlock = {
  id: StackCategory;
  title: string;
  description: string;
};

const stackCategoryBlocks: StackCategoryBlock[] = [
  {
    id: "programming_language",
    title: "Programming Language",
    description: "Foundation for automation and custom growth workflows."
  },
  {
    id: "frontend_frameworks",
    title: "Frontend & Static Frameworks",
    description: "Tools we use to deliver fast, modern, conversion-ready websites."
  },
  {
    id: "backend_server",
    title: "Backend / Server & Data",
    description: "Systems that power secure portal workflows and project operations."
  },
  {
    id: "hosting_deployment",
    title: "Hosting & Deployment",
    description: "Publishing stack for reliable launches and fast production updates."
  },
  {
    id: "cms_content",
    title: "CMS & Content Operations",
    description: "Content systems that keep your team agile after launch."
  },
  {
    id: "analytics_seo",
    title: "Analytics & SEO Measurement",
    description: "Reporting tools that connect traffic to business results."
  }
];

const stackItems: StackItem[] = [
  {
    category: "frontend_frameworks",
    key: "nextjs",
    label: "Next.js",
    detail: "Helps your site load faster so more visitors stay, engage, and convert."
  },
  {
    category: "frontend_frameworks",
    key: "react",
    label: "React",
    detail: "Keeps your website experience consistent and easier to improve as your business grows."
  },
  {
    category: "frontend_frameworks",
    key: "tailwind",
    label: "Tailwind CSS",
    detail: "Delivers clean, consistent design faster so updates go live with less delay."
  },
  {
    category: "backend_server",
    key: "supabase",
    label: "Supabase",
    detail: "Supports secure client portals where projects, files, and updates are centralized."
  },
  {
    category: "programming_language",
    key: "ruby",
    label: "Ruby",
    detail: "Automates repetitive tasks so your team can focus on growth and delivery."
  },
  {
    category: "programming_language",
    key: "javascript",
    label: "JavaScript",
    detail: "Enables interactive experiences that keep visitors engaged and moving toward conversion."
  },
  {
    category: "programming_language",
    key: "php",
    label: "PHP",
    detail: "Supports reliable business websites and custom workflows for content and lead capture."
  },
  {
    category: "backend_server",
    key: "mysql",
    label: "MySQL",
    detail: "Organizes your core business data so reports, forms, and client records stay consistent."
  },
  {
    category: "backend_server",
    key: "firebase",
    label: "Firebase",
    detail: "Accelerates launch with managed backend services for authentication, data, and real-time updates."
  },
  {
    category: "frontend_frameworks",
    key: "jekyll",
    label: "Jekyll",
    detail: "Publishes lightweight pages that are easy to maintain and cost-efficient to run."
  },
  {
    category: "hosting_deployment",
    key: "vercel",
    label: "Vercel",
    detail: "Enables fast, reliable deployments so improvements reach your audience quickly."
  },
  {
    category: "hosting_deployment",
    key: "netlify",
    label: "Netlify",
    detail: "Keeps your website stable and secure while simplifying launch and form workflows."
  },
  {
    category: "hosting_deployment",
    key: "github-pages",
    label: "GitHub Pages",
    detail: "Great for fast, dependable static site publishing with simple version-controlled updates."
  },
  {
    category: "frontend_frameworks",
    key: "astro",
    label: "Astro",
    detail: "Creates high-performance content pages that improve user experience and SEO visibility."
  },
  {
    category: "cms_content",
    key: "headless-cms",
    label: "Headless CMS",
    detail: "Lets your team update content faster without relying on development for every change."
  },
  {
    category: "cms_content",
    key: "decap-cms",
    label: "Decap CMS (Netlify CMS)",
    detail: "Gives non-technical teams an easy editor while keeping content workflows structured."
  },
  {
    category: "analytics_seo",
    key: "ga4",
    label: "Google Analytics 4",
    detail: "Shows which channels and pages drive real leads, not just traffic numbers."
  },
  {
    category: "analytics_seo",
    key: "search-console",
    label: "Google Search Console",
    detail: "Reveals how your site appears on Google and where ranking opportunities exist."
  },
  {
    category: "analytics_seo",
    key: "tag-manager",
    label: "Google Tag Manager",
    detail: "Makes tracking and marketing updates faster without slowing down site releases."
  },
  {
    category: "cms_content",
    key: "wordpress",
    label: "WordPress",
    detail: "Supports easy content publishing and ongoing SEO updates for long-term growth."
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

  if (key === "javascript") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M10 9v5a2 2 0 0 1-2 2H7" />
        <path d="M13 15c.4.7 1.2 1 2 1s1.5-.4 1.5-1.1c0-1.8-3.5-.9-3.5-3 0-1 .9-1.9 2.3-1.9.9 0 1.6.3 2.1 1" />
      </svg>
    );
  }

  if (key === "php") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="8.5" ry="5.5" />
        <path d="M8.5 14V10h1.8a1.6 1.6 0 1 1 0 3.2H8.5" />
        <path d="M12.5 14V10h1.8a1.6 1.6 0 1 1 0 3.2h-1.8" />
      </svg>
    );
  }

  if (key === "mysql") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" />
        <path d="M5.5 6.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" />
        <path d="M5.5 11.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" />
      </svg>
    );
  }

  if (key === "firebase") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 18 11.5 4l2.6 4.2L6 18Z" />
        <path d="M18 18 12 5.8 9.8 10 18 18Z" />
        <path d="M8.4 14.3 12 18l3.6-3.7" />
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

  if (key === "github-pages") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3a8.5 8.5 0 0 0-2.7 16.6v-2.4c-2 .4-2.5-.9-2.5-.9-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2.1 1 2.7.8.1-.5.3-.9.6-1.1-1.8-.2-3.8-.9-3.8-4a3.2 3.2 0 0 1 .9-2.2 3 3 0 0 1 .1-2.2s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8a3 3 0 0 1 .1 2.2 3.2 3.2 0 0 1 .9 2.2c0 3.1-2 3.8-3.9 4 .3.2.6.7.6 1.4v2.1A8.5 8.5 0 0 0 12 3Z" />
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

  if (key === "decap-cms") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h10l4 4v6H5z" />
        <path d="M15 7v4h4" />
        <path d="M8 14h8M8 17h5" />
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
  if (key === "javascript") {
    return "border-[#a16207]/30 bg-[#fffbeb] text-[#a16207]";
  }
  if (key === "php") {
    return "border-[#4338ca]/30 bg-[#eef2ff] text-[#4338ca]";
  }
  if (key === "mysql") {
    return "border-[#0c4a6e]/30 bg-[#ecfeff] text-[#0e7490]";
  }
  if (key === "firebase") {
    return "border-[#c2410c]/30 bg-[#fff7ed] text-[#ea580c]";
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
  if (key === "github-pages") {
    return "border-[#111827]/30 bg-[#f8fafc] text-[#111827]";
  }
  if (key === "astro") {
    return "border-[#7c3aed]/30 bg-[#f5f3ff] text-[#7c3aed]";
  }
  if (key === "headless-cms") {
    return "border-[#4338ca]/30 bg-[#eef2ff] text-[#4338ca]";
  }
  if (key === "decap-cms") {
    return "border-[#0f7663]/30 bg-[#ecfdf5] text-[#0f7663]";
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

      <section className="mt-10 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <h2 className="font-display text-2xl uppercase leading-[0.95] text-ink">Stack We Use</h2>
        <p className="mt-2 text-sm text-ink/80">
          Core platforms we use across JAMstack builds, SEO execution, analytics, and client portal delivery.
        </p>
        <div className="mt-5 space-y-5">
          {stackCategoryBlocks.map((category) => {
            const items = stackItems.filter((item) => item.category === category.id);
            if (items.length === 0) {
              return null;
            }

            return (
              <article key={category.id} className="rounded-xl border border-ink/20 bg-white p-4">
                <h3 className="font-display text-lg uppercase leading-none text-ink">{category.title}</h3>
                <p className="mt-1 text-xs text-ink/65">{category.description}</p>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.key} className="rounded-xl border border-ink/15 bg-mist p-3">
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
              </article>
            );
          })}
        </div>
      </section>

      <FloatingShare title="Services by Optinest Digital" url={`${siteUrl}/services`} label="Share this page" />
    </main>
  );
}
