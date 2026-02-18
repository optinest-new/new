"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function parseInternalLinks(value: string): Array<{ url: string; topic: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, topic, extra] = line.split("|").map((part) => part.trim());
      return { url: url || "", topic: extra || topic || "" };
    })
    .filter((item) => item.url && item.topic);
}

export function SeoContentBriefGeneratorTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [fetchedCount, setFetchedCount] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [intent, setIntent] = useState<SearchIntent>("commercial");
  const [audience, setAudience] = useState("marketing managers and founders");
  const [location, setLocation] = useState("United States");
  const [offer, setOffer] = useState("technical SEO and web design retainers");
  const [targetUrl, setTargetUrl] = useState("");
  const [internalLinksInput, setInternalLinksInput] = useState("");

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
        setError(payload.error || "Failed to fetch URL data.");
        return;
      }

      const lines = (payload.candidateLines || [])
        .map((line) => {
          const [url, title, topics] = line.split("|").map((part) => part.trim());
          const normalizedTopic = topics || title || "related resource";
          return url ? `${url}|${normalizedTopic}` : "";
        })
        .filter(Boolean);

      setTargetUrl(payload.targetUrl || validatedUrl.toString());
      setKeyword(payload.suggestedKeyword || "");
      setInternalLinksInput(lines.join("\n"));
      setFetchedCount(lines.length);
      setIsFetched(true);
    } catch {
      setError("Could not fetch URL data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const keywordTitle = useMemo(() => toTitleCase(keyword), [keyword]);

  const titleSuggestions = useMemo(() => {
    const templates = [
      `${keywordTitle}: A Practical Guide for ${toTitleCase(audience)}`,
      `${keywordTitle} for Growth-Focused Brands in ${location}`,
      `How ${keywordTitle} Helps ${toTitleCase(audience)} Scale`
    ];

    return templates.map((template) => {
      const trimmed = template.replace(/\s+/g, " ").trim();
      return trimmed.length > 60 ? trimmed.slice(0, 59).trimEnd() : trimmed;
    });
  }, [audience, keywordTitle, location]);

  const metaDescription = useMemo(() => {
    const draft = `Learn how ${keyword} improves rankings, site performance, and lead quality for ${audience}. Use this framework to plan and execute with confidence.`;
    if (draft.length >= 150 && draft.length <= 160) {
      return draft;
    }
    if (draft.length > 160) {
      return draft.slice(0, 157).trimEnd() + "...";
    }
    return `${draft} Includes priorities, structure, and measurement steps.`;
  }, [audience, keyword]);

  const h2Sections = useMemo(
    () => [
      `Why ${keywordTitle} Matters for ${toTitleCase(audience)}`,
      `${keywordTitle} Audit Checklist and Priority Model`,
      `Common ${keywordTitle} Mistakes That Hurt Growth`,
      `${keywordTitle} Implementation Plan by Week`,
      `How to Measure ${keywordTitle} Performance`
    ],
    [audience, keywordTitle]
  );

  const faqItems = useMemo(
    () => [
      `How long does ${keyword} take to show measurable impact?`,
      `What should be fixed first in a ${keyword} project?`,
      `How does ${keyword} connect with conversion rate improvements?`,
      `What KPIs should teams track after publishing this page?`,
      `When should a brand hire an agency for ${keyword}?`
    ],
    [keyword]
  );

  const schemaSuggestions = useMemo(() => {
    if (intent === "informational") {
      return ["Article", "FAQPage", "BreadcrumbList"];
    }
    if (intent === "commercial") {
      return ["Service", "FAQPage", "BreadcrumbList"];
    }
    if (intent === "transactional") {
      return ["Service", "Organization", "FAQPage"];
    }
    return ["WebPage", "BreadcrumbList", "Organization"];
  }, [intent]);

  const internalLinkSuggestions = useMemo(() => {
    const candidates = parseInternalLinks(internalLinksInput);
    const keywordTokens = tokenize(keyword);

    return candidates
      .map((item) => {
        const tokens = tokenize(item.topic);
        let score = 0;
        for (const token of keywordTokens) {
          if (tokens.includes(token)) {
            score += 4;
          } else if (tokens.some((candidate) => candidate.includes(token) || token.includes(candidate))) {
            score += 2;
          }
        }
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({
        ...item,
        anchor: `${keyword} and ${item.topic}`.slice(0, 70)
      }));
  }, [internalLinksInput, keyword]);

  const briefOutput = useMemo(() => {
    if (!isFetched) {
      return "Fetch a URL first to generate a content brief.";
    }

    return [
      `Primary Keyword: ${keyword}`,
      `Search Intent: ${intent}`,
      `Audience: ${audience}`,
      `Primary Offer: ${offer}`,
      `Location: ${location}`,
      `Target URL: ${targetUrl}`,
      "",
      "Title Suggestions:",
      ...titleSuggestions.map((item) => `- ${item}`),
      "",
      `Meta Description: ${metaDescription}`,
      "",
      "Recommended Structure:",
      "- H1: Use one clear, keyword-forward heading.",
      ...h2Sections.map((item) => `- H2: ${item}`),
      "",
      "FAQ Candidates:",
      ...faqItems.map((item) => `- ${item}`),
      "",
      "Schema Suggestions:",
      ...schemaSuggestions.map((item) => `- ${item}`),
      "",
      "Internal Links (2 to 3 URLs):",
      ...internalLinkSuggestions.map((item) => `- ${item.url} | Anchor: ${item.anchor}`),
      "",
      "Word Count Target:",
      "- 1,500 to 1,900 words with short paragraphs and clear transitions.",
      "",
      "Measurement Plan:",
      "- Track impressions, CTR, average position, and conversion events at 30/60/90 days."
    ].join("\n");
  }, [
    audience,
    faqItems,
    h2Sections,
    intent,
    internalLinkSuggestions,
    isFetched,
    keyword,
    location,
    metaDescription,
    offer,
    schemaSuggestions,
    targetUrl,
    titleSuggestions
  ]);

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
        {isFetched ? <p className="mt-2 text-xs text-ink/70">Fetched {fetchedCount} internal resources for brief planning.</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Generate Brief</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Primary Keyword
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Search Intent
          <select
            value={intent}
            onChange={(event) => setIntent(event.target.value as SearchIntent)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          >
            <option value="informational">Informational</option>
            <option value="commercial">Commercial</option>
            <option value="transactional">Transactional</option>
            <option value="navigational">Navigational</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Audience
          <input
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Location
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Offer / Service
          <input
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Target URL
          <input
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
        Candidate Internal Links (URL | Topic per line)
        <textarea
          value={internalLinksInput}
          onChange={(event) => setInternalLinksInput(event.target.value)}
          disabled={!isFetched}
          className="h-36 rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-xs text-ink disabled:bg-fog"
        />
      </label>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase leading-none text-ink">Generated Content Brief</h2>
          <CopyButton text={briefOutput} label="Copy Brief" />
        </div>
        <textarea
          readOnly
          value={briefOutput}
          className="h-[28rem] w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
        />
      </div>
    </section>
  );
}
