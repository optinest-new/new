import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SeoHealthScannerTool } from "@/components/tools/seo-health-scanner-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const toolTitle = "SEO Health Scanner";
const toolDescription =
  "Scan a live URL for core SEO signals including title, meta description, canonical, robots directives, H1 usage, and indexability.";

export const metadata: Metadata = buildToolMetadata({
  slug: "seo-health-scanner",
  title: toolTitle,
  description: toolDescription,
  keywords: ["seo health checker", "technical seo audit tool", "on-page seo checker"]
});

export default function SeoHealthScannerPage() {
  const structuredData = buildToolStructuredData({
    slug: "seo-health-scanner",
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
        / <span aria-current="page">SEO Health Scanner</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          SEO Health Scanner
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Audit page-level SEO quality quickly with score-based checks for metadata, canonical setup,
          indexability directives, and structural heading signals.
        </p>
      </header>

      <SeoHealthScannerTool />
      <FloatingShare title="SEO Health Scanner Tool by Optinest Digital" url={`${siteUrl}/tools/seo-health-scanner`} label="Share this tool" />
      </main>
    </>
  );
}
