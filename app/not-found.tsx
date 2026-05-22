import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <p className="eyebrow-pop mx-auto inline-block">404 — Page Not Found</p>
      <h1 className="hero-title mt-5 text-balance font-display text-[clamp(2rem,7vw,4.4rem)] uppercase leading-[0.9] tracking-tight">
        This Page Does Not Exist
      </h1>
      <p className="tagline-pop mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-4 py-4 font-mono text-sm font-bold leading-relaxed sm:px-6 sm:text-base">
        The link you followed may be broken or the page may have been moved. Try starting from the homepage.
      </p>
      <Link href="/" className="mt-8 inline-flex">
        <Button variant="primary" size="lg">
          Go Home
        </Button>
      </Link>
      <Link href="/portal" className="mt-3 inline-flex">
        <Button variant="secondary" size="md">
          Open Portal
        </Button>
      </Link>
    </main>
  );
}
