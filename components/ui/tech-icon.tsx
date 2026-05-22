import type { ReactNode } from "react";

type TechKey =
  | "nextjs"
  | "react"
  | "tailwind"
  | "supabase"
  | "ruby"
  | "javascript"
  | "php"
  | "mysql"
  | "firebase"
  | "jekyll"
  | "vercel"
  | "netlify"
  | "github-pages"
  | "astro"
  | "headless-cms"
  | "decap-cms"
  | "ga4"
  | "search-console"
  | "tag-manager"
  | "wordpress";

export const techBadgeStyles: Record<TechKey, string> = {
  nextjs: "border-[#1f2937]/30 bg-[#f3f4f6] text-[#111827]",
  react: "border-[#0e7490]/30 bg-[#ecfeff] text-[#0891b2]",
  tailwind: "border-[#0c4a6e]/30 bg-[#e0f2fe] text-[#0369a1]",
  supabase: "border-[#166534]/30 bg-[#ecfdf3] text-[#16a34a]",
  ruby: "border-[#9f1239]/30 bg-[#fff1f2] text-[#be123c]",
  javascript: "border-[#a16207]/30 bg-[#fffbeb] text-[#a16207]",
  php: "border-[#4338ca]/30 bg-[#eef2ff] text-[#4338ca]",
  mysql: "border-[#0c4a6e]/30 bg-[#ecfeff] text-[#0e7490]",
  firebase: "border-[#c2410c]/30 bg-[#fff7ed] text-[#ea580c]",
  jekyll: "border-[#991b1b]/30 bg-[#fef2f2] text-[#b91c1c]",
  vercel: "border-[#111827]/30 bg-[#f3f4f6] text-[#111827]",
  netlify: "border-[#0f766e]/30 bg-[#f0fdfa] text-[#0f766e]",
  "github-pages": "border-[#111827]/30 bg-[#f8fafc] text-[#111827]",
  astro: "border-[#7c3aed]/30 bg-[#f5f3ff] text-[#7c3aed]",
  "headless-cms": "border-[#4338ca]/30 bg-[#eef2ff] text-[#4338ca]",
  "decap-cms": "border-[#0f7663]/30 bg-[#ecfdf5] text-[#0f7663]",
  ga4: "border-[#9a6700]/30 bg-[#fffbeb] text-[#a16207]",
  "search-console": "border-[#1d4ed8]/30 bg-[#eff6ff] text-[#1d4ed8]",
  "tag-manager": "border-[#7e22ce]/30 bg-[#faf5ff] text-[#9333ea]",
  wordpress: "border-[#0f7663]/30 bg-[#f0fdf4] text-[#15803d]"
};

function TechSvg({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

export function TechIcon({ tech }: { tech: TechKey }) {
  switch (tech) {
    case "nextjs":
      return <TechSvg><circle cx="12" cy="12" r="9" /><path d="M8 16V8l8 8V8" /></TechSvg>;
    case "react":
      return (
        <TechSvg>
          <circle cx="12" cy="12" r="1.8" />
          <ellipse cx="12" cy="12" rx="8" ry="3.2" />
          <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(120 12 12)" />
        </TechSvg>
      );
    case "tailwind":
      return (
        <TechSvg>
          <path d="M5 9c1.5-2 3-3 5-3 3 0 3.5 2 5.5 2S19 6.5 20 5c-1.2 3.5-3 5-5.5 5-2.8 0-3.2-2-5.5-2S6.2 9.5 5 12" />
          <path d="M4 15c1.2-1.8 2.6-2.6 4.5-2.6 2.6 0 3 1.8 5 1.8 1.6 0 2.8-.9 4-2.3-1.2 3.3-3 4.8-5.3 4.8-2.4 0-2.8-1.8-5.1-1.8-1.2 0-2.1.5-3.1 1.5" />
        </TechSvg>
      );
    case "supabase":
      return <TechSvg><path d="M7 18 13 6h4l-6 12H7Z" /><path d="m11 18 6-12" /></TechSvg>;
    case "ruby":
      return <TechSvg><path d="m12 4 6 4-2 8h-8L6 8l6-4Z" /><path d="M12 4v12" /></TechSvg>;
    case "javascript":
      return (
        <TechSvg>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M10 9v5a2 2 0 0 1-2 2H7" />
          <path d="M13 15c.4.7 1.2 1 2 1s1.5-.4 1.5-1.1c0-1.8-3.5-.9-3.5-3 0-1 .9-1.9 2.3-1.9.9 0 1.6.3 2.1 1" />
        </TechSvg>
      );
    case "php":
      return <TechSvg><ellipse cx="12" cy="12" rx="8.5" ry="5.5" /><path d="M8.5 14V10h1.8a1.6 1.6 0 1 1 0 3.2H8.5" /><path d="M12.5 14V10h1.8a1.6 1.6 0 1 1 0 3.2h-1.8" /></TechSvg>;
    case "mysql":
      return <TechSvg><ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" /><path d="M5.5 6.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" /><path d="M5.5 11.5v5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-5" /></TechSvg>;
    case "firebase":
      return <TechSvg><path d="M6 18 11.5 4l2.6 4.2L6 18Z" /><path d="M18 18 12 5.8 9.8 10 18 18Z" /><path d="M8.4 14.3 12 18l3.6-3.7" /></TechSvg>;
    case "jekyll":
      return <TechSvg><path d="M5 19V7l4-2 4 2v12H5Z" /><path d="M13 19v-9l3-1.5L19 10v9h-6Z" /></TechSvg>;
    case "vercel":
      return <TechSvg><path d="M12 5 5 18h14L12 5Z" /></TechSvg>;
    case "netlify":
      return <TechSvg><rect x="5" y="5" width="6" height="6" rx="1" /><rect x="13" y="13" width="6" height="6" rx="1" /><path d="M11 8h2M8 11v2M16 11v2M11 16h2" /></TechSvg>;
    case "github-pages":
      return <TechSvg><path d="M12 3a8.5 8.5 0 0 0-2.7 16.6v-2.4c-2 .4-2.5-.9-2.5-.9-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2.1 1 2.7.8.1-.5.3-.9.6-1.1-1.8-.2-3.8-.9-3.8-4a3.2 3.2 0 0 1 .9-2.2 3 3 0 0 1 .1-2.2s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8a3 3 0 0 1 .1 2.2 3.2 3.2 0 0 1 .9 2.2c0 3.1-2 3.8-3.9 4 .3.2.6.7.6 1.4v2.1A8.5 8.5 0 0 0 12 3Z" /></TechSvg>;
    case "astro":
      return <TechSvg><path d="M8 17c0 1.7 1.8 3 4 3s4-1.3 4-3" /><path d="m7 17 2.2-10h5.6L17 17" /></TechSvg>;
    case "headless-cms":
      return <TechSvg><rect x="4" y="5" width="7" height="6" rx="1.5" /><rect x="13" y="5" width="7" height="6" rx="1.5" /><rect x="4" y="13" width="16" height="6" rx="1.5" /></TechSvg>;
    case "decap-cms":
      return <TechSvg><path d="M5 7h10l4 4v6H5z" /><path d="M15 7v4h4" /><path d="M8 14h8M8 17h5" /></TechSvg>;
    case "ga4":
      return <TechSvg><rect x="5" y="12" width="3" height="7" rx="1" /><rect x="10.5" y="9" width="3" height="10" rx="1" /><rect x="16" y="5" width="3" height="14" rx="1" /></TechSvg>;
    case "search-console":
      return <TechSvg><rect x="4" y="4" width="12" height="14" rx="2" /><path d="M8 8h4M8 11h4M8 14h3" /><path d="m15 15 5 5" /><circle cx="14" cy="14" r="3" /></TechSvg>;
    case "tag-manager":
      return <TechSvg><path d="m6 6 6 6-6 6" /><path d="m12 6 6 6-6 6" /></TechSvg>;
    case "wordpress":
      return <TechSvg><circle cx="12" cy="12" r="8" /><path d="M8 9h8M8 12h8M8 15h5" /></TechSvg>;
  }
}
