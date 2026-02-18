import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ParsedMeta = {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string;
  author: string;
  viewport: string;
  themeColor: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: string;
  ogSiteName: string;
  ogLocale: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  robots: string;
  googleBot: string;
};

function parseTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
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
  const pattern = new RegExp(
    `<meta[^>]+${attrName}=["']${attrValue}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) {
    return "";
  }
  const content = match[0].match(/content=["']([^"']*)["']/i);
  return content?.[1]?.trim() || "";
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

function parseMetadata(html: string, requestedUrl: string): ParsedMeta {
  const title = parseTitle(html);
  const description =
    parseMetaContent(html, "name", "description") ||
    parseMetaContent(html, "property", "og:description");
  const canonicalUrl = parseCanonical(html) || requestedUrl;
  const keywords = parseMetaContent(html, "name", "keywords");
  const author = parseMetaContent(html, "name", "author");
  const viewport =
    parseMetaContent(html, "name", "viewport") || "width=device-width, initial-scale=1";
  const themeColor = parseMetaContent(html, "name", "theme-color");
  const robots = parseMetaContent(html, "name", "robots") || "index, follow";
  const googleBot = parseMetaContent(html, "name", "googlebot");

  const ogType = parseMetaContent(html, "property", "og:type") || "website";
  const ogTitle = parseMetaContent(html, "property", "og:title") || title;
  const ogDescription = parseMetaContent(html, "property", "og:description") || description;
  const ogUrl = parseMetaContent(html, "property", "og:url") || canonicalUrl;
  const ogSiteName = parseMetaContent(html, "property", "og:site_name");
  const ogLocale = parseMetaContent(html, "property", "og:locale") || "en_US";
  const ogImage = parseMetaContent(html, "property", "og:image");
  const ogImageAlt = parseMetaContent(html, "property", "og:image:alt");

  const twitterCard = parseMetaContent(html, "name", "twitter:card") || "summary_large_image";
  const twitterSite = parseMetaContent(html, "name", "twitter:site");
  const twitterCreator = parseMetaContent(html, "name", "twitter:creator");
  const twitterTitle = parseMetaContent(html, "name", "twitter:title") || ogTitle || title;
  const twitterDescription =
    parseMetaContent(html, "name", "twitter:description") || ogDescription || description;
  const twitterImage = parseMetaContent(html, "name", "twitter:image") || ogImage;
  const twitterImageAlt = parseMetaContent(html, "name", "twitter:image:alt") || ogImageAlt;

  return {
    title,
    description,
    canonicalUrl,
    keywords,
    author,
    viewport,
    themeColor,
    ogImage,
    ogImageAlt,
    ogType,
    ogSiteName,
    ogLocale,
    ogTitle,
    ogDescription,
    ogUrl,
    twitterCard,
    twitterSite,
    twitterCreator,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    robots,
    googleBot
  };
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
        "user-agent": "OptinestMetaTagFetcher/1.0 (+https://optinestdigital.com)"
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
    const metadata = parseMetadata(html, parsedUrl.toString());
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json({ error: "Unexpected error while fetching metadata." }, { status: 500 });
  }
}
