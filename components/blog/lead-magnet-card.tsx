"use client";

import { FormEvent, useMemo, useState } from "react";
import type { BlogLeadMagnet } from "@/lib/blog-lead-magnet";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type LeadMagnetCardProps = {
  magnet: BlogLeadMagnet;
  postTitle: string;
  postSlug: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function createDownloadContent(magnet: BlogLeadMagnet, postTitle: string): string {
  const lines = [
    magnet.title,
    "",
    `Context: ${postTitle}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Checklist:",
    ...magnet.checklist.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Prepared by Optinest Digital"
  ];

  return lines.join("\n");
}

export function LeadMagnetCard({ magnet, postTitle, postSlug }: LeadMagnetCardProps) {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function triggerDownload(fileName: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function persistLeadInBrowser(emailValue: string) {
    try {
      const storageKey = "optinest_lead_magnets";
      const raw = window.localStorage.getItem(storageKey);
      const list = raw ? (JSON.parse(raw) as Array<{ email: string; title: string; at: string }>) : [];
      list.push({ email: emailValue, title: magnet.title, at: new Date().toISOString() });
      window.localStorage.setItem(storageKey, JSON.stringify(list.slice(-60)));
    } catch {
      // Ignore persistence errors.
    }
  }

  async function persistLeadInSupabase(emailValue: string): Promise<string | null> {
    if (!supabase) {
      return null;
    }

    const { error } = await supabase.from("lead_magnet_submissions").insert({
      email: emailValue,
      post_slug: postSlug,
      post_title: postTitle,
      magnet_title: magnet.title,
      page_path: typeof window !== "undefined" ? window.location.pathname : `/blog/${postSlug}`
    });

    return error?.message || null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const insertError = await persistLeadInSupabase(trimmedEmail);
    persistLeadInBrowser(trimmedEmail);
    triggerDownload(magnet.fileName, createDownloadContent(magnet, postTitle));
    setIsSubmitting(false);
    if (insertError) {
      setMessage("Checklist downloaded. Email capture is saved locally but Supabase insert failed.");
      return;
    }
    setMessage("Checklist downloaded. Your email was saved for follow-up.");
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[78ch] rounded-2xl border-2 border-ink/80 bg-[#fff8cf] p-4 shadow-hard sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a5a00]">Free Resource</p>
      <h2 className="mt-2 font-display text-2xl uppercase leading-[0.95] text-ink sm:text-3xl">{magnet.title}</h2>
      <p className="mt-2 text-sm text-ink/80">{magnet.description}</p>

      <ul className="mt-3 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
        {magnet.checklist.map((item) => (
          <li key={item} className="rounded-lg border border-[#d7bd72] bg-white px-3 py-2">
            {item}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email for the download"
          className="w-full rounded-lg border border-[#d7bd72] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-[#9a6b00] sm:flex-1"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full border-2 border-[#9a6b00] bg-[#c98f00] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#b07d00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Preparing..." : "Download Checklist"}
        </button>
      </form>

      {message ? <p className="mt-2 text-xs text-[#6d4f00]">{message}</p> : null}
    </section>
  );
}
