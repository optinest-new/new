import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseMetaContent(html: string, attrName: "name" | "property", attrValue: string) {
  const pattern = new RegExp(`<meta[^>]+${attrName}=["']${attrValue}["'][^>]*>`, "i");
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

    const pageResponse = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: {
        "user-agent": "OptinestRobotsMetaFetcher/1.0 (+https://optinestdigital.com)"
      },
      redirect: "follow"
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (status ${pageResponse.status}).` },
        { status: 502 }
      );
    }

    const html = await pageResponse.text();
    const finalUrl = new URL(pageResponse.url || parsedUrl.toString());
    const pathToTest = `${finalUrl.pathname || "/"}${finalUrl.search || ""}`;
    const metaRobots = parseMetaContent(html, "name", "robots") || "index, follow";
    const xRobotsTag = pageResponse.headers.get("x-robots-tag")?.trim() || "";

    const robotsUrl = `${finalUrl.origin}/robots.txt`;
    let robotsTxt = "";

    try {
      const robotsResponse = await fetch(robotsUrl, {
        method: "GET",
        headers: {
          "user-agent": "OptinestRobotsMetaFetcher/1.0 (+https://optinestdigital.com)"
        },
        redirect: "follow"
      });

      if (robotsResponse.ok) {
        robotsTxt = await robotsResponse.text();
      }
    } catch {
      robotsTxt = "";
    }

    return NextResponse.json({
      url: finalUrl.toString(),
      pathToTest: pathToTest || "/",
      robotsTxt: robotsTxt || "User-agent: *\nAllow: /",
      metaRobots,
      xRobotsTag
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while fetching robots and meta data." }, { status: 500 });
  }
}
