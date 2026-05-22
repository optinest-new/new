import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

type BlogListProps = {
  posts: BlogPostMeta[];
  currentPage: number;
  totalPages: number;
  title: string;
  description: string;
};

function pageHref(page: number) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

function getCompactPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function BlogList({ posts, currentPage, totalPages, title, description }: BlogListProps) {
  const compactPages = getCompactPages(currentPage, totalPages);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mx-auto max-w-4xl text-center">
        <p className="eyebrow-pop mx-auto">Growth insights</p>
        <h1 className="hero-title mt-6 font-display text-[clamp(2.6rem,8vw,5.8rem)] uppercase leading-[0.9] tracking-[-0.06em] text-ink">
          {title}
        </h1>
        <p className="tagline-pop mx-auto mt-5 max-w-3xl border-2 border-white/85 px-5 py-5 text-sm leading-7 text-white/80 sm:text-base">
          {description}
        </p>
      </header>

      <section aria-label="Blog posts" className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className={`overflow-hidden border-2 border-white/85 ${index % 3 === 0 ? "bg-primary text-black" : "bg-mist text-ink"} shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg`}
          >
            <Link href={`/blog/${post.slug}`} className="block h-full">
              <img
                src={post.featureImage}
                alt={`Feature image for ${post.title}`}
                loading="lazy"
                className="h-48 w-full border-b-2 border-black/70 bg-white object-cover"
              />
              <div className="p-5">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] opacity-75">{post.category}</p>
                <h2 className="mt-3 font-display text-3xl uppercase leading-[0.94] tracking-[-0.04em]">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 opacity-80">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/20 pt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] opacity-70">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </section>

      <nav aria-label="Blog pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
        <Link
          href={pageHref(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          className={`border-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition ${
            currentPage === 1
              ? "pointer-events-none border-white/10 bg-mist text-white/25"
              : "border-white/80 bg-mist text-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5"
          }`}
        >
          Prev
        </Link>

        {compactPages.map((page, idx) => {
          const prev = compactPages[idx - 1];
          const showEllipsis = prev && page - prev > 1;
          const active = page === currentPage;

          return (
            <span key={page} className="inline-flex items-center gap-2">
              {showEllipsis ? <span className="px-1 text-xs font-semibold text-white/45">...</span> : null}
              <Link
                href={pageHref(page)}
                aria-current={active ? "page" : undefined}
                className={`border-2 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition ${
                  active
                    ? "border-black bg-primary text-black shadow-hard"
                    : "border-white/80 bg-mist text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-primary"
                }`}
              >
                {page}
              </Link>
            </span>
          );
        })}

        <Link
          href={pageHref(Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage === totalPages}
          className={`border-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition ${
            currentPage === totalPages
              ? "pointer-events-none border-white/10 bg-mist text-white/25"
              : "border-white/80 bg-mist text-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5"
          }`}
        >
          Next
        </Link>
      </nav>
    </main>
  );
}
