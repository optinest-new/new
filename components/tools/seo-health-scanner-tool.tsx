"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type IssueSeverity = "high" | "medium" | "low";

type SeoHealthIssue = {
  severity: IssueSeverity;
  message: string;
};

type HeadingEntry = {
  level: 1 | 2 | 3;
  text: string;
};

type ImageAltAudit = {
  totalImages: number;
  imagesWithAlt: number;
  missingAlt: number;
  emptyAlt: number;
  descriptiveAlt: number;
  sampleMissingAltSources: string[];
};

type SeoHealthScanResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  contentType: string;
  healthScore: number;
  isIndexable: boolean;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  canonicalMatches: boolean;
  robotsMeta: string;
  googleBotMeta: string;
  xRobotsTag: string;
  h1Texts: string[];
  headingCounts: {
    h1: number;
    h2: number;
    h3: number;
  };
  headingHierarchyIssues: string[];
  headings: HeadingEntry[];
  imageAltAudit: ImageAltAudit;
  hasViewport: boolean;
  hasNoindex: boolean;
  issues: SeoHealthIssue[];
  recommendations: string[];
  error?: string;
};

function issueTone(severity: IssueSeverity) {
  if (severity === "high") {
    return "border-[#c63b3b] bg-[#fff0f0] text-[#7b1d1d]";
  }
  if (severity === "medium") {
    return "border-[#d7a019] bg-[#fff8e8] text-[#7e5400]";
  }
  return "border-[#3b82f6] bg-[#edf4ff] text-[#1d4ea5]";
}

function scoreTone(score: number) {
  if (score >= 85) {
    return "text-[#0b6a40]";
  }
  if (score >= 65) {
    return "text-[#8a5a00]";
  }
  return "text-[#a51f1f]";
}

export function SeoHealthScannerTool() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SeoHealthScanResult | null>(null);

  const scanUrl = async () => {
    setError("");
    setResult(null);

    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url.trim());
    } catch {
      setError("Please enter a valid URL, including https://");
      return;
    }

    if (!["http:", "https:"].includes(validatedUrl.protocol)) {
      setError("URL must begin with http:// or https://");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tools/seo-health-scan", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: validatedUrl.toString() })
      });

      const payload = (await response.json()) as SeoHealthScanResult;
      if (!response.ok) {
        setError(payload.error || "Failed to scan URL.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Could not scan this URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reportOutput = useMemo(() => {
    if (!result) {
      return "No SEO health report available yet.";
    }

    const lines = [
      `Requested URL: ${result.requestedUrl}`,
      `Final URL: ${result.finalUrl}`,
      `Status: ${result.status}`,
      `Health Score: ${result.healthScore}`,
      `Indexable: ${result.isIndexable ? "Yes" : "No"}`,
      `Title Length: ${result.titleLength}`,
      `Meta Description Length: ${result.descriptionLength}`,
      `Canonical: ${result.canonical || "Not set"}`,
      `Canonical Matches Final URL: ${result.canonicalMatches ? "Yes" : "No"}`,
      `Noindex Detected: ${result.hasNoindex ? "Yes" : "No"}`,
      `H1 / H2 / H3: ${result.headingCounts.h1} / ${result.headingCounts.h2} / ${result.headingCounts.h3}`,
      `Heading Hierarchy Issues: ${result.headingHierarchyIssues.length}`,
      `Images: ${result.imageAltAudit.totalImages}`,
      `Images Missing Alt: ${result.imageAltAudit.missingAlt}`,
      `Images With Empty Alt: ${result.imageAltAudit.emptyAlt}`,
      `Images With Descriptive Alt: ${result.imageAltAudit.descriptiveAlt}`,
      ""
    ];

    if (result.headingHierarchyIssues.length > 0) {
      lines.push("Heading Hierarchy Details:");
      for (const hierarchyIssue of result.headingHierarchyIssues) {
        lines.push(`- ${hierarchyIssue}`);
      }
      lines.push("");
    }

    if (result.imageAltAudit.sampleMissingAltSources.length > 0) {
      lines.push("Sample Images Missing Alt:");
      for (const source of result.imageAltAudit.sampleMissingAltSources) {
        lines.push(`- ${source}`);
      }
      lines.push("");
    }

    lines.push("Issues:");
    if (result.issues.length === 0) {
      lines.push("- No major issues detected.");
    } else {
      for (const issue of result.issues) {
        lines.push(`- [${issue.severity.toUpperCase()}] ${issue.message}`);
      }
    }

    lines.push("");
    lines.push("Recommendations:");
    for (const recommendation of result.recommendations) {
      lines.push(`- ${recommendation}`);
    }

    return lines.join("\n");
  }, [result]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Scan URL</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={scanUrl}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Scanning..." : "Scan SEO Health"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Review Results</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Health Score</p>
          <p className={`text-sm font-bold ${result ? scoreTone(result.healthScore) : "text-ink"}`}>
            {result ? `${result.healthScore}/100` : "-"}
          </p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">HTTP Status</p>
          <p className="text-sm font-bold text-ink">{result ? result.status : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Indexable</p>
          <p className="text-sm font-bold text-ink">{result ? (result.isIndexable ? "Yes" : "No") : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">H1 Count</p>
          <p className="text-sm font-bold text-ink">{result ? result.h1Texts.length : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">H2 Count</p>
          <p className="text-sm font-bold text-ink">{result ? result.headingCounts.h2 : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">H3 Count</p>
          <p className="text-sm font-bold text-ink">{result ? result.headingCounts.h3 : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Images Missing Alt</p>
          <p className="text-sm font-bold text-ink">{result ? result.imageAltAudit.missingAlt : "-"}</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Core SEO Signals</h3>
        {result ? (
          <div className="mt-3 grid gap-2 text-sm text-ink/90">
            <p className="break-all">
              <span className="font-semibold">Final URL:</span> {result.finalUrl}
            </p>
            <p>
              <span className="font-semibold">Title:</span> {result.title || "Missing"} ({result.titleLength})
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {result.description ? `${result.description} (${result.descriptionLength})` : "Missing"}
            </p>
            <p className="break-all">
              <span className="font-semibold">Canonical:</span> {result.canonical || "Missing"}
            </p>
            <p>
              <span className="font-semibold">Meta Robots:</span> {result.robotsMeta || "Not set"}
            </p>
            <p>
              <span className="font-semibold">X-Robots-Tag:</span> {result.xRobotsTag || "Not set"}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/80">Scan a URL to review key SEO signals.</p>
        )}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Issues & Recommendations</h3>
        {result ? (
          <>
            <div className="mt-3 space-y-2">
              {result.issues.length === 0 ? (
                <p className="text-sm text-ink/85">No major issues detected.</p>
              ) : (
                result.issues.map((issue, index) => (
                  <article
                    key={`${issue.message}-${index}`}
                    className={`rounded-md border px-3 py-2 text-sm ${issueTone(issue.severity)}`}
                  >
                    <p className="font-semibold uppercase tracking-[0.08em]">{issue.severity}</p>
                    <p className="mt-1">{issue.message}</p>
                  </article>
                ))
              )}
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink/90">
              {result.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink/80">Recommendations appear after running a scan.</p>
        )}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Heading &amp; Image Alt Checks</h3>
        {result ? (
          <>
            <div className="mt-3 grid gap-2 text-sm text-ink/90 sm:grid-cols-2">
              <p>
                <span className="font-semibold">Headings:</span> H1 {result.headingCounts.h1} · H2{" "}
                {result.headingCounts.h2} · H3 {result.headingCounts.h3}
              </p>
              <p>
                <span className="font-semibold">Image Alt Coverage:</span> {result.imageAltAudit.imagesWithAlt}/
                {result.imageAltAudit.totalImages}
              </p>
              <p>
                <span className="font-semibold">Missing Alt:</span> {result.imageAltAudit.missingAlt}
              </p>
              <p>
                <span className="font-semibold">Empty Alt:</span> {result.imageAltAudit.emptyAlt}
              </p>
            </div>

            {result.headingHierarchyIssues.length > 0 ? (
              <div className="mt-3 rounded-md border border-[#d7a019] bg-[#fff8e8] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7e5400]">
                  Heading Hierarchy Issues
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-[#7e5400]">
                  {result.headingHierarchyIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#0b6a40]">Heading hierarchy looks clean.</p>
            )}

            {result.headings.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/65">
                  Heading Outline (H1-H3)
                </p>
                <ul className="mt-2 space-y-1">
                  {result.headings.slice(0, 14).map((heading, index) => (
                    <li
                      key={`${heading.level}-${heading.text}-${index}`}
                      className="rounded-md border border-ink/15 bg-mist px-2.5 py-1.5 text-xs text-ink/85"
                    >
                      <span className="font-semibold">H{heading.level}</span>:{" "}
                      {heading.text || `Heading ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.imageAltAudit.sampleMissingAltSources.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/65">
                  Sample Images Missing Alt
                </p>
                <ul className="mt-2 space-y-1">
                  {result.imageAltAudit.sampleMissingAltSources.map((source) => (
                    <li key={source} className="rounded-md border border-ink/15 bg-mist px-2.5 py-1.5 text-xs text-ink/85 break-all">
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-ink/80">
            Run a scan to review H1/H2/H3 structure, hierarchy flow, and image alt coverage.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-xl uppercase leading-none text-ink">Report Output</h3>
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
