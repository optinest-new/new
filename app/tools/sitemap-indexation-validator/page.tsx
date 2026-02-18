import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SitemapIndexationValidatorTool } from "@/components/tools/sitemap-indexation-validator-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Sitemap and Indexation Validator",
  description:
    "Validate XML sitemap URLs, check HTTP status and indexability directives, and identify canonical mismatches.",
  alternates: {
    canonical: "/tools/sitemap-indexation-validator"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/sitemap-indexation-validator`,
    title: "Sitemap & Indexation Validator | Optinest Digital",
    description:
      "Audit sitemap URLs for indexability, noindex directives, canonical mismatches, and status errors.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitemap & Indexation Validator | Optinest Digital",
    description:
      "Audit sitemap URLs for indexability, noindex directives, canonical mismatches, and status errors.",
    images: ["/og.png"]
  }
};

export default function SitemapIndexationValidatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">Sitemap &amp; Indexation Validator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Sitemap &amp; Indexation Validator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Run a practical sitemap audit to spot non-indexable URLs, noindex directives, canonical mismatches, and fetch errors.
        </p>
      </header>

      <SitemapIndexationValidatorTool />
      <FloatingShare title="Sitemap and Indexation Validator by Optinest Digital" url={`${siteUrl}/tools/sitemap-indexation-validator`} label="Share this tool" />
    </main>
  );
}
