import type { Metadata } from "next";
import { SeoContentBriefGeneratorTool } from "@/components/tools/seo-content-brief-generator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "SEO Content Brief Generator";
const toolDescription =
  "Generate a complete SEO content brief with title ideas, outline structure, FAQs, schema suggestions, and internal links.";

export const metadata: Metadata = buildToolMetadata({
  slug: "seo-content-brief-generator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["seo content brief", "content brief generator", "seo outline generator"]
});

export default function SeoContentBriefGeneratorPage() {
  const structuredData = buildToolStructuredData({
    slug: "seo-content-brief-generator",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="seo-content-brief-generator"
        shareTitle="SEO Content Brief Generator by Optinest Digital"
      >
        <SeoContentBriefGeneratorTool />
      </ToolPageShell>
    </>
  );
}
