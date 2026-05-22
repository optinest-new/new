import type { Metadata } from "next";
import { SchemaGeneratorValidatorTool } from "@/components/tools/schema-generator-validator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

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
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="schema-markup-generator"
        shareTitle="Schema Markup Generator Tool by Optinest Digital"
      >
        <SchemaGeneratorValidatorTool />
      </ToolPageShell>
    </>
  );
}
