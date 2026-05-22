import type { Metadata } from "next";
import { SitemapIndexationValidatorTool } from "@/components/tools/sitemap-indexation-validator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "Sitemap & Indexation Validator";
const toolDescription =
  "Validate XML sitemap URLs, check HTTP status and indexability directives, and identify canonical mismatches.";

export const metadata: Metadata = buildToolMetadata({
  slug: "sitemap-indexation-validator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["sitemap validator", "indexation checker", "xml sitemap audit"]
});

export default function SitemapIndexationValidatorPage() {
  const structuredData = buildToolStructuredData({
    slug: "sitemap-indexation-validator",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="sitemap-indexation-validator"
        shareTitle="Sitemap and Indexation Validator by Optinest Digital"
      >
        <SitemapIndexationValidatorTool />
      </ToolPageShell>
    </>
  );
}
