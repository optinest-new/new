import type { ReactNode } from "react";

type PricingTierCategory = "large" | "ecommerce" | "local" | "small" | "default";

type PricingTierStyle = {
  row: string;
  badge: string;
  range: string;
  iconWrap: string;
};

function getTierCategory(category: string): PricingTierCategory {
  const n = category.toLowerCase();
  if (n.includes("large") || n.includes("enterprise") || n.includes("custom") || n.includes("corporate") || n.includes("aggressive")) return "large";
  if (n.includes("e-commerce") || n.includes("mid-sized")) return "ecommerce";
  if (n.includes("local")) return "local";
  if (n.includes("small") || n.includes("startup") || n.includes("simple") || n.includes("personal") || n.includes("portfolio")) return "small";
  return "default";
}

function getTierStyle(category: string): PricingTierStyle {
  switch (getTierCategory(category)) {
    case "large":
      return {
        row: "border-[#b42318]/25 bg-[#fff4f2]",
        badge: "bg-[#f04438] text-white",
        range: "text-[#7a271a]",
        iconWrap: "border-[#f04438]/40 bg-[#ffe4e1] text-[#b42318]"
      };
    case "ecommerce":
      return {
        row: "border-[#175cd3]/25 bg-[#eff8ff]",
        badge: "bg-[#175cd3] text-white",
        range: "text-[#1849a9]",
        iconWrap: "border-[#175cd3]/40 bg-[#dbeafe] text-[#175cd3]"
      };
    case "local":
      return {
        row: "border-[#0e9384]/25 bg-[#ecfdf3]",
        badge: "bg-[#0e9384] text-white",
        range: "text-[#0f766e]",
        iconWrap: "border-[#0e9384]/35 bg-[#ccfbf1] text-[#0f766e]"
      };
    case "small":
      return {
        row: "border-[#12b76a]/25 bg-[#edfcf2]",
        badge: "bg-[#12b76a] text-white",
        range: "text-[#027a48]",
        iconWrap: "border-[#12b76a]/35 bg-[#dcfce7] text-[#027a48]"
      };
    default:
      return {
        row: "border-[#c58a00]/30 bg-[#fff7e0]",
        badge: "bg-[#b17a00] text-white",
        range: "text-[#6a4700]",
        iconWrap: "border-[#b17a00]/35 bg-[#fef3c7] text-[#7a5200]"
      };
  }
}

function TierIcon({ category }: { category: string }) {
  const cat = getTierCategory(category);
  const size = 14;
  const props = { "aria-hidden": true as const, viewBox: "0 0 24 24", className: "h-3.5 w-3.5", fill: "none" as const, stroke: "currentColor" as const, strokeWidth: "2" as const };

  if (cat === "large") return <svg {...props}><path d="M6 16V9M12 16V6M18 16v-4" /><path d="M4 18h16" /></svg>;
  if (cat === "ecommerce") return <svg {...props}><rect x="3.5" y="7" width="17" height="10" rx="2" /><path d="M3.5 11h17" /></svg>;
  if (cat === "local") return <svg {...props}><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" /><circle cx="12" cy="11" r="2" /></svg>;
  if (cat === "small") return <svg {...props}><circle cx="12" cy="12" r="7" /><path d="M12 8v8M9.5 10.5c.3-1 1.1-1.5 2.5-1.5 1.5 0 2.5.7 2.5 1.8 0 1-1 1.5-2.5 1.8-1.3.3-2.3.7-2.3 1.8 0 1 .8 1.8 2.3 1.8 1.4 0 2.2-.6 2.5-1.6" /></svg>;
  return <svg {...props}><path d="M4 8h16v8H4z" /><path d="M8 12h8" /></svg>;
}

type PricingTierCardProps = {
  category: string;
  range: string;
  slug?: string;
};

export function PricingTierCard({ category, range }: PricingTierCardProps) {
  const style = getTierStyle(category);
  return (
    <li className={`rounded-lg border px-2.5 py-2 ${style.row}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${style.iconWrap}`}>
          <TierIcon category={category} />
        </span>
        <div>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${style.badge}`}>
            {category}
          </span>
          <p className={`mt-1 text-sm font-semibold leading-snug ${style.range}`}>{range}</p>
        </div>
      </div>
    </li>
  );
}
