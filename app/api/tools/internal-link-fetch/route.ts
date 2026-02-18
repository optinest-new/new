import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleFromUrl(url: URL) {
  const slug = url.pathname
    .split("/")
    .filter(Boolean)
    .pop();
  if (!slug) {
    return "Homepage";
  }
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

function extractInternalLinks(html: string, baseUrl: URL) {
  const map = new Map<string, { title: string; topics: string }>();
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1]?.trim() || "";
    const anchorHtml = match[2] || "";
    if (!href) {
      continue;
    }

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }

    let resolved: URL;
    try {
      resolved = new URL(href, baseUrl.toString());
    } catch {
      continue;
    }

    if (!["http:", "https:"].includes(resolved.protocol)) {
      continue;
    }
    if (resolved.host !== baseUrl.host) {
      continue;
    }

    resolved.hash = "";
    const normalizedUrl = resolved.toString().replace(/\/$/, "");
    const baseNormalized = baseUrl.toString().replace(/\/$/, "");
    if (normalizedUrl === baseNormalized) {
      continue;
    }

    if (!map.has(normalizedUrl)) {
      const anchorText = cleanText(anchorHtml);
      map.set(normalizedUrl, {
        title: toTitleFromUrl(resolved),
        topics: anchorText || "internal link opportunity"
      });
    }
  }

  return Array.from(map.entries())
    .slice(0, 30)
    .map(([url, meta]) => `${url} | ${meta.title} | ${meta.topics}`);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const inputUrl = String(body.url || "").trim();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(inputUrl);
    } catch {
      return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "URL must start with http or https." }, { status: 400 });
    }

    if (isPrivateHost(parsedUrl)) {
      return NextResponse.json({ error: "Private or local URLs are not allowed." }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: {
        "user-agent": "OptinestInternalLinkFetcher/1.0 (+https://optinestdigital.com)"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (status ${response.status}).` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const finalUrl = new URL(response.url || parsedUrl.toString());
    const title = parseTitle(html);
    const suggestedKeyword = title
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const candidateLines = extractInternalLinks(html, finalUrl);

    return NextResponse.json({
      targetUrl: finalUrl.toString(),
      suggestedKeyword,
      candidateLines
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while fetching internal links." }, { status: 500 });
  }
}
