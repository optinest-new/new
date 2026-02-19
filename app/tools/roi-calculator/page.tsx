import type { Metadata } from "next";
import Link from "next/link";
import { FloatingShare } from "@/components/blog/floating-share";
import { RoiCalculatorTool } from "@/components/tools/roi-calculator-tool";
import { buildToolMetadata, buildToolStructuredData } from "@/lib/tool-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

const toolTitle = "ROI Calculator";
const toolDescription =
  "Estimate monthly and projected revenue lift from SEO traffic and conversion improvements with this ROI calculator.";

export const metadata: Metadata = buildToolMetadata({
  slug: "roi-calculator",
  title: toolTitle,
  description: toolDescription,
  keywords: ["seo roi calculator", "website roi calculator", "lead value calculator"]
});

export default function RoiCalculatorPage() {
  const structuredData = buildToolStructuredData({
    slug: "roi-calculator",
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
    </>
  );
}
