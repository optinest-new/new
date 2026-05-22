import type { Metadata } from "next";
import { InternalLinkOpportunityTool } from "@/components/tools/internal-link-opportunity-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

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
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="internal-link-opportunities"
        shareTitle="Internal Link Opportunity Finder by Optinest Digital"
      >
        <InternalLinkOpportunityTool />
      </ToolPageShell>
    </>
  );
}
