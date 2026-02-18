import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { RedirectCheckerTool } from "@/components/tools/redirect-checker-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "301 Redirect Checker Tool",
  description:
    "Check URL redirect chains, verify 301 status codes, detect temporary redirects, and review final destination status.",
  alternates: {
    canonical: "/tools/redirect-checker"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/redirect-checker`,
    title: "301 Redirect Checker | Optinest Digital",
    description:
      "Test redirects step by step, audit hop chains, and identify SEO issues in URL migrations.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "301 Redirect Checker | Optinest Digital",
    description:
      "Test redirects step by step, audit hop chains, and identify SEO issues in URL migrations.",
    images: ["/og.png"]
  }
};

export default function RedirectCheckerPage() {
  return (
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
  );
}
