export type ServiceDefinition = {
  slug: string;
  title: string;
  shortLabel: string;
  summary: string;
  intro: string;
  timeline: string;
  investment: string;
  deliverables: string[];
  outcomes: string[];
  process: string[];
};

export const serviceDefinitions: ServiceDefinition[] = [
  {
    slug: "seo",
    title: "SEO Growth System",
    shortLabel: "SEO",
    summary:
      "Technical SEO, content architecture, and conversion-focused optimization built around lead quality and revenue goals.",
    intro:
      "This service is for businesses that need qualified organic traffic, not vanity rankings. We prioritize technical fixes, search-intent mapping, and measurable growth opportunities.",
    timeline: "6 to 12 weeks for initial rollout, then monthly growth cycles.",
    investment: "Typical range: $1,500 to $6,000 per month depending on scope.",
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
    timeline: "4 to 10 weeks depending on number of templates and content readiness.",
    investment: "Typical range: $2,500 to $12,000 per project.",
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
    timeline: "4 to 12 weeks depending on feature complexity and integrations.",
    investment: "Typical range: $3,500 to $18,000 per project.",
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
