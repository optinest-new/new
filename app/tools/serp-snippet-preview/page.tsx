import type { Metadata } from "next";
import { SerpSnippetPreviewTool } from "@/components/tools/serp-snippet-preview-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "SERP Snippet Preview";
const toolDescription =
  "Preview your SEO title and meta description for desktop and mobile search results, with length and pixel checks.";

export const metadata: Metadata = buildToolMetadata({
  slug: "serp-snippet-preview",
  title: toolTitle,
  description: toolDescription,
  keywords: ["serp snippet preview", "title tag preview", "meta description preview"]
});

export default function SerpSnippetPreviewPage() {
  const structuredData = buildToolStructuredData({
    slug: "serp-snippet-preview",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="serp-snippet-preview"
        shareTitle="SERP Snippet Preview Tool by Optinest Digital"
      >
        <SerpSnippetPreviewTool />
      </ToolPageShell>
    </>
  );
}
