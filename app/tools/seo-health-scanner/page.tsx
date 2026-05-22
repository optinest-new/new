import type { Metadata } from "next";
import { SeoHealthScannerTool } from "@/components/tools/seo-health-scanner-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "SEO Health Scanner";
const toolDescription =
  "Scan a live URL for core SEO signals including title, meta description, canonical, robots directives, H1 usage, and indexability.";

export const metadata: Metadata = buildToolMetadata({
  slug: "seo-health-scanner",
  title: toolTitle,
  description: toolDescription,
  keywords: ["seo health checker", "technical seo audit tool", "on-page seo checker"]
});

export default function SeoHealthScannerPage() {
  const structuredData = buildToolStructuredData({
    slug: "seo-health-scanner",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="seo-health-scanner"
        shareTitle="SEO Health Scanner Tool by Optinest Digital"
      >
        <SeoHealthScannerTool />
      </ToolPageShell>
    </>
  );
}
