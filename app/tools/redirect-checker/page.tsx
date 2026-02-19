import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { RedirectCheckerTool } from "@/components/tools/redirect-checker-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

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
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">301 Redirect Checker</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          301 Redirect Checker
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Validate redirect behavior, inspect each hop, and confirm final destination status for cleaner technical SEO migrations.
        </p>
      </header>

      <RedirectCheckerTool />
      <FloatingShare title="301 Redirect Checker Tool by Optinest Digital" url={`${siteUrl}/tools/redirect-checker`} label="Share this tool" />
      </main>
    </>
  );
}
