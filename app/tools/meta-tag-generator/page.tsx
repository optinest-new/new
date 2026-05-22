import type { Metadata } from "next";
import { MetaTagGeneratorTool } from "@/components/tools/meta-tag-generator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "Meta Tag Generator";
const toolDescription =
  "Create SEO-friendly title, description, canonical, Open Graph, and Twitter tags with this free meta tag generator.";

export const metadata: Metadata = buildToolMetadata({
  slug: "meta-tag-generator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["meta tag generator", "open graph generator", "twitter card tags"]
});

export default function MetaTagGeneratorPage() {
  const structuredData = buildToolStructuredData({
    slug: "meta-tag-generator",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="meta-tag-generator"
        shareTitle="Meta Tag Generator Tool by Optinest Digital"
      >
        <MetaTagGeneratorTool />
      </ToolPageShell>
    </>
  );
}
