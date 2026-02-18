import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SeoContentBriefGeneratorTool } from "@/components/tools/seo-content-brief-generator-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "SEO Content Brief Generator",
  description:
    "Generate a complete SEO content brief with title ideas, outline structure, FAQs, schema suggestions, and internal links.",
  alternates: {
    canonical: "/tools/seo-content-brief-generator"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/seo-content-brief-generator`,
    title: "SEO Content Brief Generator | Optinest Digital",
    description:
      "Build consistent, search-focused content briefs with keyword strategy, structure, and implementation guidance.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Content Brief Generator | Optinest Digital",
    description:
      "Build consistent, search-focused content briefs with keyword strategy, structure, and implementation guidance.",
    images: ["/og.png"]
  }
};

export default function SeoContentBriefGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">SEO Content Brief Generator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          SEO Content Brief Generator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Draft keyword-focused briefs with heading plans, FAQ candidates, schema suggestions, and internal link direction.
        </p>
      </header>

      <SeoContentBriefGeneratorTool />
      <FloatingShare title="SEO Content Brief Generator by Optinest Digital" url={`${siteUrl}/tools/seo-content-brief-generator`} label="Share this tool" />
    </main>
  );
}
