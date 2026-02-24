export type ServiceDefinition = {
  slug: string;
  title: string;
  shortLabel: string;
  summary: string;
  intro: string;
  timeline: string;
  investment: string;
  pricingTiers: PricingTier[];
  deliverables: string[];
  outcomes: string[];
  process: string[];
};

export type PricingTier = {
  category: string;
  range: string;
};

export type PricingCurrency = "PHP" | "USD";

const PHP_PER_USD = 56;
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function convertPhpToUsd(phpAmount: number) {
  return Math.round(phpAmount / PHP_PER_USD);
}

export function getPricingCurrencyByCountry(countryCode: string | null | undefined): PricingCurrency {
  return countryCode?.toUpperCase() === "PH" ? "PHP" : "USD";
}

export function formatPricingRange(range: string, currency: PricingCurrency) {
  if (currency === "PHP") {
    return range;
  }

  return range.replace(/₱\s?([\d,]+)(\+)?/g, (_match, amount, hasPlus) => {
    const phpValue = Number(String(amount).replace(/,/g, ""));
    const usdValue = convertPhpToUsd(phpValue);
    return `${usdFormatter.format(usdValue)}${hasPlus || ""}`;
  });
}

export function getPricingTiersForCurrency(pricingTiers: PricingTier[], currency: PricingCurrency): PricingTier[] {
  if (currency === "PHP") {
    return pricingTiers;
  }

  return pricingTiers.map((tier) => ({
    ...tier,
    range: formatPricingRange(tier.range, currency)
  }));
}

export function buildInvestmentSummary(pricingTiers: PricingTier[], currency: PricingCurrency = "PHP") {
  return pricingTiers.map((tier) => `${tier.category}: ${formatPricingRange(tier.range, currency)}`).join(" · ");
}

const seoPricingTiers: PricingTier[] = [
  { category: "Small Businesses/Startups", range: "₱15,000 – ₱100,000 per month" },
  { category: "Mid-Sized Businesses", range: "₱100,000 – ₱150,000 per month" },
  { category: "Large Enterprises/Aggressive Campaigns", range: "₱150,000 – ₱500,000+ per month" },
  { category: "Local SEO (Targeted Cities)", range: "₱20,000 – ₱100,000 per month" }
];

const webDesignPricingTiers: PricingTier[] = [
  { category: "Simple/Personal Website (5 pages)", range: "₱15,000 – ₱50,000" },
  { category: "Small Business/Portfolio Website", range: "₱20,000 – ₱100,000" }
];

const webDevelopmentPricingTiers: PricingTier[] = [
  { category: "E-commerce Website (with online payment)", range: "₱40,000 – ₱300,000+" },
  { category: "Custom/Corporate Site", range: "₱100,000 – ₱3,000,000+" }
];

export const serviceDefinitions: ServiceDefinition[] = [
  {
    slug: "seo",
    title: "SEO Growth System",
    shortLabel: "SEO",
    summary:
      "Technical SEO, content architecture, and conversion-focused optimization built around lead quality and revenue goals.",
    intro:
      "This service is for businesses that need qualified organic traffic, not vanity rankings. We prioritize technical fixes, search-intent mapping, and measurable growth opportunities.",
    timeline: "8 to 16 weeks for initial traction, then monthly optimization cycles.",
    investment: buildInvestmentSummary(seoPricingTiers),
    pricingTiers: seoPricingTiers,
    deliverables: [
      "Technical SEO audit with prioritized action plan",
      "Search-intent and page architecture map",
      "On-page optimization for priority landing pages",
      "Tracking dashboard for rankings, leads, and revenue attribution",
      "Monthly implementation roadmap and reporting"
    ],
    outcomes: [
      "Improved indexation and crawl efficiency",
      "Higher-qualified organic leads",
      "Clear visibility into ROI per page cluster"
    ],
    process: ["Discovery and analytics baseline", "Audit and strategy build", "Execution sprints", "Reporting and iteration"]
  },
  {
    slug: "web-design",
    title: "Web Design & UX",
    shortLabel: "Web Design",
    summary:
      "Conversion-focused website design with modern visual systems, messaging clarity, and strong mobile usability.",
    intro:
      "This service is ideal if your site looks outdated, confuses visitors, or underperforms on conversion. We redesign key page experiences around real buying behavior.",
    timeline: "4 to 8 weeks for core templates, or 8 to 12 weeks with larger scope and slower content readiness.",
    investment: buildInvestmentSummary(webDesignPricingTiers),
    pricingTiers: webDesignPricingTiers,
    deliverables: [
      "Brand-aligned visual direction and UI system",
      "High-conversion homepage and service page designs",
      "Mobile-first layout optimization",
      "Content hierarchy and CTA placement strategy",
      "Handoff-ready design specs"
    ],
    outcomes: [
      "Stronger trust and credibility on first visit",
      "Higher form and call conversion rates",
      "Clearer positioning of your offers"
    ],
    process: ["Research and goals mapping", "Wireframes and page flow", "UI design and review", "Final design system delivery"]
  },
  {
    slug: "web-development",
    title: "Web Development",
    shortLabel: "Web Development",
    summary:
      "Fast, SEO-friendly, production-ready builds with clean code, strong Core Web Vitals, and scalable architecture.",
    intro:
      "This service is for teams that need a reliable website build or rebuild with speed, stability, and search visibility in mind from day one.",
    timeline: "6 to 14 weeks depending on feature complexity, CMS requirements, and third-party integrations.",
    investment: buildInvestmentSummary(webDevelopmentPricingTiers),
    pricingTiers: webDevelopmentPricingTiers,
    deliverables: [
      "Production-ready frontend implementation",
      "Technical SEO foundations (metadata, schema, crawlability)",
      "Performance optimization and Core Web Vitals tuning",
      "CMS or workflow integration as needed",
      "Deployment and launch QA checklist"
    ],
    outcomes: [
      "Faster page speed and improved UX",
      "Better technical foundation for SEO growth",
      "Lower maintenance risk and cleaner scaling path"
    ],
    process: ["Technical planning", "Build sprints", "QA and optimization", "Launch and post-launch stabilization"]
  }
];

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  return serviceDefinitions.find((service) => service.slug === slug) ?? null;
}
