"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";
import { PortalNotificationCenter } from "@/components/portal-notification-center";

type LeadMagnetSubmission = {
  id: string;
  email: string;
  post_slug: string | null;
  post_title: string | null;
  magnet_title: string;
  page_path: string | null;
  created_at: string;
};

type LeadMagnetSubmissionExportRow = {
  email: string;
  created_at: string;
  magnet_title: string;
  post_title: string | null;
  post_slug: string | null;
  page_path: string | null;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeCsvValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const escaped = value.replace(/"/g, "\"\"");
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export default function LeadMagnetSubmissionsPage() {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingManagerStatus, setIsLoadingManagerStatus] = useState(false);
  const [isBootstrapManager, setIsBootstrapManager] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [submissions, setSubmissions] = useState<LeadMagnetSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [magnetFilter, setMagnetFilter] = useState("all");
  const hasResolvedManagerStatusRef = useRef(false);

  const magnetOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const entry of submissions) {
      unique.add(entry.magnet_title);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchDraft.trim().toLowerCase();
    return submissions.filter((entry) => {
      const haystack =
        `${entry.email} ${entry.magnet_title} ${entry.post_title ?? ""} ${entry.post_slug ?? ""} ${entry.page_path ?? ""}`
          .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesMagnet = magnetFilter === "all" || entry.magnet_title === magnetFilter;
      return matchesSearch && matchesMagnet;
    });
  }, [magnetFilter, searchDraft, submissions]);

  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setPortalError("");
        setPageMessage("");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      setIsBootstrapManager(false);
      setIsLoadingManagerStatus(false);
      hasResolvedManagerStatusRef.current = false;
      return;
    }

    let cancelled = false;
    if (!hasResolvedManagerStatusRef.current) {
      setIsLoadingManagerStatus(true);
    }

    supabase.rpc("is_bootstrap_manager").then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      setIsLoadingManagerStatus(false);
      hasResolvedManagerStatusRef.current = true;
      if (error) {
        setPortalError(error.message);
        return;
      }
      setIsBootstrapManager(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  const loadSubmissions = useCallback(async () => {
    if (!supabase || !session || !isBootstrapManager) {
      setSubmissions([]);
      return;
    }

    setIsLoadingSubmissions(true);
    setPortalError("");

    const { data, error } = await supabase
      .from("lead_magnet_submissions")
      .select("id,email,post_slug,post_title,magnet_title,page_path,created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    setIsLoadingSubmissions(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setSubmissions((data ?? []) as LeadMagnetSubmission[]);
  }, [isBootstrapManager, session, supabase]);

  useEffect(() => {
    if (!session || !isBootstrapManager) {
      setSubmissions([]);
      return;
    }

    void loadSubmissions();
  }, [isBootstrapManager, loadSubmissions, session]);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSubmissions([]);
    setPortalError("");
    setPageMessage("");
  }

  async function handleExportEmails() {
    if (!supabase || !session || !isBootstrapManager) {
      return;
    }

    setIsExportingEmails(true);
    setPortalError("");
    setPageMessage("");

    const batchSize = 1000;
    let from = 0;
    const rows: LeadMagnetSubmissionExportRow[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("lead_magnet_submissions")
        .select("email,created_at,magnet_title,post_title,post_slug,page_path")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        setIsExportingEmails(false);
        setPortalError(error.message);
        return;
      }

      const batch = (data ?? []) as LeadMagnetSubmissionExportRow[];
      if (batch.length === 0) {
        break;
      }

      rows.push(...batch);

      if (batch.length < batchSize) {
        break;
      }

      from += batchSize;
    }

    if (rows.length === 0) {
      setIsExportingEmails(false);
      setPageMessage("No captured emails found to export.");
      return;
    }

    const csvLines = [
      ["Email", "Captured At", "Magnet", "Post Title", "Post Slug", "Page Path"].join(","),
      ...rows.map((entry) =>
        [
          escapeCsvValue(entry.email),
          escapeCsvValue(entry.created_at),
          escapeCsvValue(entry.magnet_title),
          escapeCsvValue(entry.post_title),
          escapeCsvValue(entry.post_slug),
          escapeCsvValue(entry.page_path)
        ].join(",")
      )
    ];

    const csvContent = csvLines.join("\n");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `lead-magnet-emails-${timestamp}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportingEmails(false);
    setPageMessage(`Exported ${rows.length} submissions to CSV for Google Sheets.`);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">
            Lead Magnet Submissions
          </h1>
          <p className="mt-4 text-sm text-ink/85">
            Add your Supabase public keys to enable this workspace.
          </p>
        </section>
      </main>
    );
  }

  if (isLoadingSession) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Loading session...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">
            Lead Magnet Submissions
          </h1>
          <p className="mt-4 text-sm text-ink/85">Sign in to the portal to continue.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
          >
            Go To Portal Login
          </Link>
        </section>
      </main>
    );
  }

  if (isLoadingManagerStatus) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Checking manager access...</p>
        </section>
      </main>
    );
  }

  if (!isBootstrapManager) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">
            Lead Magnet Submissions
          </h1>
          <p className="mt-4 text-sm text-ink/85">Only the manager can access this page.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
          >
            Back To Portal
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">
              Lead Magnet Submissions
            </h1>
            <p className="mt-2 text-sm text-ink/80">
              Signed in as <span className="font-semibold">{session.user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PortalNotificationCenter session={session} />
            <Link
              href="/portal"
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
            >
              Back To Portal
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
            >
              Sign Out
            </button>
          </div>
        </div>

        {portalError ? (
          <p className="mt-4 rounded-lg border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
            {portalError}
          </p>
        ) : null}
        {pageMessage ? (
          <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
            {pageMessage}
          </p>
        ) : null}
      </header>

      <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/75">
            Captured checklist submissions from blog lead magnets.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleExportEmails()}
              disabled={isExportingEmails}
              className="inline-flex items-center rounded-full border-2 border-[#1d4ea5] bg-[#2967d8] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#2059bf] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isExportingEmails ? "Exporting..." : "Export Emails (CSV)"}
            </button>
            <button
              type="button"
              onClick={() => void loadSubmissions()}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_260px]">
          <input
            type="text"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search by email, magnet, post title, source path..."
            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
          />
          <select
            value={magnetFilter}
            onChange={(event) => setMagnetFilter(event.target.value)}
            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
          >
            <option value="all">All magnets</option>
            {magnetOptions.map((magnet) => (
              <option key={magnet} value={magnet}>
                {magnet}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#1d4ea5]">
            Total {submissions.length}
          </span>
          <span className="rounded-full bg-[#e9f9ec] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#1f5c28]">
            Filtered {filteredSubmissions.length}
          </span>
          <span className="rounded-full bg-[#fff8e8] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#805700]">
            Magnets {magnetOptions.length}
          </span>
        </div>

        {isLoadingSubmissions ? (
          <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            Loading captured leads...
          </p>
        ) : null}

        {!isLoadingSubmissions && filteredSubmissions.length === 0 ? (
          <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {submissions.length === 0
              ? "No lead magnet submissions yet."
              : "No submissions match your search/filter."}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {filteredSubmissions.map((entry) => (
            <article key={entry.id} className="rounded-lg border border-ink/20 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{entry.email}</p>
                <p className="text-[0.68rem] text-ink/60">{formatDateTime(entry.created_at)}</p>
              </div>
              <p className="mt-1 text-xs text-ink/75">
                Magnet: <span className="font-semibold text-ink">{entry.magnet_title}</span>
              </p>
              {entry.post_slug ? (
                <Link
                  href={`/blog/${entry.post_slug}`}
                  className="mt-1 inline-flex text-xs font-semibold text-[#1d4ea5] underline"
                >
                  {entry.post_title || entry.post_slug}
                </Link>
              ) : entry.post_title ? (
                <p className="mt-1 text-xs text-ink/70">{entry.post_title}</p>
              ) : null}
              {entry.page_path ? (
                <p className="mt-1 text-[0.68rem] text-ink/55">Source: {entry.page_path}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
