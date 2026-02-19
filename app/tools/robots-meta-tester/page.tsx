import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { RobotsMetaTesterTool } from "@/components/tools/robots-meta-tester-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

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
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">Robots and Meta Tester</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Robots and Meta Tester
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Check if pages are crawlable and indexable by combining robots.txt analysis with meta robots and X-Robots-Tag tests.
        </p>
      </header>

      <RobotsMetaTesterTool />
      <FloatingShare title="Robots and Meta Tester Tool by Optinest Digital" url={`${siteUrl}/tools/robots-meta-tester`} label="Share this tool" />
      </main>
    </>
  );
}
