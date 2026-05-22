import type { Metadata } from "next";
import { RoiCalculatorTool } from "@/components/tools/roi-calculator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "ROI Calculator";
const toolDescription =
  "Estimate monthly and projected revenue lift from SEO traffic and conversion improvements with this ROI calculator.";

export const metadata: Metadata = buildToolMetadata({
  slug: "roi-calculator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["seo roi calculator", "website roi calculator", "lead value calculator"]
});

export default function RoiCalculatorPage() {
  const structuredData = buildToolStructuredData({
    slug: "roi-calculator",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="roi-calculator"
        shareTitle="ROI Calculator Tool by Optinest Digital"
      >
        <RoiCalculatorTool />
      </ToolPageShell>
    </>
  );
}
