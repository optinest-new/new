import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SerpSnippetPreviewTool } from "@/components/tools/serp-snippet-preview-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "SERP Snippet Preview Tool",
  description:
    "Preview your SEO title and meta description for desktop and mobile search results, with length and pixel checks.",
  alternates: {
    canonical: "/tools/serp-snippet-preview"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/serp-snippet-preview`,
    title: "SERP Snippet Preview Tool | Optinest Digital",
    description:
      "Create click-ready search snippets with title length, meta description, and visual search result previews.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "SERP Snippet Preview Tool | Optinest Digital",
    description:
      "Create click-ready search snippets with title length, meta description, and visual search result previews.",
    images: ["/og.png"]
  }
};

export default function SerpSnippetPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">SERP Snippet Preview</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          SERP Snippet Preview
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Build search-friendly titles and meta descriptions with desktop and mobile preview blocks plus practical length checks.
        </p>
      </header>

      <SerpSnippetPreviewTool />
      <FloatingShare title="SERP Snippet Preview Tool by Optinest Digital" url={`${siteUrl}/tools/serp-snippet-preview`} label="Share this tool" />
    </main>
  );
}
