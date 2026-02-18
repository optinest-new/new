import { NextResponse } from "next/server";

export const runtime = "nodejs";

type IssueSeverity = "high" | "medium" | "low";

type SeoHealthIssue = {
  severity: IssueSeverity;
  message: string;
};

function stripTags(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtmlEntities(stripTags(match?.[1] || ""));
}

function parseCanonical(html: string) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!match) {
    return "";
  }
  const href = match[0].match(/href=["']([^"']+)["']/i);
  return href?.[1]?.trim() || "";
}

function parseMetaContent(html: string, attrName: "name" | "property", attrValue: string) {
  const pattern = new RegExp(`<meta[^>]+${attrName}=["']${attrValue}["'][^>]*>`, "i");
  const match = html.match(pattern);
  if (!match) {
    return "";
  }
  const content = match[0].match(/content=["']([^"']*)["']/i);
  return decodeHtmlEntities((content?.[1] || "").trim());
}

function parseH1Texts(html: string) {
  const matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  return matches.map((match) => decodeHtmlEntities(stripTags(match[1] || ""))).filter(Boolean);
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

function buildRecommendations(issues: SeoHealthIssue[]) {
  const tips: string[] = [];

  for (const issue of issues) {
    if (issue.message.includes("noindex")) {
      tips.push("Remove noindex directives for pages that should appear in search results.");
    }
    if (issue.message.includes("Title tag")) {
      tips.push("Write a clear title tag between 30 and 60 characters.");
    }
    if (issue.message.includes("Meta description")) {
      tips.push("Add a concise meta description between 70 and 160 characters.");
    }
    if (issue.message.includes("canonical")) {
      tips.push("Set a self-referencing canonical URL for the primary version of the page.");
    }
    if (issue.message.includes("H1")) {
      tips.push("Keep one strong H1 that matches search intent and page topic.");
    }
    if (issue.message.includes("HTTP status")) {
      tips.push("Resolve server/client errors and ensure the page returns a 200 status.");
    }
  }

  if (tips.length === 0) {
    tips.push("Core SEO checks look healthy for this URL.");
  }

  return Array.from(new Set(tips));
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
        "user-agent": "OptinestSeoHealthScanner/1.0 (+https://optinestdigital.com)"
      },
      redirect: "follow"
    });

    const finalUrl = response.url || parsedUrl.toString();
    const status = response.status;
    const xRobotsTag = response.headers.get("x-robots-tag")?.trim() || "";
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      return NextResponse.json(
        {
          requestedUrl: parsedUrl.toString(),
          finalUrl,
          status,
          contentType,
          error: `Failed to fetch URL (status ${status}).`
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    const title = parseTitle(html);
    const description = parseMetaContent(html, "name", "description");
    const canonicalRaw = parseCanonical(html);
    const canonical = canonicalRaw ? new URL(canonicalRaw, finalUrl).toString() : "";
    const robotsMeta = parseMetaContent(html, "name", "robots");
    const googleBotMeta = parseMetaContent(html, "name", "googlebot");
    const h1Texts = parseH1Texts(html);
    const hasViewport = Boolean(parseMetaContent(html, "name", "viewport"));

    const robotsCombined = `${robotsMeta} ${googleBotMeta} ${xRobotsTag}`.toLowerCase();
    const hasNoindex = /(^|[,\s])noindex([,\s]|$)/.test(robotsCombined);
    const canonicalMatches = canonical
      ? normalizeUrlForCompare(canonical) === normalizeUrlForCompare(finalUrl)
      : false;

    const issues: SeoHealthIssue[] = [];
    if (status >= 400) {
      issues.push({ severity: "high", message: `HTTP status is ${status}.` });
    }
    if (!title) {
      issues.push({ severity: "high", message: "Title tag is missing." });
    } else if (title.length < 30 || title.length > 60) {
      issues.push({
        severity: "medium",
        message: `Title tag length (${title.length}) is outside the recommended 30-60 range.`
      });
    }
    if (!description) {
      issues.push({ severity: "medium", message: "Meta description is missing." });
    } else if (description.length < 70 || description.length > 160) {
      issues.push({
        severity: "low",
        message: `Meta description length (${description.length}) is outside the recommended 70-160 range.`
      });
    }
    if (!canonical) {
      issues.push({ severity: "low", message: "Canonical tag is missing." });
    } else if (!canonicalMatches) {
      issues.push({
        severity: "medium",
        message: "Canonical URL does not match the resolved URL."
      });
    }
    if (h1Texts.length === 0) {
      issues.push({ severity: "medium", message: "H1 heading is missing." });
    }
    if (h1Texts.length > 1) {
      issues.push({ severity: "low", message: "Multiple H1 headings detected." });
    }
    if (hasNoindex) {
      issues.push({ severity: "high", message: "A noindex directive was found." });
    }
    if (!hasViewport) {
      issues.push({ severity: "low", message: "Viewport meta tag is missing." });
    }

    const penalty = issues.reduce((score, issue) => {
      if (issue.severity === "high") {
        return score + 20;
      }
      if (issue.severity === "medium") {
        return score + 10;
      }
      return score + 5;
    }, 0);
    const healthScore = Math.max(0, 100 - penalty);
    const recommendations = buildRecommendations(issues);
    const isIndexable = status >= 200 && status < 300 && !hasNoindex;

    return NextResponse.json({
      requestedUrl: parsedUrl.toString(),
      finalUrl,
      status,
      contentType,
      healthScore,
      isIndexable,
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      canonical,
      canonicalMatches,
      robotsMeta,
      googleBotMeta,
      xRobotsTag,
      h1Texts,
      hasViewport,
      hasNoindex,
      issues,
      recommendations
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while scanning SEO health." }, { status: 500 });
  }
}
