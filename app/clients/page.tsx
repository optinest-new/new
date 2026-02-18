import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Explore selected client projects by Optinest Digital, including website mockups, brand logos, business names, and the technology stack used.",
  alternates: {
    canonical: "/clients"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/clients`,
    title: "Optinest Digital Clients",
    description:
      "Selected web design and SEO client showcases with technology stack details.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinest Digital Clients",
    description:
      "Selected web design and SEO client showcases with technology stack details.",
    images: ["/og.png"]
  }
};

type ClientProject = {
  name: string;
  industry: string;
  logoMonogram: string;
  tagline: string;
  technologies: string[];
  caseStudy: {
    challenge: string;
    solution: string;
    outcomes: string[];
  };
  mockupVariant:
    | "hero-grid"
    | "sidebar-dashboard"
    | "card-stack"
    | "booking-flow"
    | "doc-layout"
    | "menu-map";
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    ink: string;
  };
};

const clients: ClientProject[] = [
  {
    name: "Northline Dental Studio",
    industry: "Healthcare",
    logoMonogram: "ND",
    tagline: "Local clinic website redesign and patient SEO",
    technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Schema Markup", "GA4"],
    caseStudy: {
      challenge:
        "The previous site was slow on mobile and had weak service-page structure, causing low visibility for high-value local terms.",
      solution:
        "Rebuilt the website with faster templates, location-focused service pages, and on-page schema for healthcare services.",
      outcomes: ["+82% qualified organic sessions", "+41% appointment form submissions", "Core pages now under 2.0s mobile load"]
    },
    mockupVariant: "hero-grid",
    palette: { primary: "#e6f5ff", secondary: "#63b3ed", accent: "#16537e", ink: "#102a43" }
  },
  {
    name: "Summit Legal Group",
    industry: "Law Firm",
    logoMonogram: "SL",
    tagline: "Practice area pages and technical SEO fixes",
    technologies: ["React", "Node.js", "Express", "Cloudflare", "Search Console"],
    caseStudy: {
      challenge:
        "Practice pages were competing for similar terms, and weak internal linking reduced visibility for core legal services.",
      solution:
        "Restructured practice area architecture, implemented canonical and internal-link governance, and improved commercial intent copy.",
      outcomes: ["Top-10 rankings for 18 priority legal terms", "+57% growth in contact-qualified leads", "Reduced cannibalization across service pages"]
    },
    mockupVariant: "sidebar-dashboard",
    palette: { primary: "#f2f0ff", secondary: "#8f7de8", accent: "#3f2c8f", ink: "#1d1b38" }
  },
  {
    name: "Oakridge Roofing Co.",
    industry: "Home Services",
    logoMonogram: "OR",
    tagline: "Lead-focused landing pages for local demand",
    technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "Local SEO", "Ahrefs"],
    caseStudy: {
      challenge:
        "Traffic was coming in, but visitors were dropping off before contacting the business due to weak page flow and trust cues.",
      solution:
        "Designed conversion-focused service templates with proof stacks, local project highlights, and clearer quote request pathways.",
      outcomes: ["+63% increase in quote request completions", "+49% lift in local organic clicks", "Higher engagement on service comparison pages"]
    },
    mockupVariant: "card-stack",
    palette: { primary: "#fff6e9", secondary: "#f3b155", accent: "#9a5d00", ink: "#2b1a00" }
  },
  {
    name: "Luma Wellness Center",
    industry: "Wellness",
    logoMonogram: "LW",
    tagline: "Conversion-first service pages and booking flow",
    technologies: ["Astro", "React", "Supabase", "PageSpeed Optimization", "Hotjar"],
    caseStudy: {
      challenge:
        "Booking intent was high, but users encountered friction between educational pages and the final appointment flow.",
      solution:
        "Built a simplified booking funnel with intent-aligned page modules and faster service-category navigation.",
      outcomes: ["+46% improvement in booking completion rate", "+38% increase in organic-to-booking conversion", "Lower drop-off between service and booking pages"]
    },
    mockupVariant: "booking-flow",
    palette: { primary: "#ebfff8", secondary: "#4dd6a8", accent: "#0f7a5b", ink: "#12322a" }
  },
  {
    name: "ForgePoint Manufacturing",
    industry: "B2B Manufacturing",
    logoMonogram: "FM",
    tagline: "Technical content architecture and authority pages",
    technologies: ["Next.js", "MDX", "Node.js", "Technical SEO Audits", "Screaming Frog"],
    caseStudy: {
      challenge:
        "The site had strong expertise but poor information architecture, limiting non-brand discovery for product and capability terms.",
      solution:
        "Implemented a topic-cluster content model, technical crawl fixes, and authority pages mapped to buyer-stage intent.",
      outcomes: ["+71% growth in non-brand organic impressions", "+34% increase in qualified inbound RFQs", "Improved crawl depth and index coverage"]
    },
    mockupVariant: "doc-layout",
    palette: { primary: "#eef2f6", secondary: "#8aa2b8", accent: "#2f4a63", ink: "#13283a" }
  },
  {
    name: "Velvet Crumb Bakery",
    industry: "Restaurant",
    logoMonogram: "VC",
    tagline: "Mobile-first redesign and local map visibility",
    technologies: ["React", "Vite", "Tailwind CSS", "Google Business Profile", "Lighthouse"],
    caseStudy: {
      challenge:
        "Local discovery was inconsistent, and mobile visitors struggled to find menu, hours, and location details quickly.",
      solution:
        "Redesigned key pages for mobile-first browsing, improved local entity consistency, and optimized conversion actions for directions and calls.",
      outcomes: ["+52% increase in direction requests", "+44% increase in GBP-driven calls", "Stronger local pack visibility for branded and category terms"]
    },
    mockupVariant: "menu-map",
    palette: { primary: "#fff0f4", secondary: "#ff88aa", accent: "#9a1f4a", ink: "#3a1525" }
  }
];

function ClientLogo({ project }: { project: ClientProject }) {
  return (
    <svg
      viewBox="0 0 68 68"
      className="h-14 w-14 rounded-xl border-2 border-ink/80 shadow-[4px_4px_0_#111]"
      aria-label={`${project.name} logo`}
    >
      <rect x="0" y="0" width="68" height="68" fill={project.palette.primary} />
      <rect x="8" y="8" width="52" height="52" rx="10" fill={project.palette.secondary} />
      <circle cx="53" cy="14" r="6" fill={project.palette.accent} />
      <text
        x="34"
        y="41"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill={project.palette.ink}
      >
        {project.logoMonogram}
      </text>
    </svg>
  );
}

function WebsiteMockup({ project }: { project: ClientProject }) {
  const host = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;

  const commonTone = {
    backgroundImage: `linear-gradient(145deg, ${project.palette.primary} 0%, ${project.palette.secondary} 100%)`
  };

  const variant = (() => {
    if (project.mockupVariant === "hero-grid") {
      return (
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 px-3 py-4" style={commonTone}>
          <div className="h-2.5 w-20 rounded bg-white/90" />
          <div className="mt-3 h-2.5 w-4/5 rounded bg-white/80" />
          <div className="mt-2 h-2.5 w-3/5 rounded bg-white/75" />
          <div className="mt-4 inline-flex rounded-full border border-ink/20 bg-white px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/80">
            Book Visit
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-12 rounded border border-ink/15 bg-fog/70" />
          <div className="h-12 rounded border border-ink/15 bg-fog/70" />
          <div className="h-12 rounded border border-ink/15 bg-fog/70" />
        </div>
      </div>
    );
    }
    if (project.mockupVariant === "sidebar-dashboard") {
      return (
      <div className="grid grid-cols-[80px_1fr] gap-2 p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 bg-fog/75 p-2">
          <div className="h-2.5 w-full rounded bg-ink/20" />
          <div className="mt-2 h-2.5 w-4/5 rounded bg-ink/15" />
          <div className="mt-2 h-2.5 w-3/4 rounded bg-ink/15" />
          <div className="mt-2 h-2.5 w-2/3 rounded bg-ink/15" />
        </div>
        <div className="rounded-lg border border-ink/20 px-3 py-3" style={commonTone}>
          <div className="h-2.5 w-1/2 rounded bg-white/90" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-12 rounded bg-white/80" />
            <div className="h-12 rounded bg-white/70" />
          </div>
          <div className="mt-3 h-16 rounded border border-ink/15 bg-white/75" />
        </div>
      </div>
    );
    }
    if (project.mockupVariant === "card-stack") {
      return (
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 p-3" style={commonTone}>
          <div className="h-2.5 w-24 rounded bg-white/90" />
          <div className="mt-3 grid gap-2">
            <div className="rounded-md border border-ink/15 bg-white/80 p-2.5">
              <div className="h-2.5 w-1/3 rounded bg-ink/15" />
              <div className="mt-2 h-2.5 w-5/6 rounded bg-ink/10" />
            </div>
            <div className="rounded-md border border-ink/15 bg-white/80 p-2.5">
              <div className="h-2.5 w-1/4 rounded bg-ink/15" />
              <div className="mt-2 h-2.5 w-4/5 rounded bg-ink/10" />
            </div>
          </div>
          <div className="mt-3 h-8 rounded-full border border-ink/20 bg-white/85" />
        </div>
      </div>
    );
    }
    if (project.mockupVariant === "booking-flow") {
      return (
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 p-3" style={commonTone}>
          <div className="grid grid-cols-4 gap-1.5">
            <div className="h-1.5 rounded bg-white/65" />
            <div className="h-1.5 rounded bg-white/80" />
            <div className="h-1.5 rounded bg-white/60" />
            <div className="h-1.5 rounded bg-white/45" />
          </div>
          <div className="mt-3 rounded-md border border-ink/15 bg-white/80 p-2.5">
            <div className="h-2.5 w-1/3 rounded bg-ink/15" />
            <div className="mt-2 h-7 rounded bg-white" />
            <div className="mt-2 h-7 rounded bg-white" />
            <div className="mt-2 h-7 rounded bg-white" />
          </div>
          <div className="mt-3 h-8 rounded-full bg-white/90" />
        </div>
      </div>
    );
    }
    if (project.mockupVariant === "doc-layout") {
      return (
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 p-3" style={commonTone}>
          <div className="h-2.5 w-28 rounded bg-white/90" />
          <div className="mt-3 grid grid-cols-[1fr_84px] gap-2">
            <div className="rounded-md border border-ink/15 bg-white/85 p-2.5">
              <div className="h-2.5 w-5/6 rounded bg-ink/15" />
              <div className="mt-2 h-2.5 w-4/5 rounded bg-ink/10" />
              <div className="mt-2 h-2.5 w-3/4 rounded bg-ink/10" />
              <div className="mt-2 h-2.5 w-2/3 rounded bg-ink/10" />
            </div>
            <div className="rounded-md border border-ink/15 bg-white/80 p-2">
              <div className="h-6 rounded bg-fog/90" />
              <div className="mt-2 h-6 rounded bg-fog/90" />
              <div className="mt-2 h-6 rounded bg-fog/90" />
            </div>
          </div>
        </div>
      </div>
    );
    }
    return (
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-ink/20 p-3" style={commonTone}>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <div className="rounded-md border border-ink/15 bg-white/85 p-2.5">
              <div className="h-2.5 w-1/2 rounded bg-ink/15" />
              <div className="mt-2 h-2.5 w-4/5 rounded bg-ink/10" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-12 rounded bg-fog/80" />
                <div className="h-12 rounded bg-fog/80" />
              </div>
            </div>
            <div className="rounded-md border border-ink/15 bg-white/90 p-2">
              <div className="h-16 rounded border border-dashed border-ink/20 bg-fog/80" />
              <div className="mt-2 h-2.5 w-4/5 rounded bg-ink/20" />
              <div className="mt-1.5 h-2.5 w-2/3 rounded bg-ink/10" />
            </div>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <figure className="mt-5 overflow-hidden rounded-xl border-2 border-ink/80 bg-white shadow-[4px_4px_0_#111]">
      <div className="flex items-center gap-2 border-b-2 border-ink/20 bg-fog px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 truncate rounded bg-white px-2 py-1 text-[0.64rem] font-semibold text-ink/70 sm:text-[0.7rem]">
          {host}
        </span>
      </div>
      {variant}
    </figure>
  );
}

export default function ClientsPage() {
  const listSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/clients#webpage`,
        url: `${siteUrl}/clients`,
        name: "Optinest Digital Clients",
        description:
          "Selected client showcases from Optinest Digital featuring logo, website mockup, and technology stack."
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/clients#items`,
        itemListElement: clients.map((client, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: client.name,
            description: client.tagline
          }
        }))
      }
    ]
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <header className="mx-auto max-w-4xl text-center">
        <p className="eyebrow-pop mx-auto inline-block">Selected Client Work</p>
        <h1 className="hero-title mt-5 text-balance font-display text-[clamp(2rem,7vw,4.6rem)] uppercase leading-[0.9] tracking-tight">
          Client Website Showcases
        </h1>
        <p className="tagline-pop mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-4 py-4 font-mono text-sm font-bold leading-relaxed sm:px-6 sm:text-base">
          A snapshot of recent client projects including brand mark, website mockup, business profile, and technology stack used in delivery.
        </p>
      </header>

      <section aria-label="Client showcase cards" className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
        {clients.map((project) => (
          <article key={project.name} className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-5">
            <header className="flex items-start gap-3">
              <ClientLogo project={project} />
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/65">{project.industry}</p>
                <h2 className="mt-1 text-lg font-display uppercase leading-[0.95] text-ink">{project.name}</h2>
                <p className="mt-2 text-sm text-ink/80">{project.tagline}</p>
              </div>
            </header>

            <WebsiteMockup project={project} />

            <div className="mt-4">
              <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink/70">Technology Used</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-ink/30 bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-ink/80"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <section className="mt-4 rounded-lg border border-ink/20 bg-white p-3.5" aria-label={`${project.name} case study`}>
              <h3 className="font-display text-base uppercase leading-none text-ink">Case Study Snapshot</h3>
              <dl className="mt-3 space-y-2.5 text-[0.82rem] leading-relaxed text-ink/85 sm:text-[0.86rem]">
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink/65">Challenge</dt>
                  <dd className="mt-1">{project.caseStudy.challenge}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink/65">Solution</dt>
                  <dd className="mt-1">{project.caseStudy.solution}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink/65">Outcomes</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1">
                      {project.caseStudy.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-1.5">
                          <span aria-hidden="true" className="mt-[0.36rem] h-1.5 w-1.5 rounded-full bg-[#f7de46]" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </section>
          </article>
        ))}
      </section>
    </main>
  );
}
