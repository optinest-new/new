import type { Metadata } from "next";
import { GridFlexboxGeneratorTool } from "@/components/tools/grid-flexbox-generator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

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
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="grid-flexbox-generator"
        shareTitle="Grid and Flexbox Generator Tool by Optinest Digital"
      >
        <GridFlexboxGeneratorTool />
      </ToolPageShell>
    </>
  );
}
