"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type CandidatePage = {
  url: string;
  title: string;
  topics: string;
  score: number;
  anchors: string[];
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function parseCandidates(value: string): Array<{ url: string; title: string; topics: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, title, topics = ""] = line.split("|").map((part) => part.trim());
      return { url: url || "", title: title || "", topics };
    })
    .filter((candidate) => candidate.url && candidate.title);
}

function buildAnchors(primaryKeyword: string, sourceTitle: string, sourceTopics: string): string[] {
  const baseKeyword = primaryKeyword.trim();
  const anchors = [
    `learn more about ${baseKeyword}`,
    `complete guide to ${baseKeyword}`,
    `${baseKeyword} strategy for ${sourceTitle.toLowerCase()}`,
    `${baseKeyword} checklist`
  ];

  if (sourceTopics) {
    anchors.push(`${baseKeyword} for ${sourceTopics.split(",")[0]?.trim().toLowerCase() || "your niche"}`);
  }

  return unique(
    anchors
      .map((anchor) => anchor.replace(/\s+/g, " ").trim())
      .filter((anchor) => anchor.length >= 14)
  ).slice(0, 3);
}

export function InternalLinkOpportunityTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [fetchedCount, setFetchedCount] = useState(0);

  const [targetUrl, setTargetUrl] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [alreadyLinkedInput, setAlreadyLinkedInput] = useState("");

  const fetchFromUrl = async () => {
    setError("");
    setIsFetched(false);
    setFetchedCount(0);

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
      const response = await fetch("/api/tools/internal-link-fetch", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: validatedUrl.toString() })
      });

      const payload = (await response.json()) as {
        error?: string;
        targetUrl?: string;
        suggestedKeyword?: string;
        candidateLines?: string[];
      };

      if (!response.ok) {
        setError(payload.error || "Failed to fetch internal links.");
        return;
      }

      const lines = payload.candidateLines || [];
      setTargetUrl(payload.targetUrl || validatedUrl.toString());
      setPrimaryKeyword(payload.suggestedKeyword || "");
      setCandidateInput(lines.join("\n"));
      setAlreadyLinkedInput("");
      setFetchedCount(lines.length);
      setIsFetched(true);
    } catch {
      setError("Could not fetch internal links for this URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const opportunities = useMemo(() => {
    if (!isFetched) {
      return [] as CandidatePage[];
    }

    const keywordTokens = tokenize(primaryKeyword);
    const candidatePages = parseCandidates(candidateInput);
    const alreadyLinked = new Set(
      alreadyLinkedInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    );

    const scored = candidatePages
      .filter((candidate) => candidate.url !== targetUrl && !alreadyLinked.has(candidate.url))
      .map((candidate) => {
        const sourceTokens = tokenize(`${candidate.title} ${candidate.topics}`);
        let score = 0;

        for (const keyword of keywordTokens) {
          if (sourceTokens.includes(keyword)) {
            score += 4;
          } else if (sourceTokens.some((token) => token.includes(keyword) || keyword.includes(token))) {
            score += 2;
          }
        }

        if (candidate.title.toLowerCase().includes("guide")) {
          score += 1;
        }

        const anchors = buildAnchors(primaryKeyword, candidate.title, candidate.topics);
        return { ...candidate, score, anchors } as CandidatePage;
      })
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scored;
  }, [alreadyLinkedInput, candidateInput, isFetched, primaryKeyword, targetUrl]);

  const markdownOutput = useMemo(() => {
    if (!isFetched) {
      return "Fetch a URL first to generate internal link opportunities.";
    }
    if (opportunities.length === 0) {
      return "No opportunities found. Adjust keyword or candidate pages and try again.";
    }

    return opportunities
      .map((item, index) =>
        [
          `${index + 1}. Source URL: ${item.url}`,
          `   Suggested anchor: ${item.anchors[0] || `learn more about ${primaryKeyword}`}`,
          `   Target URL: ${targetUrl}`,
          "   Placement hint: Add within a paragraph that introduces the topic context."
        ].join("\n")
      )
      .join("\n\n");
  }, [isFetched, opportunities, primaryKeyword, targetUrl]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Fetch Source URL</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={fetchFromUrl}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Fetching..." : "Fetch URL"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
        {isFetched ? <p className="mt-2 text-xs text-ink/70">Fetched {fetchedCount} internal URL candidates.</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Review Opportunities</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Target URL
          <input
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Primary Keyword
          <input
            value={primaryKeyword}
            onChange={(event) => setPrimaryKeyword(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
        Candidate Pages (URL | Title | Topics per line)
        <textarea
          value={candidateInput}
          onChange={(event) => setCandidateInput(event.target.value)}
          disabled={!isFetched}
          className="h-48 rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-xs text-ink disabled:bg-fog"
        />
      </label>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
        Already Linked URLs (one per line, optional)
        <textarea
          value={alreadyLinkedInput}
          onChange={(event) => setAlreadyLinkedInput(event.target.value)}
          disabled={!isFetched}
          className="h-28 rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-xs text-ink disabled:bg-fog"
        />
      </label>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase leading-none text-ink">Recommended Internal Links</h2>
          <CopyButton text={markdownOutput} label="Copy Recommendations" />
        </div>
        {isFetched && opportunities.length > 0 ? (
          <div className="grid gap-3">
            {opportunities.map((item) => (
              <article key={item.url} className="rounded-lg border border-ink/25 bg-mist p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-ink/70">Source</p>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-ink/70">{item.url}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-ink/70">Suggested Anchor</p>
                <p className="text-sm font-bold text-ink">{item.anchors[0] || primaryKeyword}</p>
                <p className="mt-1 text-xs text-ink/70">Score: {item.score} · Limit one link per source URL.</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/80">
            {isFetched
              ? "No strong opportunities found yet. Adjust keyword or candidate pages."
              : "Fetch a URL first to generate internal link opportunities."}
          </p>
        )}
      </div>
    </section>
  );
}
