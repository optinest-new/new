import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { InternalLinkOpportunityTool } from "@/components/tools/internal-link-opportunity-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const toolTitle = "Internal Link Opportunity Finder";
const toolDescription =
  "Find internal link opportunities with keyword-relevant source pages, suggested anchors, and practical placement hints.";

export const metadata: Metadata = buildToolMetadata({
  slug: "internal-link-opportunities",
  title: toolTitle,
  description: toolDescription,
  keywords: ["internal link tool", "internal linking opportunities", "seo internal links"]
});

export default function InternalLinkOpportunitiesPage() {
  const structuredData = buildToolStructuredData({
    slug: "internal-link-opportunities",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">Internal Link Opportunities</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Internal Link Opportunity Finder
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Identify where to place internal links for target pages using keyword relevance, source-page scoring, and anchor guidance.
        </p>
      </header>

      <InternalLinkOpportunityTool />
      <FloatingShare title="Internal Link Opportunity Finder by Optinest Digital" url={`${siteUrl}/tools/internal-link-opportunities`} label="Share this tool" />
      </main>
    </>
  );
}
