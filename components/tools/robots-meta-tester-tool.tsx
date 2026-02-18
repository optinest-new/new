"use client";

import { useMemo, useState } from "react";

type RobotsGroup = {
  userAgents: string[];
  disallow: string[];
  allow: string[];
};

function parseRobotsTxt(content: string): RobotsGroup[] {
  const lines = content.split("\n").map((line) => line.trim());
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (!line) {
      continue;
    }

    const [directiveRaw, ...valueParts] = line.split(":");
    if (!directiveRaw || valueParts.length === 0) {
      continue;
    }

    const directive = directiveRaw.trim().toLowerCase();
    const value = valueParts.join(":").trim();

    if (directive === "user-agent") {
      if (!current || current.disallow.length > 0 || current.allow.length > 0) {
        current = { userAgents: [], disallow: [], allow: [] };
        groups.push(current);
      }
      current.userAgents.push(value.toLowerCase());
      continue;
    }

    if (!current) {
      continue;
    }

    if (directive === "disallow") {
      current.disallow.push(value);
    } else if (directive === "allow") {
      current.allow.push(value);
    }
  }

  return groups;
}

function ruleMatchLength(path: string, rule: string): number {
  if (!rule) {
    return -1;
  }
  if (rule === "/") {
    return 1;
  }
  return path.startsWith(rule) ? rule.length : -1;
}

function evaluateRobots(path: string, userAgent: string, robotsTxt: string) {
  const groups = parseRobotsTxt(robotsTxt);
  const ua = userAgent.toLowerCase();
  const exact = groups.filter((group) => group.userAgents.includes(ua));
  const wildcard = groups.filter((group) => group.userAgents.includes("*"));
  const activeGroups = exact.length > 0 ? exact : wildcard;

  let bestAllow = -1;
  let bestDisallow = -1;

  for (const group of activeGroups) {
    for (const allowRule of group.allow) {
      bestAllow = Math.max(bestAllow, ruleMatchLength(path, allowRule));
    }
    for (const disallowRule of group.disallow) {
      bestDisallow = Math.max(bestDisallow, ruleMatchLength(path, disallowRule));
    }
  }

  const blocked = bestDisallow > bestAllow && bestDisallow > -1;
  return {
    blocked,
    bestAllow,
    bestDisallow,
    matchedGroupType: exact.length > 0 ? "exact" : wildcard.length > 0 ? "wildcard" : "none"
  };
}

function parseDirectives(value: string): string[] {
  return value
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

export function RobotsMetaTesterTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [fetchedUrl, setFetchedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  const [robotsTxt, setRobotsTxt] = useState("");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [path, setPath] = useState("");
  const [metaRobots, setMetaRobots] = useState("");
  const [xRobotsTag, setXRobotsTag] = useState("");

  const fetchRobotsAndMeta = async () => {
    setError("");
    setIsFetched(false);

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
      const response = await fetch("/api/tools/robots-meta-fetch", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: validatedUrl.toString() })
      });

      const payload = (await response.json()) as {
        error?: string;
        url?: string;
        pathToTest?: string;
        robotsTxt?: string;
        metaRobots?: string;
        xRobotsTag?: string;
      };

      if (!response.ok) {
        setError(payload.error || "Failed to fetch robots and meta data.");
        return;
      }

      setFetchedUrl(payload.url || validatedUrl.toString());
      setPath(payload.pathToTest || "/");
      setRobotsTxt(payload.robotsTxt || "User-agent: *\nAllow: /");
      setMetaRobots(payload.metaRobots || "index, follow");
      setXRobotsTag(payload.xRobotsTag || "");
      setIsFetched(true);
    } catch {
      setError("Could not fetch data for this URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const crawlResult = useMemo(() => {
    if (!isFetched) {
      return {
        blocked: false,
        bestAllow: -1,
        bestDisallow: -1,
        matchedGroupType: "none"
      };
    }
    return evaluateRobots(path.trim() || "/", userAgent, robotsTxt);
  }, [isFetched, path, robotsTxt, userAgent]);

  const metaDirectives = useMemo(() => parseDirectives(metaRobots), [metaRobots]);
  const xRobotsDirectives = useMemo(() => parseDirectives(xRobotsTag), [xRobotsTag]);
  const allIndexDirectives = [...metaDirectives, ...xRobotsDirectives];

  const hasNoindex = allIndexDirectives.includes("noindex");
  const hasNofollow = allIndexDirectives.includes("nofollow");
  const canCrawl = !crawlResult.blocked;

  const status = useMemo(() => {
    if (!isFetched) {
      return {
        label: "Fetch a URL to begin",
        message: "Enter a page URL and click fetch to pull robots.txt, meta robots, and X-Robots-Tag values.",
        tone: "text-ink/80"
      };
    }

    if (!canCrawl && hasNoindex) {
      return {
        label: "Conflict: blocked + noindex",
        message: "Robots.txt blocks crawling, so search engines may not see your noindex directive.",
        tone: "text-red-700"
      };
    }

    if (!canCrawl) {
      return {
        label: "Crawl Blocked",
        message: "Path is disallowed for this user-agent. Ranking signals may be limited due to crawl restrictions.",
        tone: "text-orange-700"
      };
    }

    if (hasNoindex) {
      return {
        label: "Noindex Applied",
        message: "Page can be crawled but is set to noindex, so it should not appear in search results.",
        tone: "text-orange-700"
      };
    }

    return {
      label: "Indexable and Crawlable",
      message: "No blocking conflict detected for this user-agent and directive set.",
      tone: "text-green-700"
    };
  }, [canCrawl, hasNoindex, isFetched]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Fetch URL Data</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={fetchRobotsAndMeta}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Fetching..." : "Fetch URL"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
        {isFetched ? <p className="mt-2 text-xs text-ink/70">Fetched: {fetchedUrl}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Review and Test</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          User-Agent
          <input
            value={userAgent}
            onChange={(event) => setUserAgent(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          URL Path to Test
          <input
            value={path}
            onChange={(event) => setPath(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
        robots.txt Content
        <textarea
          value={robotsTxt}
          onChange={(event) => setRobotsTxt(event.target.value)}
          disabled={!isFetched}
          className="h-56 rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-sm text-ink disabled:bg-fog"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Meta Robots
          <input
            value={metaRobots}
            onChange={(event) => setMetaRobots(event.target.value)}
            placeholder="index, follow"
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          X-Robots-Tag (Optional)
          <input
            value={xRobotsTag}
            onChange={(event) => setXRobotsTag(event.target.value)}
            placeholder="noindex, nofollow"
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Crawl Access</p>
          <p className="text-sm font-bold text-ink">{isFetched ? (canCrawl ? "Allowed" : "Blocked") : "-"}</p>
        </div>
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Matched Group</p>
          <p className="text-sm font-bold text-ink">{isFetched ? crawlResult.matchedGroupType : "-"}</p>
        </div>
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Meta Index</p>
          <p className="text-sm font-bold text-ink">{isFetched ? (hasNoindex ? "Noindex" : "Index") : "-"}</p>
        </div>
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Meta Follow</p>
          <p className="text-sm font-bold text-ink">{isFetched ? (hasNofollow ? "Nofollow" : "Follow") : "-"}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h2 className="font-display text-xl uppercase leading-none text-ink">{status.label}</h2>
        <p className={`mt-2 text-sm font-semibold ${status.tone}`}>{status.message}</p>
        {isFetched ? (
          <p className="mt-3 text-xs text-ink/70">
            Best Allow Match Length: {crawlResult.bestAllow} · Best Disallow Match Length: {crawlResult.bestDisallow}
          </p>
        ) : null}
      </div>
    </section>
  );
}
