import Link from "next/link";
import { ReactNode } from "react";
import { FloatingShare } from "@/components/blog/floating-share";

type ToolPageShellProps = {
  title: string;
  description: string;
  slug: string;
  children: ReactNode;
  eyebrow?: string;
  shareTitle?: string;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export function ToolPageShell({
  title,
  description,
  slug,
  children,
  eyebrow = "Free utility",
  shareTitle
}: ToolPageShellProps) {
  const toolUrl = `${siteUrl}/tools/${slug}`;

  return (
    <main className="tool-workspace mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink/62 sm:text-sm">
        <Link href="/tools" className="transition hover:text-primary">
          Tools
        </Link>{" "}
        <span className="px-2 text-primary">/</span>
        <span aria-current="page" className="text-ink/80">
          {title}
        </span>
      </nav>

      <section className="tool-shell neo-panel relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
        <div className="checker-bg" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <p className="eyebrow-pop w-fit">{eyebrow}</p>
            <h1 className="hero-title mt-5 text-balance font-display text-[clamp(2.1rem,6vw,4.8rem)] uppercase leading-[0.88] tracking-[-0.05em] text-ink">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink/82 sm:text-lg">
              {description}
            </p>
          </div>

          <aside className="neo-muted-panel grid gap-3 px-4 py-4 sm:px-5">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary/80">Tool setup</p>
              <p className="mt-2 font-display text-xl uppercase leading-none text-ink">Launch, fill, export.</p>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-ink/76">
              <li>Free browser-based workflow.</li>
              <li>Square UI tuned for faster data entry.</li>
              <li>Mobile spacing tightened for smaller screens.</li>
            </ul>
            <div className="section-divider" />
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink/60">
              /tools/{slug}
            </p>
          </aside>
        </div>
      </section>

      <div className="mt-5">{children}</div>

      <FloatingShare
        title={shareTitle || `${title} Tool by Optinest Digital`}
        url={toolUrl}
        label="Share this tool"
      />
    </main>
  );
}
