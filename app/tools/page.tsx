import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { buildToolsHubStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const tools = [
  {
    href: "/tools/seo-health-scanner",
    title: "SEO Health Scanner",
    description: "Scan live URLs for SEO fundamentals: title, description, canonical, robots directives, and heading structure."
  },
  {
    href: "/tools/sitemap-indexation-validator",
    title: "Sitemap & Indexation Validator",
    description: "Validate sitemap URLs, check indexability signals, and detect status/canonical issues at scale."
  },
  {
    href: "/tools/utm-builder-campaign-library",
    title: "UTM Builder + Campaign Library",
    description: "Generate clean UTM tracking URLs and save reusable campaign presets for consistent reporting."
  },
  {
    href: "/tools/serp-snippet-preview",
    title: "SERP Snippet Preview",
    description: "Preview Google-style desktop and mobile snippets with title length and pixel width checks."
  },
  {
    href: "/tools/meta-tag-generator",
    title: "Meta Tag Generator",
    description: "Generate SEO-ready title, description, Open Graph, and Twitter meta tags."
  },
  {
    href: "/tools/schema-markup-generator",
    title: "Schema Markup Generator",
    description: "Create and validate JSON-LD schema markup for key structured data types."
  },
  {
    href: "/tools/robots-meta-tester",
    title: "Robots and Meta Tester",
    description: "Test crawl and indexability conflicts across robots.txt, meta robots, and X-Robots-Tag."
  },
  {
    href: "/tools/redirect-checker",
    title: "301 Redirect Checker",
    description: "Audit redirect chains, verify 301s, and detect temporary redirects or multi-hop issues."
  },
  {
    href: "/tools/internal-link-opportunities",
    title: "Internal Link Finder",
    description: "Find high-value internal link placements with keyword-based scoring and anchor suggestions."
  },
  {
    href: "/tools/seo-content-brief-generator",
    title: "SEO Content Brief Generator",
    description: "Generate practical SEO content briefs with outlines, FAQs, and internal link direction."
  },
  {
    href: "/tools/roi-calculator",
    title: "ROI Calculator",
    description: "Estimate revenue opportunity from SEO and conversion improvements using your own traffic and deal metrics."
  },
  {
    href: "/tools/mailto-generator",
    title: "Mailto Generator",
    description: "Build clean mailto links with prefilled subject, body, cc, and bcc fields."
  },
  {
    href: "/tools/grid-flexbox-generator",
    title: "Grid / Flexbox Generator",
    description: "Create CSS layout code for grid and flexbox with a live preview."
  }
];

export const metadata: Metadata = {
  title: "Web Developer Tools",
  description:
    "Use Optinest Digital web developer tools for SEO health scans, UTM tracking, sitemap validation, SERP previews, meta tags, schema markup, robots testing, internal links, content briefs, and layout CSS.",
  keywords: [
    "web developer tools",
    "seo tools",
    "serp snippet preview",
    "meta tag generator",
    "schema markup generator",
    "robots meta tester",
    "redirect checker",
    "internal link finder",
    "seo content brief generator",
    "utm builder"
  ],
  alternates: {
    canonical: "/tools"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools`,
    title: "Optinest Digital Web Developer Tools",
    description:
      "SEO and web workflow tools including SEO health scans, UTM builders, sitemap validation, SERP snippets, meta tags, schema markup, robots testing, internal links, content briefs, and CSS layout generation.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinest Digital Web Developer Tools",
    description:
      "SEO and web workflow tools including SEO health scans, UTM builders, sitemap validation, SERP snippets, meta tags, schema markup, robots testing, internal links, content briefs, and CSS layout generation.",
    images: ["/og.png"]
  }
};

export default function ToolsPage() {
  const toolsHubStructuredData = buildToolsHubStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsHubStructuredData) }}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mx-auto max-w-4xl text-center">
        <p className="eyebrow-pop mx-auto inline-block">Free Web Developer Tools</p>
        <h1 className="hero-title mt-5 text-balance font-display text-[clamp(2rem,7vw,4.4rem)] uppercase leading-[0.9] tracking-tight">
          Build Faster With Practical Generators
        </h1>
        <p className="tagline-pop mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-4 py-4 font-mono text-sm font-bold leading-relaxed sm:px-6 sm:text-base">
          Create SEO health scans, UTM campaign links, sitemap indexation audits, SERP previews, meta tags, schema markup, robots and redirect checks, internal link plans, content briefs, mailto links, and layout CSS with clean copy-ready outputs for real projects.
        </p>
      </header>

      <section aria-label="Tool list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <article key={tool.href} className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard">
            <h2 className="font-display text-2xl uppercase leading-[0.95] text-ink">{tool.title}</h2>
            <p className="mt-3 text-sm text-ink/80">{tool.description}</p>
            <Link
              href={tool.href}
              className="mt-5 inline-flex rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist hover:-translate-y-0.5"
            >
              Open Tool
            </Link>
          </article>
        ))}
      </section>

      <FloatingShare title="Web Developer Tools by Optinest Digital" url={`${siteUrl}/tools`} label="Share this page" />
      </main>
    </>
  );
}
