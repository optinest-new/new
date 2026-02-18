"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type SitemapAuditRow = {
  url: string;
  finalUrl: string;
  status: number;
  indexable: boolean;
  canonical: string;
  canonicalMatches: boolean;
  metaRobots: string;
  xRobotsTag: string;
  issueNotes: string[];
};

type SitemapValidationResult = {
  sitemapUrl: string;
  discoveredUrls: number;
  checkedUrls: number;
  maxUrlsChecked: number;
  indexableCount: number;
  nonIndexableCount: number;
  errorCount: number;
  rows: SitemapAuditRow[];
  error?: string;
};

function statusTone(status: number) {
  if (status >= 200 && status < 300) {
    return "text-[#0b6a40]";
  }
  if (status >= 300 && status < 400) {
    return "text-[#8a5a00]";
  }
  if (status >= 400 || status === 0) {
    return "text-[#a51f1f]";
  }
  return "text-ink";
}

export function SitemapIndexationValidatorTool() {
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [maxUrls, setMaxUrls] = useState("40");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SitemapValidationResult | null>(null);

  const validateSitemap = async () => {
    setError("");
    setResult(null);

    let validatedSitemapUrl: URL;
    try {
      validatedSitemapUrl = new URL(sitemapUrl.trim());
    } catch {
      setError("Please enter a valid sitemap URL, including https://");
      return;
    }

    if (!["http:", "https:"].includes(validatedSitemapUrl.protocol)) {
      setError("Sitemap URL must begin with http:// or https://");
      return;
    }

    const limit = Number.parseInt(maxUrls, 10);
    if (Number.isNaN(limit) || limit < 5 || limit > 200) {
      setError("Max URLs must be a number between 5 and 200.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tools/sitemap-indexation-validate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sitemapUrl: validatedSitemapUrl.toString(),
          maxUrls: limit
        })
      });

      const payload = (await response.json()) as SitemapValidationResult;
      if (!response.ok) {
        setError(payload.error || "Failed to validate sitemap.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Could not validate this sitemap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const recommendations = useMemo(() => {
    if (!result) {
      return ["Run a sitemap validation to see indexation recommendations."];
    }

    const notes: string[] = [];
    if (result.errorCount > 0) {
      notes.push("Fix URLs returning errors or failing fetch requests.");
    }
    if (result.nonIndexableCount > 0) {
      notes.push("Review noindex and canonical mismatch pages included in sitemap.");
    }
    if (result.indexableCount === result.checkedUrls && result.checkedUrls > 0) {
      notes.push("Checked URLs are indexable. Keep sitemap URLs current and canonical.");
    }
    if (result.discoveredUrls > result.checkedUrls) {
      notes.push("Increase max URL limit if you want a broader spot-check.");
    }

    return notes.length > 0 ? notes : ["No critical sitemap indexation issues found in this sample."];
  }, [result]);

  const reportOutput = useMemo(() => {
    if (!result) {
      return "No sitemap validation report available yet.";
    }

    const lines = [
      `Sitemap URL: ${result.sitemapUrl}`,
      `Discovered URLs: ${result.discoveredUrls}`,
      `Checked URLs: ${result.checkedUrls}`,
      `Indexable: ${result.indexableCount}`,
      `Non-Indexable: ${result.nonIndexableCount}`,
      `Errors: ${result.errorCount}`,
      ""
    ];

    lines.push("Rows:");
    for (const row of result.rows) {
      lines.push(
        `- ${row.status || "ERR"} | ${row.indexable ? "Indexable" : "Not indexable"} | ${row.url}`
      );
      if (row.issueNotes.length > 0) {
        lines.push(`  Issues: ${row.issueNotes.join(", ")}`);
      }
    }
    lines.push("");
    lines.push("Recommendations:");
    for (const note of recommendations) {
      lines.push(`- ${note}`);
    }

    return lines.join("\n");
  }, [recommendations, result]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">
          Step 1: Validate Sitemap
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <input
            value={sitemapUrl}
            onChange={(event) => setSitemapUrl(event.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <input
            value={maxUrls}
            onChange={(event) => setMaxUrls(event.target.value)}
            placeholder="40"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={validateSitemap}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Validating..." : "Validate"}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink/70">Max URLs: 5 to 200 per run.</p>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Indexation Results</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Discovered</p>
          <p className="text-sm font-bold text-ink">{result ? result.discoveredUrls : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Checked</p>
          <p className="text-sm font-bold text-ink">{result ? result.checkedUrls : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Indexable</p>
          <p className="text-sm font-bold text-[#0b6a40]">{result ? result.indexableCount : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Errors</p>
          <p className="text-sm font-bold text-[#a51f1f]">{result ? result.errorCount : "-"}</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Checked URLs</h3>
        {!result ? (
          <p className="mt-2 text-sm text-ink/80">Run validation to review URL-level results.</p>
        ) : result.rows.length === 0 ? (
          <p className="mt-2 text-sm text-ink/80">No URLs found in sitemap.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {result.rows.map((row) => (
              <article key={`${row.url}-${row.finalUrl}`} className="rounded-lg border border-ink/25 bg-mist p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-xs font-bold uppercase tracking-[0.1em] ${statusTone(row.status)}`}>
                    {row.status || "ERR"} · {row.indexable ? "Indexable" : "Not indexable"}
                  </p>
                  {row.issueNotes.length > 0 ? (
                    <span className="rounded-full bg-[#fff5cf] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#8a5a00]">
                      {row.issueNotes.length} issue{row.issueNotes.length > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 break-all text-xs text-ink/80">{row.url}</p>
                {row.finalUrl !== row.url ? (
                  <p className="mt-1 break-all text-xs text-ink/70">Final: {row.finalUrl}</p>
                ) : null}
                {row.issueNotes.length > 0 ? (
                  <p className="mt-1 text-xs text-[#8a5a00]">Issues: {row.issueNotes.join(", ")}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Recommendations</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/90">
          {recommendations.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-xl uppercase leading-none text-ink">Validation Report</h3>
          <CopyButton text={reportOutput} label="Copy Report" />
        </div>
        <textarea
          readOnly
          value={reportOutput}
          className="h-56 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
        />
      </div>
    </section>
  );
}
