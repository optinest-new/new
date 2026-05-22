import type { Metadata } from "next";
import { RedirectCheckerTool } from "@/components/tools/redirect-checker-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "301 Redirect Checker";
const toolDescription =
  "Check URL redirect chains, verify 301 status codes, detect temporary redirects, and review final destination status.";

export const metadata: Metadata = buildToolMetadata({
  slug: "redirect-checker",
  title: toolTitle,
  description: toolDescription,
  keywords: ["301 redirect checker", "redirect chain checker", "seo redirect audit"]
});

export default function RedirectCheckerPage() {
  const structuredData = buildToolStructuredData({
    slug: "redirect-checker",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="redirect-checker"
        shareTitle="301 Redirect Checker Tool by Optinest Digital"
      >
        <RedirectCheckerTool />
      </ToolPageShell>
    </>
  );
}
