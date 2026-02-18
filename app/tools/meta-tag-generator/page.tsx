import type { Metadata } from "next";
import Link from "next/link";
import { MetaTagGeneratorTool } from "@/components/tools/meta-tag-generator-tool";
import { FloatingShare } from "@/components/blog/floating-share";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Meta Tag Generator Tool",
  description:
    "Create SEO-friendly title, description, canonical, Open Graph, and Twitter tags with this free meta tag generator.",
  alternates: {
    canonical: "/tools/meta-tag-generator"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/meta-tag-generator`,
    title: "Meta Tag Generator | Optinest Digital",
    description:
      "Generate website meta tags for SEO and social sharing with clean copy-ready output.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tag Generator | Optinest Digital",
    description:
      "Generate website meta tags for SEO and social sharing with clean copy-ready output.",
    images: ["/og.png"]
  }
};

export default function MetaTagGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">Meta Tag Generator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Meta Tag Generator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Build SEO metadata for pages quickly, including title, description, canonical URL, Open Graph, and Twitter tags.
        </p>
      </header>

      <MetaTagGeneratorTool />
      <FloatingShare
        title="Meta Tag Generator Tool by Optinest Digital"
        url={`${siteUrl}/tools/meta-tag-generator`}
        label="Share this tool"
      />
    </main>
  );
}
