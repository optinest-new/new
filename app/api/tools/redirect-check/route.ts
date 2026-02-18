import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_HOPS = 10;

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

type RedirectHop = {
  url: string;
  status: number;
  location: string;
  nextUrl: string;
};

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

    const visited = new Set<string>();
    const hops: RedirectHop[] = [];
    let currentUrl = parsedUrl.toString();
    let finalStatus = 0;
    let loopDetected = false;

    for (let i = 0; i < MAX_HOPS; i += 1) {
      if (visited.has(currentUrl)) {
        loopDetected = true;
        break;
      }
      visited.add(currentUrl);

      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "user-agent": "OptinestRedirectChecker/1.0 (+https://optinestdigital.com)"
        },
        redirect: "manual"
      });

      finalStatus = response.status;
      const location = response.headers.get("location")?.trim() || "";

      if (!REDIRECT_STATUSES.has(response.status) || !location) {
        break;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(location, currentUrl);
      } catch {
        break;
      }

      hops.push({
        url: currentUrl,
        status: response.status,
        location,
        nextUrl: nextUrl.toString()
      });

      currentUrl = nextUrl.toString();
    }

    const exceededHops = hops.length >= MAX_HOPS;
    const has301 = hops.some((hop) => hop.status === 301);
    const hasTemporary = hops.some((hop) => hop.status === 302 || hop.status === 307);

    return NextResponse.json({
      requestedUrl: parsedUrl.toString(),
      finalUrl: currentUrl,
      finalStatus,
      hops,
      hopCount: hops.length,
      loopDetected,
      exceededHops,
      has301,
      hasTemporary
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while checking redirects." }, { status: 500 });
  }
}
