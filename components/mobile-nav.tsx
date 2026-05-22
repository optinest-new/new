"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthAwareNavLinks } from "@/components/auth-aware-nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center border-2 border-primary bg-mist text-primary shadow-hard md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]" aria-hidden="true">
          {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-mono font-semibold uppercase tracking-[0.14em] text-white/78 md:flex">
        <Link href="/" className="hover:text-primary">Home</Link>
        <Link href="/clients" className="hover:text-primary">Clients</Link>
        <Link href="/blog" className="hover:text-primary">Blog</Link>
        <Link href="/services" className="hover:text-primary">Services</Link>
        <AuthAwareNavLinks placement="header" />
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <div className="relative ml-auto flex h-full w-72 flex-col border-l-2 border-white/15 bg-page px-6 py-6 shadow-hard animate-slide-in-right">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-primary">Navigation</p>
                <span className="mt-1 block font-display text-xl uppercase text-ink">Menu</span>
              </div>
              <button type="button" onClick={close} className="inline-flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-mist text-ink" aria-label="Close menu">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]" aria-hidden="true">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm font-mono font-semibold uppercase tracking-[0.14em] text-ink">
              <Link href="/" onClick={close} className="border-2 border-white/18 bg-mist px-4 py-3 hover:border-primary hover:text-primary">Home</Link>
              <Link href="/clients" onClick={close} className="border-2 border-white/18 bg-mist px-4 py-3 hover:border-primary hover:text-primary">Clients</Link>
              <Link href="/blog" onClick={close} className="border-2 border-white/18 bg-mist px-4 py-3 hover:border-primary hover:text-primary">Blog</Link>
              <Link href="/services" onClick={close} className="border-2 border-white/18 bg-mist px-4 py-3 hover:border-primary hover:text-primary">Services</Link>
              <AuthAwareNavLinks placement="header" onItemClick={close} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
