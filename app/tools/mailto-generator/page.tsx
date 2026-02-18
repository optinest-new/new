import type { Metadata } from "next";
import Link from "next/link";
import { MailtoGeneratorTool } from "@/components/tools/mailto-generator-tool";
import { FloatingShare } from "@/components/blog/floating-share";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Mailto Generator Tool",
  description:
    "Generate mailto links with subject, body, cc, and bcc fields for contact buttons and email CTAs.",
  alternates: {
    canonical: "/tools/mailto-generator"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/mailto-generator`,
    title: "Mailto Generator | Optinest Digital",
    description:
      "Create copy-ready mailto URLs and HTML anchor snippets for project inquiry and contact links.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mailto Generator | Optinest Digital",
    description:
      "Create copy-ready mailto URLs and HTML anchor snippets for project inquiry and contact links.",
    images: ["/og.png"]
  }
};

export default function MailtoGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">Mailto Generator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          Mailto Generator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Generate robust mailto links for buttons and contact CTAs with prefilled subject and project details.
        </p>
      </header>

      <MailtoGeneratorTool />
      <FloatingShare
        title="Mailto Generator Tool by Optinest Digital"
        url={`${siteUrl}/tools/mailto-generator`}
        label="Share this tool"
      />
    </main>
  );
}
