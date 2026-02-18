import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { UtmBuilderCampaignLibraryTool } from "@/components/tools/utm-builder-campaign-library-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "UTM Builder and Campaign Library",
  description:
    "Generate clean UTM campaign URLs and save reusable campaigns in a local library for consistent tracking.",
  alternates: {
    canonical: "/tools/utm-builder-campaign-library"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/utm-builder-campaign-library`,
    title: "UTM Builder + Campaign Library | Optinest Digital",
    description:
      "Build UTM links with required parameters and manage a reusable campaign library.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "UTM Builder + Campaign Library | Optinest Digital",
    description:
      "Build UTM links with required parameters and manage a reusable campaign library.",
    images: ["/og.png"]
  }
};

export default function UtmBuilderCampaignLibraryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">UTM Builder + Campaign Library</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          UTM Builder + Campaign Library
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Create consistent campaign tracking URLs and save reusable campaign templates for faster launch workflows.
        </p>
      </header>

      <UtmBuilderCampaignLibraryTool />
      <FloatingShare title="UTM Builder and Campaign Library by Optinest Digital" url={`${siteUrl}/tools/utm-builder-campaign-library`} label="Share this tool" />
    </main>
  );
}
