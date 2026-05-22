import type { Metadata } from "next";
import { MailtoGeneratorTool } from "@/components/tools/mailto-generator-tool";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const toolTitle = "Mailto Generator";
const toolDescription =
  "Generate mailto links with subject, body, cc, and bcc fields for contact buttons and email CTAs.";

export const metadata: Metadata = buildToolMetadata({
  slug: "mailto-generator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["mailto generator", "email link generator", "mailto url builder"]
});

export default function MailtoGeneratorPage() {
  const structuredData = buildToolStructuredData({
    slug: "mailto-generator",
    title: toolTitle,
    description: toolDescription
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ToolPageShell
        title={toolTitle}
        description={toolDescription}
        slug="mailto-generator"
        shareTitle="Mailto Generator Tool by Optinest Digital"
      >
        <MailtoGeneratorTool />
      </ToolPageShell>
    </>
  );
}
