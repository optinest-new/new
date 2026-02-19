import type { Metadata } from "next";
import Link from "next/link";
import { GridFlexboxGeneratorTool } from "@/components/tools/grid-flexbox-generator-tool";
import { FloatingShare } from "@/components/blog/floating-share";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const toolTitle = "Grid / Flexbox Generator";
const toolDescription =
  "Generate responsive CSS for grid and flexbox layouts with a live preview and copy-ready code output.";

export const metadata: Metadata = buildToolMetadata({
  slug: "grid-flexbox-generator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["css grid generator", "flexbox generator", "layout css tool"]
});

export default function GridFlexboxGeneratorPage() {
  const structuredData = buildToolStructuredData({
    slug: "grid-flexbox-generator",
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
        / <span aria-current="page">Grid / Flexbox Generator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Grid / Flexbox Generator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Configure layout settings for CSS grid or flexbox, preview the result, and copy production-ready styles.
        </p>
      </header>

      <GridFlexboxGeneratorTool />
      <FloatingShare
        title="Grid and Flexbox Generator Tool by Optinest Digital"
        url={`${siteUrl}/tools/grid-flexbox-generator`}
        label="Share this tool"
      />
      </main>
    </>
  );
}
