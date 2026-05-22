import type { Metadata } from "next";
import { UtmBuilderCampaignLibraryTool } from "@/components/tools/utm-builder-campaign-library-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "UTM Builder + Campaign Library";
const toolDescription =
  "Generate clean UTM campaign URLs and save reusable campaigns in a local library for consistent tracking.";

export const metadata: Metadata = buildToolMetadata({
  slug: "utm-builder-campaign-library",
  title: toolTitle,
  description: toolDescription,
  keywords: ["utm builder", "campaign url builder", "utm campaign tracking"]
});

export default function UtmBuilderCampaignLibraryPage() {
  const structuredData = buildToolStructuredData({
    slug: "utm-builder-campaign-library",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="utm-builder-campaign-library"
        shareTitle="UTM Builder and Campaign Library by Optinest Digital"
      >
        <UtmBuilderCampaignLibraryTool />
      </ToolPageShell>
    </>
  );
}
