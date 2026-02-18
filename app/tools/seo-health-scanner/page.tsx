import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SeoHealthScannerTool } from "@/components/tools/seo-health-scanner-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "SEO Health Scanner Tool",
  description:
    "Scan a live URL for core SEO signals including title, meta description, canonical, robots directives, H1 usage, and indexability.",
  alternates: {
    canonical: "/tools/seo-health-scanner"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/seo-health-scanner`,
    title: "SEO Health Scanner | Optinest Digital",
    description:
      "Run a practical SEO health check for any URL and get issue severity with recommendations.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Health Scanner | Optinest Digital",
    description:
      "Run a practical SEO health check for any URL and get issue severity with recommendations.",
    images: ["/og.png"]
  }
};

export default function SeoHealthScannerPage() {
  return (
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
  );
}
