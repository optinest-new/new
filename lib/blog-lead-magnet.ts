type LeadMagnetTemplate = {
  title: string;
  description: string;
  checklist: string[];
  fileName: string;
};

export type BlogLeadMagnet = LeadMagnetTemplate;

const defaultMagnet: LeadMagnetTemplate = {
  title: "SEO & Web Growth Planning Pack",
  description:
    "Download a practical checklist to align SEO, UX, and implementation priorities before your next sprint.",
  checklist: [
    "Define primary conversion goals and lead quality criteria",
    "Map top pages to search intent and funnel stage",
    "Identify technical blockers affecting crawl and indexation",
    "Audit CTA placement and form friction on high-traffic pages",
    "Set KPI dashboard metrics for traffic, leads, and revenue"
  ],
  fileName: "seo-web-growth-planning-pack.txt"
};

export function getBlogLeadMagnet(input: { title: string; category: string; tags: string[] }): BlogLeadMagnet {
  const haystack = `${input.title} ${input.category} ${input.tags.join(" ")}`.toLowerCase();

  if (haystack.includes("technical seo")) {
    return {
      title: "Technical SEO Audit Prep Checklist",
      description:
        "Use this checklist to collect the right access, data points, and page signals before starting a technical audit.",
      checklist: [
        "Collect Search Console, Analytics, and CMS access",
        "Export index coverage and key URL groups",
        "List top revenue pages and conversion paths",
        "Document crawl, speed, and render issues by priority",
        "Create implementation owner and deadline matrix"
      ],
      fileName: "technical-seo-audit-prep-checklist.txt"
    };
  }

  if (haystack.includes("website redesign") || haystack.includes("web design")) {
    return {
      title: "Website Redesign Scope Planner",
      description:
        "Plan a redesign that improves both conversion and organic performance with less rework.",
      checklist: [
        "Define page templates and required sections",
        "Map existing pages to keep, merge, or retire",
        "Capture current conversion baseline and friction points",
        "Align messaging hierarchy with target audience segments",
        "Prepare launch QA for redirects, metadata, and schema"
      ],
      fileName: "website-redesign-scope-planner.txt"
    };
  }

  if (haystack.includes("local seo")) {
    return {
      title: "Local SEO Growth Checklist",
      description:
        "Follow this checklist to improve local visibility, map-pack performance, and lead conversion quality.",
      checklist: [
        "Audit and optimize Google Business Profile categories and services",
        "Build location-specific landing pages with intent-focused copy",
        "Standardize NAP and citation consistency across directories",
        "Improve local schema and review acquisition workflow",
        "Track call, form, and direction-click conversions by location"
      ],
      fileName: "local-seo-growth-checklist.txt"
    };
  }

  if (haystack.includes("conversion") || haystack.includes("ux")) {
    return {
      title: "Conversion UX Optimization Checklist",
      description:
        "Use this framework to tighten user flow, reduce drop-offs, and improve action rates from organic traffic.",
      checklist: [
        "Audit hero copy and above-the-fold CTA clarity",
        "Remove unnecessary fields and friction in lead forms",
        "Add trust signals near high-intent actions",
        "Improve section hierarchy for scanning and comprehension",
        "Set weekly test plan for headlines, proof blocks, and CTA labels"
      ],
      fileName: "conversion-ux-optimization-checklist.txt"
    };
  }

  return defaultMagnet;
}
