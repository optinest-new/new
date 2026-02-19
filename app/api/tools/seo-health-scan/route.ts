import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

function parseHeadings(html: string): HeadingEntry[] {
  const matches = [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi)];
  return matches
    .map((match) => {
      const tag = (match[1] || "").toLowerCase();
      const level = Number.parseInt(tag.replace("h", ""), 10);
      if (![1, 2, 3].includes(level)) {
        return null;
      }

      return {
        level: level as 1 | 2 | 3,
        text: decodeHtmlEntities(stripTags(match[2] || ""))
      };
    })
    .filter((entry): entry is HeadingEntry => Boolean(entry));
}

function checkHeadingHierarchy(headings: HeadingEntry[]) {
  const hierarchyIssues: string[] = [];

  if (headings.length === 0) {
    return hierarchyIssues;
  }

  if (headings[0].level !== 1) {
    hierarchyIssues.push(`First heading is H${headings[0].level}; start with an H1.`);
  }

  for (let i = 1; i < headings.length; i += 1) {
    const previousLevel = headings[i - 1].level;
    const currentLevel = headings[i].level;
    if (currentLevel - previousLevel > 1) {
      hierarchyIssues.push(
        `Heading level skips from H${previousLevel} to H${currentLevel} around "${headings[i].text || `Heading ${i + 1}`}".`
      );
    }
  }

  return hierarchyIssues;
}

function parseImageAltAudit(html: string): ImageAltAudit {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0] || "");
  let imagesWithAlt = 0;
  let missingAlt = 0;
  let emptyAlt = 0;
  let descriptiveAlt = 0;
  const sampleMissingAltSources: string[] = [];

  for (const tag of imageTags) {
    const altQuoted = tag.match(/\balt\s*=\s*["']([\s\S]*?)["']/i);
    const altUnquoted = tag.match(/\balt\s*=\s*([^\s"'>]+)/i);
    const altRaw = altQuoted ? altQuoted[1] : altUnquoted ? altUnquoted[1] : null;

    if (altRaw === null) {
      missingAlt += 1;
      const srcQuoted = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      const srcUnquoted = tag.match(/\bsrc\s*=\s*([^\s"'>]+)/i);
      const src = srcQuoted ? srcQuoted[1] : srcUnquoted ? srcUnquoted[1] : "unknown-src";
      if (sampleMissingAltSources.length < 8) {
        sampleMissingAltSources.push(src);
      }
      continue;
    }

    imagesWithAlt += 1;
    const normalizedAlt = decodeHtmlEntities(altRaw).trim();
    if (!normalizedAlt) {
      emptyAlt += 1;
    } else {
      descriptiveAlt += 1;
    }
  }

  return {
    totalImages: imageTags.length,
    imagesWithAlt,
    missingAlt,
    emptyAlt,
    descriptiveAlt,
    sampleMissingAltSources
  };
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
    if (issue.message.includes("H2") || issue.message.includes("H3")) {
      tips.push("Use H2 and H3 headings to organize sections and make content scannable.");
    }
    if (issue.message.includes("Heading hierarchy")) {
      tips.push("Avoid skipping heading levels; move step-by-step from H1 to H2 to H3.");
    }
    if (issue.message.includes("alt")) {
      tips.push("Add descriptive alt text to meaningful images and keep decorative images with empty alt text only.");
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
    const headings = parseHeadings(html);
    const headingCounts = headings.reduce(
      (counts, heading) => {
        if (heading.level === 1) {
          counts.h1 += 1;
        } else if (heading.level === 2) {
          counts.h2 += 1;
        } else {
          counts.h3 += 1;
        }
        return counts;
      },
      { h1: 0, h2: 0, h3: 0 }
    );
    const headingHierarchyIssues = checkHeadingHierarchy(headings);
    const imageAltAudit = parseImageAltAudit(html);
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
    if (headingCounts.h2 === 0) {
      issues.push({ severity: "low", message: "No H2 headings detected." });
    }
    if (headingCounts.h3 > 0 && headingCounts.h2 === 0) {
      issues.push({ severity: "medium", message: "H3 headings are present without H2 headings." });
    }
    if (headingHierarchyIssues.length > 0) {
      issues.push({
        severity: "medium",
        message: "Heading hierarchy has skipped levels (for example H1 -> H3)."
      });
    }
    if (imageAltAudit.totalImages > 0 && imageAltAudit.missingAlt > 0) {
      issues.push({
        severity: "medium",
        message: `${imageAltAudit.missingAlt} image(s) are missing alt attributes.`
      });
    }
    if (imageAltAudit.totalImages > 0 && imageAltAudit.emptyAlt > 0) {
      issues.push({
        severity: "low",
        message: `${imageAltAudit.emptyAlt} image(s) have empty alt text.`
      });
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
      headingCounts,
      headingHierarchyIssues,
      headings,
      imageAltAudit,
      hasViewport,
      hasNoindex,
      issues,
      recommendations
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while scanning SEO health." }, { status: 500 });
  }
}
