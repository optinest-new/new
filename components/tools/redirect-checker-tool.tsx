"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type RedirectHop = {
  url: string;
  status: number;
  location: string;
  nextUrl: string;
};

type RedirectResult = {
  requestedUrl: string;
  finalUrl: string;
  finalStatus: number;
  hops: RedirectHop[];
  hopCount: number;
  loopDetected: boolean;
  exceededHops: boolean;
  has301: boolean;
  hasTemporary: boolean;
};

function statusTone(status: number) {
  if (status >= 200 && status < 300) {
    return "text-green-700";
  }
  if (status >= 300 && status < 400) {
    return "text-orange-700";
  }
  if (status >= 400) {
    return "text-red-700";
  }
  return "text-ink";
}

export function RedirectCheckerTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RedirectResult | null>(null);

  const checkRedirects = async () => {
    setError("");
    setResult(null);

    let validatedUrl: URL;
    try {
      validatedUrl = new URL(sourceUrl.trim());
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
      const response = await fetch("/api/tools/redirect-check", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: validatedUrl.toString() })
      });

      const payload = (await response.json()) as RedirectResult & { error?: string };
      if (!response.ok) {
        setError(payload.error || "Failed to check redirects.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Could not check redirects for this URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const recommendations = useMemo(() => {
    if (!result) {
      return ["Fetch a URL first to review redirect status and recommendations."];
    }

    const notes: string[] = [];

    if (result.loopDetected) {
      notes.push("Redirect loop detected. Remove circular rules immediately.");
    }
    if (result.exceededHops) {
      notes.push("Redirect chain reached the maximum hop limit. Reduce intermediate redirects.");
    }
    if (result.hopCount > 1) {
      notes.push("Multiple hops found. Aim for a single redirect hop to the final destination.");
    }
    if (result.hasTemporary) {
      notes.push("Temporary redirects (302/307) detected. Use 301 for permanent URL changes.");
    }
    if (!result.has301 && result.hopCount > 0) {
      notes.push("No 301 redirect found in chain. Confirm redirect type matches migration intent.");
    }
    if (result.hopCount === 0 && result.finalStatus >= 200 && result.finalStatus < 300) {
      notes.push("No redirect found. URL resolves directly.");
    }
    if (result.finalStatus >= 400) {
      notes.push("Final URL returns an error status. Fix destination page or redirect target.");
    }

    return notes.length > 0 ? notes : ["Redirect setup looks clean based on this check."];
  }, [result]);

  const reportOutput = useMemo(() => {
    if (!result) {
      return "No redirect report available yet.";
    }

    const lines = [
      `Requested URL: ${result.requestedUrl}`,
      `Final URL: ${result.finalUrl}`,
      `Final Status: ${result.finalStatus}`,
      `Redirect Hops: ${result.hopCount}`,
      `301 Detected: ${result.has301 ? "Yes" : "No"}`,
      `Temporary Redirects Detected: ${result.hasTemporary ? "Yes" : "No"}`,
      `Loop Detected: ${result.loopDetected ? "Yes" : "No"}`,
      ""
    ];

    if (result.hops.length > 0) {
      lines.push("Redirect Chain:");
      result.hops.forEach((hop, index) => {
        lines.push(`${index + 1}. ${hop.status} | ${hop.url} -> ${hop.nextUrl}`);
      });
      lines.push("");
    }

    lines.push("Recommendations:");
    recommendations.forEach((note) => lines.push(`- ${note}`));
    return lines.join("\n");
  }, [recommendations, result]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Check URL Redirects</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com/old-page"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={checkRedirects}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Checking..." : "Check Redirects"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Review Report</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Final Status</p>
          <p className={`text-sm font-bold ${result ? statusTone(result.finalStatus) : "text-ink"}`}>
            {result ? result.finalStatus : "-"}
          </p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Redirect Hops</p>
          <p className="text-sm font-bold text-ink">{result ? result.hopCount : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Has 301</p>
          <p className="text-sm font-bold text-ink">{result ? (result.has301 ? "Yes" : "No") : "-"}</p>
        </article>
        <article className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Temporary Redirects</p>
          <p className="text-sm font-bold text-ink">{result ? (result.hasTemporary ? "Yes" : "No") : "-"}</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Redirect Chain</h3>
        {result && result.hops.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {result.hops.map((hop, index) => (
              <article key={`${hop.url}-${index}`} className="rounded-lg border border-ink/25 bg-mist p-3">
                <p className={`text-xs font-bold uppercase tracking-[0.1em] ${statusTone(hop.status)}`}>Hop {index + 1} · {hop.status}</p>
                <p className="mt-1 text-xs text-ink/80 break-all">{hop.url}</p>
                <p className="mt-1 text-xs text-ink/80 break-all">Location: {hop.location}</p>
                <p className="mt-1 text-xs font-semibold text-ink break-all">Next: {hop.nextUrl}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/80">{result ? "No redirect hops found for this URL." : "Check a URL to view chain details."}</p>
        )}

        {result ? (
          <p className="mt-3 text-xs text-ink/70 break-all">
            Final URL: {result.finalUrl}
          </p>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">SEO Recommendations</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/90">
          {recommendations.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-xl uppercase leading-none text-ink">Redirect Report Output</h3>
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
