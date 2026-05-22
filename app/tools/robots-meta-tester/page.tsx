import type { Metadata } from "next";
import { RobotsMetaTesterTool } from "@/components/tools/robots-meta-tester-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "Robots and Meta Tester";
const toolDescription =
  "Test crawl access and index directives together by checking robots.txt, meta robots, and X-Robots-Tag settings.";

export const metadata: Metadata = buildToolMetadata({
  slug: "robots-meta-tester",
  title: toolTitle,
  description: toolDescription,
  keywords: ["robots txt tester", "meta robots checker", "x-robots-tag checker"]
});

export default function RobotsMetaTesterPage() {
  const structuredData = buildToolStructuredData({
    slug: "robots-meta-tester",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="robots-meta-tester"
        shareTitle="Robots and Meta Tester Tool by Optinest Digital"
      >
        <RobotsMetaTesterTool />
      </ToolPageShell>
    </>
  );
}
