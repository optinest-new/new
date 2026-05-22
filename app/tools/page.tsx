import type { Metadata } from "next";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { FloatingShare } from "@/components/blog/floating-share";
import { buildToolsHubStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const tools = [
  { href: "/tools/seo-health-scanner", title: "SEO Health Scanner", description: "Scan live URLs for SEO fundamentals: title, description, canonical, robots directives, and heading structure." },
  { href: "/tools/sitemap-indexation-validator", title: "Sitemap & Indexation Validator", description: "Validate sitemap URLs, check indexability signals, and detect status or canonical issues at scale." },
  { href: "/tools/utm-builder-campaign-library", title: "UTM Builder + Campaign Library", description: "Generate clean UTM tracking URLs and save reusable campaign presets for consistent reporting." },
  { href: "/tools/serp-snippet-preview", title: "SERP Snippet Preview", description: "Preview Google-style desktop and mobile snippets with title length and pixel width checks." },
  { href: "/tools/meta-tag-generator", title: "Meta Tag Generator", description: "Generate SEO-ready title, description, Open Graph, and Twitter meta tags." },
  { href: "/tools/schema-markup-generator", title: "Schema Markup Generator", description: "Create and validate JSON-LD schema markup for key structured data types." },
  { href: "/tools/robots-meta-tester", title: "Robots and Meta Tester", description: "Test crawl and indexability conflicts across robots.txt, meta robots, and X-Robots-Tag." },
  { href: "/tools/redirect-checker", title: "301 Redirect Checker", description: "Audit redirect chains, verify 301s, and detect temporary redirects or multi-hop issues." },
  { href: "/tools/internal-link-opportunities", title: "Internal Link Finder", description: "Find high-value internal link placements with keyword-based scoring and anchor suggestions." },
  { href: "/tools/seo-content-brief-generator", title: "SEO Content Brief Generator", description: "Generate practical SEO content briefs with outlines, FAQs, and internal link direction." },
  { href: "/tools/roi-calculator", title: "ROI Calculator", description: "Estimate revenue opportunity from SEO and conversion improvements using your own traffic and deal metrics." },
  { href: "/tools/mailto-generator", title: "Mailto Generator", description: "Build clean mailto links with prefilled subject, body, cc, and bcc fields." },
  { href: "/tools/grid-flexbox-generator", title: "Grid / Flexbox Generator", description: "Create CSS layout code for grid and flexbox with a live preview." }
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
  alternates: { canonical: "/tools" },
  robots: { index: true, follow: true },
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildToolsHubStructuredData()) }} />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mx-auto max-w-4xl text-center">
          <p className="eyebrow-pop mx-auto">Free web developer tools</p>
          <h1 className="hero-title mt-6 font-display text-[clamp(2.6rem,8vw,5.8rem)] uppercase leading-[0.9] tracking-[-0.06em] text-ink">
            Practical generators for faster SEO and site ops.
          </h1>
          <p className="tagline-pop mx-auto mt-5 max-w-3xl border-2 border-white/85 px-5 py-5 text-sm leading-7 text-white/80 sm:text-base">
            Create audit reports, snippets, markup, redirects, content briefs, and tracking assets with clean copy-ready outputs built for real production work.
          </p>
        </header>

        <section aria-label="Tool list" className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, index) => (
            <Card key={tool.href} as="article" padding="sm" className={index % 3 === 0 ? "bg-primary text-black border-black" : ""}>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] opacity-75">Tool {index + 1}</p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-[0.94] tracking-[-0.04em]">{tool.title}</h2>
              <p className="mt-3 text-sm leading-7 opacity-80">{tool.description}</p>
              <Link href={tool.href} className="mt-6 inline-flex">
                <Button variant={index % 3 === 0 ? "secondary" : "primary"} size="md">
                  Open Tool
                </Button>
              </Link>
            </Card>
          ))}
        </section>

        <FloatingShare title="Web Developer Tools by Optinest Digital" url={`${siteUrl}/tools`} label="Share this page" />
      </main>
    </>
  );
}
