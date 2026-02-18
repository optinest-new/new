"use client";

import { useEffect, useState } from "react";

type FloatingShareProps = {
  title: string;
  url: string;
  label?: string;
};

export function FloatingShare({ title, url, label = "Share this article" }: FloatingShareProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function onNativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) {
      return;
    }

    try {
      await navigator.share({ title, url });
    } catch {
      // Ignore cancellation and browser share errors.
    }
  }

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-3 z-50 2xl:bottom-auto 2xl:right-6 2xl:top-1/2 2xl:-translate-y-1/2">
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle share options"
        aria-expanded={mobileOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink/80 bg-mist text-ink shadow-hard 2xl:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="2.2" />
          <circle cx="6" cy="12" r="2.2" />
          <circle cx="18" cy="19" r="2.2" />
          <path d="M8 11l8-5M8 13l8 5" />
        </svg>
      </button>

      <aside
        aria-label={label}
        className={`${mobileOpen ? "mt-2 block" : "hidden"} w-36 rounded-xl border-2 border-ink/80 bg-mist/95 p-2 shadow-hard backdrop-blur 2xl:mt-0 2xl:block 2xl:w-44 2xl:rounded-2xl 2xl:p-3`}
      >
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink/75 sm:text-[0.65rem]">
          {label}
        </p>
        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-1 sm:gap-2">
          <a
            href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-ink/60 bg-white px-2 py-1.5 text-[0.62rem] font-semibold text-ink transition hover:-translate-y-0.5 sm:px-3 sm:py-2 sm:text-xs"
          >
            Share on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-ink/60 bg-white px-2 py-1.5 text-[0.62rem] font-semibold text-ink transition hover:-translate-y-0.5 sm:px-3 sm:py-2 sm:text-xs"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex items-center justify-center rounded-md border border-ink/60 bg-white px-2 py-1.5 text-[0.62rem] font-semibold text-ink transition hover:-translate-y-0.5 sm:px-3 sm:py-2 sm:text-xs"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
          <button
            type="button"
            onClick={onNativeShare}
            disabled={!canNativeShare}
            className="inline-flex items-center justify-center rounded-md border border-ink/60 bg-white px-2 py-1.5 text-[0.62rem] font-semibold text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
          >
            Native Share
          </button>
        </div>
      </aside>
    </div>
  );
}
