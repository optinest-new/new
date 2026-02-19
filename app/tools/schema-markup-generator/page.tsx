import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { SchemaGeneratorValidatorTool } from "@/components/tools/schema-generator-validator-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const toolTitle = "Schema Markup Generator";
const toolDescription =
  "Generate JSON-LD schema markup for Organization, FAQ, Service, and more, then validate required fields in one workflow.";

export const metadata: Metadata = buildToolMetadata({
  slug: "schema-markup-generator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["schema markup generator", "json ld generator", "structured data validator"]
});

export default function SchemaMarkupGeneratorPage() {
  const structuredData = buildToolStructuredData({
    slug: "schema-markup-generator",
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
        / <span aria-current="page">Schema Markup Generator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Schema Markup Generator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Generate and validate JSON-LD for common schema types so your pages can qualify for rich search features.
        </p>
      </header>

      <SchemaGeneratorValidatorTool />
      <FloatingShare title="Schema Markup Generator Tool by Optinest Digital" url={`${siteUrl}/tools/schema-markup-generator`} label="Share this tool" />
      </main>
    </>
  );
}
