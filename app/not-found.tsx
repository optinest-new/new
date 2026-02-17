import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-[70vh] overflow-hidden text-ink">
      <div aria-hidden="true" className="checker-bg" />

      <section className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="eyebrow-pop mb-8 w-full max-w-3xl font-mono">404 · Page Not Found</p>

        <h1 className="hero-title max-w-5xl font-display text-[clamp(2.4rem,11vw,7rem)] uppercase leading-[0.9] tracking-tight">
          <span className="hero-line hero-line-top">Looks Like This</span>
          <br />
          <span className="hero-line hero-line-bottom">Page Is Missing</span>
        </h1>

        <p className="tagline-pop mt-6 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-5 py-4 text-balance font-mono text-[0.95rem] font-bold leading-relaxed tracking-[0.02em] text-ink sm:text-base md:px-6 md:text-xl">
          The URL may have changed, or the page may have been removed. Use the links below to continue browsing.
        </p>

        <nav aria-label="404 recovery links" className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-mist transition hover:-translate-y-1 hover:shadow-hard sm:px-8 sm:text-sm"
          >
            Go Home
            <span aria-hidden="true" className="text-xl leading-none">
              →
            </span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink/70 bg-white px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:-translate-y-1 sm:px-8 sm:text-sm"
          >
            Visit Blog
          </Link>
        </nav>
      </section>
    </main>
  );
}
