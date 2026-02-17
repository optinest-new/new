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
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-4xl uppercase leading-[0.9] text-ink sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-ink/80 sm:mt-4 sm:text-base md:text-lg">
          {description}
        </p>
      </header>

      <section aria-label="Blog posts" className="grid gap-5 sm:gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="overflow-hidden rounded-2xl border-2 border-ink/85 bg-mist shadow-hard transition hover:-translate-y-1"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <img
                src={post.featureImage}
                alt={`Feature image for ${post.title}`}
                loading="lazy"
                className="h-40 w-full border-b-2 border-ink/80 bg-white object-cover sm:h-44"
              />
              <div className="p-4 sm:p-5">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink/70">{post.category}</p>
                <h2 className="mt-2 text-lg font-bold leading-tight text-ink sm:text-xl">{post.title}</h2>
                <p className="mt-2 text-sm text-ink/75">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between font-mono text-[0.68rem] text-ink/70 sm:text-xs">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </section>

      <nav aria-label="Blog pagination" className="mt-12 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Link
          href={pageHref(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          className={`rounded-md border-2 px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition sm:px-3 sm:text-xs ${
            currentPage === 1
              ? "pointer-events-none border-ink/30 bg-white text-ink/35"
              : "border-ink/65 bg-white text-ink hover:-translate-y-0.5"
          }`}
        >
          Prev
        </Link>

        {compactPages.map((page, idx) => {
          const prev = compactPages[idx - 1];
          const showEllipsis = prev && page - prev > 1;
          const active = page === currentPage;

          return (
            <span key={page} className="inline-flex items-center gap-1.5 sm:gap-2">
              {showEllipsis ? (
                <span className="px-1 text-xs font-semibold text-ink/55" aria-hidden="true">
                  ...
                </span>
              ) : null}
              <Link
                href={pageHref(page)}
                aria-current={active ? "page" : undefined}
                className={`rounded-md border-2 px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                  active
                    ? "border-ink bg-ink text-mist"
                    : "border-ink/65 bg-white text-ink hover:-translate-y-0.5"
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
          className={`rounded-md border-2 px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition sm:px-3 sm:text-xs ${
            currentPage === totalPages
              ? "pointer-events-none border-ink/30 bg-white text-ink/35"
              : "border-ink/65 bg-white text-ink hover:-translate-y-0.5"
          }`}
        >
          Next
        </Link>
      </nav>
    </main>
  );
}
