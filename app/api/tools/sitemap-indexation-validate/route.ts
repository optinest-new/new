import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_URLS_CAP = 200;
const MAX_SITEMAPS_TO_FOLLOW = 12;
const FETCH_CONCURRENCY = 5;

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

function parseMetaContent(html: string, attrName: "name" | "property", attrValue: string) {
  const pattern = new RegExp(`<meta[^>]+${attrName}=["']${attrValue}["'][^>]*>`, "i");
  const match = html.match(pattern);
  if (!match) {
    return "";
  }
  const content = match[0].match(/content=["']([^"']*)["']/i);
  return content?.[1]?.trim() || "";
}

function parseCanonical(html: string) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!match) {
    return "";
  }
  const href = match[0].match(/href=["']([^"']+)["']/i);
  return href?.[1]?.trim() || "";
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseLocs(xml: string) {
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)]
    .map((match) => decodeXmlEntities((match[1] || "").trim()))
    .filter(Boolean);
}

function normalizeUrlForCompare(input: string) {
  try {
    const url = new URL(input);
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString();
  } catch {
    return input.trim();
  }
}

function isPrivateHost(url: URL) {
  const host = url.hostname.toLowerCase();

  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127) {
      return true;
    }
    if (a === 192 && b === 168) {
      return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }
    if (a === 169 && b === 254) {
      return true;
    }
  }

  return false;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "user-agent": "OptinestSitemapValidator/1.0 (+https://optinestdigital.com)"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (status ${response.status}).`);
  }

  return {
    text: await response.text(),
    finalUrl: response.url || url
  };
}

async function collectUrlsFromSitemap(startSitemapUrl: string) {
  const sitemapQueue: string[] = [startSitemapUrl];
  const visitedSitemaps = new Set<string>();
  const foundUrls: string[] = [];

  while (sitemapQueue.length > 0 && visitedSitemaps.size < MAX_SITEMAPS_TO_FOLLOW) {
    const current = sitemapQueue.shift();
    if (!current || visitedSitemaps.has(current)) {
      continue;
    }
    visitedSitemaps.add(current);

    const { text, finalUrl } = await fetchText(current);
    const isIndex = /<sitemapindex[\s>]/i.test(text);
    const locs = parseLocs(text);

    if (isIndex) {
      for (const loc of locs) {
        try {
          const resolved = new URL(loc, finalUrl).toString();
          if (!visitedSitemaps.has(resolved) && sitemapQueue.length < MAX_SITEMAPS_TO_FOLLOW) {
            sitemapQueue.push(resolved);
          }
        } catch {
          continue;
        }
      }
    } else {
      for (const loc of locs) {
        try {
          const resolved = new URL(loc, finalUrl).toString();
          foundUrls.push(resolved);
        } catch {
          continue;
        }
      }
    }
  }

  return Array.from(new Set(foundUrls));
}

async function auditUrl(url: string): Promise<SitemapAuditRow> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "user-agent": "OptinestSitemapValidator/1.0 (+https://optinestdigital.com)"
    },
    redirect: "follow"
  });

  const finalUrl = response.url || url;
  const status = response.status;
  const xRobotsTag = response.headers.get("x-robots-tag")?.trim() || "";
  const contentType = response.headers.get("content-type") || "";
  const issueNotes: string[] = [];

  if (status >= 400) {
    issueNotes.push(`HTTP ${status}`);
  }

  let canonical = "";
  let canonicalMatches = true;
  let metaRobots = "";
  let hasNoindex = false;

  if (contentType.toLowerCase().includes("text/html")) {
    const html = await response.text();
    const canonicalRaw = parseCanonical(html);
    canonical = canonicalRaw ? new URL(canonicalRaw, finalUrl).toString() : "";
    canonicalMatches = canonical
      ? normalizeUrlForCompare(canonical) === normalizeUrlForCompare(finalUrl)
      : true;
    metaRobots = parseMetaContent(html, "name", "robots");
    const robotsCombined = `${metaRobots} ${xRobotsTag}`.toLowerCase();
    hasNoindex = /(^|[,\s])noindex([,\s]|$)/.test(robotsCombined);
  } else {
    issueNotes.push("Non-HTML response");
  }

  if (canonical && !canonicalMatches) {
    issueNotes.push("Canonical mismatch");
  }
  if (hasNoindex) {
    issueNotes.push("Noindex directive");
  }

  const indexable = status >= 200 && status < 300 && !hasNoindex;

  return {
    url,
    finalUrl,
    status,
    indexable,
    canonical,
    canonicalMatches,
    metaRobots,
    xRobotsTag,
    issueNotes
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sitemapUrl?: string; maxUrls?: number };
    const rawSitemapUrl = String(body.sitemapUrl || "").trim();

    if (!rawSitemapUrl) {
      return NextResponse.json({ error: "Sitemap URL is required." }, { status: 400 });
    }

    let sitemapUrl: URL;
    try {
      sitemapUrl = new URL(rawSitemapUrl);
    } catch {
      return NextResponse.json({ error: "Please provide a valid sitemap URL." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(sitemapUrl.protocol)) {
      return NextResponse.json({ error: "Sitemap URL must start with http or https." }, { status: 400 });
    }

    if (isPrivateHost(sitemapUrl)) {
      return NextResponse.json({ error: "Private or local URLs are not allowed." }, { status: 400 });
    }

    const requestedMax = Number.isFinite(body.maxUrls) ? Number(body.maxUrls) : 40;
    const maxUrls = Math.max(5, Math.min(MAX_URLS_CAP, Math.floor(requestedMax)));
    const collectedUrls = await collectUrlsFromSitemap(sitemapUrl.toString());
    const limitedUrls = collectedUrls.slice(0, maxUrls);

    const rows: SitemapAuditRow[] = [];
    for (let index = 0; index < limitedUrls.length; index += FETCH_CONCURRENCY) {
      const chunk = limitedUrls.slice(index, index + FETCH_CONCURRENCY);
      const chunkResults = await Promise.all(
        chunk.map(async (url) => {
          try {
            return await auditUrl(url);
          } catch {
            return {
              url,
              finalUrl: url,
              status: 0,
              indexable: false,
              canonical: "",
              canonicalMatches: true,
              metaRobots: "",
              xRobotsTag: "",
              issueNotes: ["Request failed"]
            } as SitemapAuditRow;
          }
        })
      );
      rows.push(...chunkResults);
    }

    const indexableCount = rows.filter((entry) => entry.indexable).length;
    const nonIndexableCount = rows.length - indexableCount;
    const errorCount = rows.filter((entry) => entry.status === 0 || entry.status >= 400).length;

    return NextResponse.json({
      sitemapUrl: sitemapUrl.toString(),
      discoveredUrls: collectedUrls.length,
      checkedUrls: rows.length,
      maxUrlsChecked: maxUrls,
      indexableCount,
      nonIndexableCount,
      errorCount,
      rows
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while validating sitemap indexation." }, { status: 500 });
  }
}
