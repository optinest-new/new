import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { RoiCalculatorTool } from "@/components/tools/roi-calculator-tool";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "SEO ROI Calculator Tool",
  description:
    "Estimate monthly and projected revenue lift from SEO traffic and conversion improvements with this ROI calculator.",
  alternates: {
    canonical: "/tools/roi-calculator"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tools/roi-calculator`,
    title: "SEO ROI Calculator | Optinest Digital",
    description:
      "Model organic growth impact using traffic, conversion, close rate, and deal value assumptions.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO ROI Calculator | Optinest Digital",
    description:
      "Model organic growth impact using traffic, conversion, close rate, and deal value assumptions.",
    images: ["/og.png"]
  }
};

export default function RoiCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/70 sm:text-sm">
        <Link href="/tools" className="hover:underline">
          Tools
        </Link>{" "}
        / <span aria-current="page">ROI Calculator</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl">
          ROI Calculator
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/80 sm:text-base">
          Forecast revenue upside from SEO and website conversion improvements using your own baseline metrics.
        </p>
      </header>

      <RoiCalculatorTool />
      <FloatingShare
        title="ROI Calculator Tool by Optinest Digital"
        url={`${siteUrl}/tools/roi-calculator`}
        label="Share this tool"
      />
    </main>
  );
}
