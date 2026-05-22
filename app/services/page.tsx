import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { Card, PricingTierCard, TechIcon, techBadgeStyles, IconSearch, IconDocument, IconCode, IconCheck, Button } from "@/components/ui";
import { getCountryCodeFromHeaders } from "@/lib/geo";
import { getPricingCurrencyByCountry, getPricingTiersForCurrency, serviceDefinitions } from "@/lib/services";
import type { ServiceDefinition } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
const servicesPageTitle = "SEO, Web Design, and Web Development Services";
const servicesPageDescription =
  "Explore Optinest Digital services for businesses in Manila, Philippines and worldwide that need technical SEO, conversion-focused web design, and web development built for qualified lead generation.";
const servicesPageKeywords = [
  "seo services",
  "seo services manila",
  "seo services philippines",
  "web design services",
  "web design manila",
  "web development services",
  "web development philippines",
  "b2b seo agency",
  "conversion-focused web design",
  "technical seo services",
  "local seo services manila",
  "website redesign services"
];

type JourneyStep = {
  key: "discover" | "scope" | "execute" | "launch";
  title: string;
  detail: string;
};

type ServiceFaq = { question: string; answer: string };
type StackItem = { category: StackCategory; key: TechKey; label: string; detail: string };
type TechKey = "nextjs" | "react" | "tailwind" | "supabase" | "ruby" | "javascript" | "php" | "mysql" | "firebase" | "jekyll" | "vercel" | "netlify" | "github-pages" | "astro" | "headless-cms" | "decap-cms" | "ga4" | "search-console" | "tag-manager" | "wordpress";
type StackCategory = "programming_language" | "frontend_frameworks" | "backend_server" | "hosting_deployment" | "cms_content" | "analytics_seo";

const journeySteps: JourneyStep[] = [
  { key: "discover", title: "Discover Goals", detail: "We align on business objectives, current constraints, and what a successful engagement should deliver." },
  { key: "scope", title: "Define Scope", detail: "You get a clear service recommendation, timeline, and investment range before implementation starts." },
  { key: "execute", title: "Execute Sprints", detail: "We run focused implementation cycles with transparent updates so you always know current status." },
  { key: "launch", title: "Launch & Improve", detail: "After launch, we validate quality and prioritize next optimizations based on measurable outcomes." }
];

const serviceFaqs: ServiceFaq[] = [
  { question: "How do I choose between SEO, web design, and web development?", answer: "If your main issue is low qualified traffic, start with SEO. If traffic exists but conversion is weak, start with web design. If your current website is slow or technically limiting growth, start with web development." },
  { question: "Can we start with one service and expand later?", answer: "Yes. Many projects start with one focused service and expand after initial wins. This keeps scope controlled and improves implementation speed." },
  { question: "Do you work only in Manila or internationally too?", answer: "Optinest Digital is based in Manila, Philippines, and serves businesses worldwide through structured remote delivery." },
  { question: "What happens after I schedule a call?", answer: "You get a scope clarification call, a recommended starting path, and next-step implementation guidance based on your goals and timeline." }
];

const stackCategoryBlocks: Array<{ id: StackCategory; title: string; description: string }> = [
  { id: "programming_language", title: "Programming Language", description: "Foundation for automation and custom growth workflows." },
  { id: "frontend_frameworks", title: "Frontend & Static Frameworks", description: "Tools we use to deliver fast, modern, conversion-ready websites." },
  { id: "backend_server", title: "Backend / Server & Data", description: "Systems that power secure portal workflows and project operations." },
  { id: "hosting_deployment", title: "Hosting & Deployment", description: "Publishing stack for reliable launches and fast production updates." },
  { id: "cms_content", title: "CMS & Content Operations", description: "Content systems that keep your team agile after launch." },
  { id: "analytics_seo", title: "Analytics & SEO Measurement", description: "Reporting tools that connect traffic to business results." }
];

const stackItems: StackItem[] = [
  { category: "frontend_frameworks", key: "nextjs", label: "Next.js", detail: "Helps your site load faster so more visitors stay, engage, and convert." },
  { category: "frontend_frameworks", key: "react", label: "React", detail: "Keeps your website experience consistent and easier to improve as your business grows." },
  { category: "frontend_frameworks", key: "tailwind", label: "Tailwind CSS", detail: "Delivers clean, consistent design faster so updates go live with less delay." },
  { category: "backend_server", key: "supabase", label: "Supabase", detail: "Supports secure client portals where projects, files, and updates are centralized." },
  { category: "programming_language", key: "ruby", label: "Ruby", detail: "Automates repetitive tasks so your team can focus on growth and delivery." },
  { category: "programming_language", key: "javascript", label: "JavaScript", detail: "Enables interactive experiences that keep visitors engaged and moving toward conversion." },
  { category: "programming_language", key: "php", label: "PHP", detail: "Supports reliable business websites and custom workflows for content and lead capture." },
  { category: "backend_server", key: "mysql", label: "MySQL", detail: "Organizes your core business data so reports, forms, and client records stay consistent." },
  { category: "backend_server", key: "firebase", label: "Firebase", detail: "Accelerates launch with managed backend services for authentication, data, and real-time updates." },
  { category: "frontend_frameworks", key: "jekyll", label: "Jekyll", detail: "Publishes lightweight pages that are easy to maintain and cost-efficient to run." },
  { category: "hosting_deployment", key: "vercel", label: "Vercel", detail: "Enables fast, reliable deployments so improvements reach your audience quickly." },
  { category: "hosting_deployment", key: "netlify", label: "Netlify", detail: "Keeps your website stable and secure while simplifying launch and form workflows." },
  { category: "hosting_deployment", key: "github-pages", label: "GitHub Pages", detail: "Great for fast, dependable static site publishing with simple version-controlled updates." },
  { category: "frontend_frameworks", key: "astro", label: "Astro", detail: "Creates high-performance content pages that improve user experience and SEO visibility." },
  { category: "cms_content", key: "headless-cms", label: "Headless CMS", detail: "Lets your team update content faster without relying on development for every change." },
  { category: "cms_content", key: "decap-cms", label: "Decap CMS (Netlify CMS)", detail: "Gives non-technical teams an easy editor while keeping content workflows structured." },
  { category: "analytics_seo", key: "ga4", label: "Google Analytics 4", detail: "Shows which channels and pages drive real leads, not just traffic numbers." },
  { category: "analytics_seo", key: "search-console", label: "Google Search Console", detail: "Reveals how your site appears on Google and where ranking opportunities exist." },
  { category: "analytics_seo", key: "tag-manager", label: "Google Tag Manager", detail: "Makes tracking and marketing updates faster without slowing down site releases." },
  { category: "cms_content", key: "wordpress", label: "WordPress", detail: "Supports easy content publishing and ongoing SEO updates for long-term growth." }
];

const journeyIcons: Record<string, typeof IconSearch> = {
  discover: IconSearch,
  scope: IconDocument,
  execute: IconCode,
  launch: IconCheck
};

export const metadata: Metadata = {
  title: servicesPageTitle,
  description: servicesPageDescription,
  keywords: servicesPageKeywords,
  alternates: { canonical: "/services" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${siteUrl}/services`,
    title: `${servicesPageTitle} | Optinest Digital`,
    description: servicesPageDescription,
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: `${servicesPageTitle} | Optinest Digital`,
    description: servicesPageDescription,
    images: ["/og.png"]
  }
};

export default async function ServicesPage() {
  const requestHeaders = await headers();
  const countryCode = getCountryCodeFromHeaders(requestHeaders);
  const pricingCurrency = getPricingCurrencyByCountry(countryCode);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "WebPage", "@id": `${siteUrl}/services#webpage`, url: `${siteUrl}/services`, name: servicesPageTitle, description: servicesPageDescription, isPartOf: { "@id": `${siteUrl}/#website` } },
              { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` }] },
              { "@type": "ItemList", name: "Optinest Digital Services", itemListElement: serviceDefinitions.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${siteUrl}/services/${s.slug}`, description: s.summary })) },
              { "@type": "FAQPage", "@id": `${siteUrl}/services#faq`, mainEntity: serviceFaqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }
            ]
          })
        }}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <header className="mx-auto max-w-4xl text-center">
          <p className="eyebrow-pop mx-auto">Service stack</p>
          <h1 className="hero-title mt-6 font-display text-[clamp(2.6rem,8vw,5.8rem)] uppercase leading-[0.9] tracking-[-0.06em] text-ink">
            Services built for technical growth.
          </h1>
          <p className="tagline-pop mx-auto mt-5 max-w-3xl border-2 border-white/85 px-5 py-5 text-sm leading-7 text-white/80 sm:text-base">
            Choose focused support for SEO, web design, or web development with transparent scope, better visual hierarchy, and practical execution.
          </p>
        </header>

        <section aria-label="Service cards" className="mt-10 grid gap-5 lg:grid-cols-3">
          {serviceDefinitions.map((service, index) => {
            const pricingTiers = getPricingTiersForCurrency(service.pricingTiers, pricingCurrency);
            return <ServiceCard key={service.slug} service={service} pricingTiers={pricingTiers} highlighted={index === 1} />;
          })}
        </section>

        <section id="how-we-work" className="mt-10 scroll-mt-28" aria-label="How we work">
          <Card as="div">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Execution flow</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">How we work</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
              A simple engagement flow designed to reduce delays, clarify expectations, and keep decisions easy for your team.
            </p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {journeySteps.map((step, index) => {
                const Icon = journeyIcons[step.key];
                return (
                  <li key={step.key} className="border-2 border-white/14 bg-[#101010] p-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black bg-primary text-black">
                        {Icon ? <Icon size={16} /> : null}
                      </span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/42">Step {index + 1}</span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl uppercase leading-[0.95] tracking-[-0.03em] text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/72">{step.detail}</p>
                  </li>
                );
              })}
            </ol>
          </Card>
        </section>

        <section className="mt-10">
          <Card as="div" className="text-center">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Need a direction?</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Choose the right entry point.</h2>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link href="/services/seo" className="border border-white/14 bg-[#101010] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:border-primary hover:text-primary">I need more qualified traffic</Link>
              <Link href="/services/web-design" className="border border-white/14 bg-[#101010] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:border-primary hover:text-primary">I need better conversion UX</Link>
              <Link href="/services/web-development" className="border border-white/14 bg-[#101010] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:border-primary hover:text-primary">I need a faster build</Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ScheduleCallModal label="Schedule a Call" className="inline-flex items-center border-2 border-black bg-primary px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg" />
              <Link href="/portal">
                <Button variant="secondary" size="md">Open Portal</Button>
              </Link>
            </div>
          </Card>
        </section>

        <section className="mt-10">
          <Card as="div">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Delivery stack</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Stack we use</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">Core platforms we use across JAMstack builds, SEO execution, analytics, and client portal delivery.</p>
            <div className="mt-6 space-y-5">
              {stackCategoryBlocks.map((category) => {
                const items = stackItems.filter((item) => item.category === category.id);
                if (items.length === 0) return null;
                return (
                  <article key={category.id} className="border-2 border-white/14 bg-[#101010] p-4">
                    <h3 className="font-display text-3xl uppercase leading-[0.94] tracking-[-0.04em] text-ink">{category.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/62">{category.description}</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((item) => (
                        <li key={item.key} className="border border-white/10 bg-mist p-3">
                          <span className={`inline-flex h-10 w-10 items-center justify-center border ${techBadgeStyles[item.key]}`}>
                            <TechIcon tech={item.key} />
                          </span>
                          <p className="mt-3 font-display text-xl uppercase leading-none text-ink">{item.label}</p>
                          <p className="mt-2 text-sm leading-7 text-white/70">{item.detail}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </Card>
        </section>

        <section id="services-faq" className="mt-10">
          <Card as="div">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-primary">Questions</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-ink">Frequently asked questions</h2>
            <div className="mt-5 space-y-3">
              {serviceFaqs.map((faq) => (
                <details key={faq.question} className="border-2 border-white/14 bg-[#101010] p-4">
                  <summary className="cursor-pointer font-mono text-[0.74rem] uppercase tracking-[0.14em] text-ink">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-white/72">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Card>
        </section>

        <FloatingShare title="Services by Optinest Digital" url={`${siteUrl}/services`} label="Share this page" />
      </main>
    </>
  );
}

function ServiceCard({
  service,
  pricingTiers,
  highlighted
}: {
  service: ServiceDefinition;
  pricingTiers: typeof service.pricingTiers;
  highlighted?: boolean;
}) {
  return (
    <article className={`flex h-full flex-col border-2 ${highlighted ? "border-black bg-primary text-black" : "border-white/85 bg-mist text-ink"} p-5 shadow-hard`}>
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] opacity-75">{service.shortLabel}</p>
      <h2 className="mt-3 font-display text-4xl uppercase leading-[0.92] tracking-[-0.05em]">{service.title}</h2>
      <p className="mt-3 text-sm leading-7 opacity-80">{service.summary}</p>
      <p className="mt-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] opacity-75">{service.timeline}</p>
      <div className={`mt-4 border-2 p-3 ${highlighted ? "border-black/20 bg-black text-primary" : "border-white/12 bg-[#101010] text-ink"}`}>
        <p className={`font-mono text-[0.62rem] uppercase tracking-[0.16em] ${highlighted ? "text-primary" : "text-primary"}`}>Pricing</p>
        <ul className="mt-2 space-y-2">
          {pricingTiers.map((tier) => (
            <PricingTierCard key={`${service.slug}-${tier.category}`} category={tier.category} range={tier.range} />
          ))}
        </ul>
      </div>
      <div className="mt-auto pt-5">
        <Link href={`/services/${service.slug}`} className="inline-flex">
          <Button variant={highlighted ? "secondary" : "primary"} size="md">View Service</Button>
        </Link>
      </div>
    </article>
  );
}
