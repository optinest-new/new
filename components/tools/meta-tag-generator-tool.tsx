"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trim()}…`;
}

export function MetaTagGeneratorTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [description, setDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [robots, setRobots] = useState("index, follow");
  const [googleBot, setGoogleBot] = useState("");
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1");
  const [themeColor, setThemeColor] = useState("");

  const [ogType, setOgType] = useState("website");
  const [ogSiteName, setOgSiteName] = useState("");
  const [ogLocale, setOgLocale] = useState("en_US");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogUrl, setOgUrl] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogImageAlt, setOgImageAlt] = useState("");

  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("");
  const [twitterCreator, setTwitterCreator] = useState("");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterImage, setTwitterImage] = useState("");
  const [twitterImageAlt, setTwitterImageAlt] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  const fetchMetaFromUrl = async () => {
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
      const response = await fetch("/api/tools/meta-tag-fetch", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: validatedUrl.toString() })
      });
      const payload = (await response.json()) as {
        error?: string;
        title?: string;
        description?: string;
        canonicalUrl?: string;
        keywords?: string;
        author?: string;
        viewport?: string;
        themeColor?: string;
        ogType?: string;
        ogSiteName?: string;
        ogLocale?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogUrl?: string;
        ogImage?: string;
        ogImageAlt?: string;
        twitterCard?: string;
        twitterSite?: string;
        twitterCreator?: string;
        twitterTitle?: string;
        twitterDescription?: string;
        twitterImage?: string;
        twitterImageAlt?: string;
        robots?: string;
        googleBot?: string;
      };

      if (!response.ok) {
        setError(payload.error || "Failed to fetch metadata.");
        return;
      }

      setPageTitle(payload.title || "");
      setDescription(payload.description || "");
      setCanonicalUrl(payload.canonicalUrl || validatedUrl.toString());
      setKeywords(payload.keywords || "");
      setAuthor(payload.author || "");
      setViewport(payload.viewport || "width=device-width, initial-scale=1");
      setThemeColor(payload.themeColor || "");
      setRobots(payload.robots || "index, follow");
      setGoogleBot(payload.googleBot || "");

      setOgType(payload.ogType || "website");
      setOgSiteName(payload.ogSiteName || "");
      setOgLocale(payload.ogLocale || "en_US");
      setOgTitle(payload.ogTitle || payload.title || "");
      setOgDescription(payload.ogDescription || payload.description || "");
      setOgUrl(payload.ogUrl || payload.canonicalUrl || validatedUrl.toString());
      setOgImage(payload.ogImage || "");
      setOgImageAlt(payload.ogImageAlt || "");

      setTwitterCard(payload.twitterCard || "summary_large_image");
      setTwitterSite(payload.twitterSite || "");
      setTwitterCreator(payload.twitterCreator || "");
      setTwitterTitle(payload.twitterTitle || payload.ogTitle || payload.title || "");
      setTwitterDescription(payload.twitterDescription || payload.ogDescription || payload.description || "");
      setTwitterImage(payload.twitterImage || payload.ogImage || "");
      setTwitterImageAlt(payload.twitterImageAlt || payload.ogImageAlt || "");
      setIsFetched(true);
    } catch {
      setError("Could not fetch the URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const code = useMemo(() => {
    if (!isFetched) {
      return "";
    }

    const lines = [
      `<meta charset="UTF-8" />`,
      `<meta name="viewport" content="${escapeHtml(viewport)}" />`,
      `<title>${escapeHtml(pageTitle)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}" />`,
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
      `<meta name="robots" content="${escapeHtml(robots)}" />`
    ];

    if (googleBot.trim()) {
      lines.push(`<meta name="googlebot" content="${escapeHtml(googleBot)}" />`);
    }

    if (author.trim()) {
      lines.push(`<meta name="author" content="${escapeHtml(author)}" />`);
    }

    if (keywords.trim()) {
      lines.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    }

    if (themeColor.trim()) {
      lines.push(`<meta name="theme-color" content="${escapeHtml(themeColor)}" />`);
    }

    lines.push(
      `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
      `<meta property="og:locale" content="${escapeHtml(ogLocale)}" />`,
      `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
      `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
      `<meta property="og:url" content="${escapeHtml(ogUrl)}" />`,
      `<meta property="og:site_name" content="${escapeHtml(ogSiteName)}" />`,
      `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}" />`,
      `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`,
      `<meta name="twitter:site" content="${escapeHtml(twitterSite)}" />`,
      `<meta name="twitter:creator" content="${escapeHtml(twitterCreator)}" />`,
      `<meta name="twitter:title" content="${escapeHtml(twitterTitle)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(twitterDescription)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(twitterImage)}" />`,
      `<meta name="twitter:image:alt" content="${escapeHtml(twitterImageAlt)}" />`
    );

    return lines.filter((line) => !line.includes('content=""')).join("\n");
  }, [
    author,
    canonicalUrl,
    description,
    googleBot,
    isFetched,
    keywords,
    ogDescription,
    ogImage,
    ogImageAlt,
    ogLocale,
    ogSiteName,
    ogTitle,
    ogType,
    ogUrl,
    pageTitle,
    robots,
    themeColor,
    twitterCard,
    twitterCreator,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    twitterSite,
    twitterTitle,
    viewport
  ]);

  const preview = useMemo(() => {
    const displayUrl = ogUrl || canonicalUrl || sourceUrl || "https://example.com/page";
    let host = "example.com";

    try {
      host = new URL(displayUrl).host;
    } catch {
      host = displayUrl.replace(/^https?:\/\//, "");
    }

    return {
      host,
      ogTitle: truncate(ogTitle || pageTitle || "Page Title", 90),
      ogDescription: truncate(ogDescription || description || "Meta description preview.", 170),
      ogImage: ogImage || "",
      twitterTitle: truncate(twitterTitle || ogTitle || pageTitle || "Page Title", 70),
      twitterDescription: truncate(twitterDescription || ogDescription || description || "Twitter description preview.", 145),
      twitterImage: twitterImage || ogImage || "",
      twitterCard
    };
  }, [
    canonicalUrl,
    description,
    ogDescription,
    ogImage,
    ogTitle,
    ogUrl,
    pageTitle,
    sourceUrl,
    twitterCard,
    twitterDescription,
    twitterImage,
    twitterTitle
  ]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Fetch Existing Metadata</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="w-full rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="button"
            onClick={fetchMetaFromUrl}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Fetching..." : "Fetch URL"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Edit and Copy</h2>
      <div className="mt-4 rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Core Meta Tags</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Page Title
          <input
            value={pageTitle}
            onChange={(event) => setPageTitle(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Canonical URL
          <input
            value={canonicalUrl}
            onChange={(event) => setCanonicalUrl(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
          Meta Description
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Keywords
          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Author
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Robots
          <input
            value={robots}
            onChange={(event) => setRobots(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Googlebot
          <input
            value={googleBot}
            onChange={(event) => setGoogleBot(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Viewport
          <input
            value={viewport}
            onChange={(event) => setViewport(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Theme Color
          <input
            value={themeColor}
            onChange={(event) => setThemeColor(event.target.value)}
            placeholder="#f5f6ef"
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>
      </div>

      <div className="mt-4 rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Open Graph Tags</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG Type
            <select
              value={ogType}
              onChange={(event) => setOgType(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
              <option value="profile">profile</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG Locale
            <input
              value={ogLocale}
              onChange={(event) => setOgLocale(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG Site Name
            <input
              value={ogSiteName}
              onChange={(event) => setOgSiteName(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG URL
            <input
              value={ogUrl}
              onChange={(event) => setOgUrl(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            OG Title
            <input
              value={ogTitle}
              onChange={(event) => setOgTitle(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            OG Description
            <textarea
              rows={3}
              value={ogDescription}
              onChange={(event) => setOgDescription(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG Image URL
            <input
              value={ogImage}
              onChange={(event) => setOgImage(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            OG Image Alt
            <input
              value={ogImageAlt}
              onChange={(event) => setOgImageAlt(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Twitter Tags</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Twitter Card
            <select
              value={twitterCard}
              onChange={(event) => setTwitterCard(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Twitter Site (@site)
            <input
              value={twitterSite}
              onChange={(event) => setTwitterSite(event.target.value)}
              placeholder="@optinestdigital"
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Twitter Creator (@creator)
            <input
              value={twitterCreator}
              onChange={(event) => setTwitterCreator(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Twitter Image URL
            <input
              value={twitterImage}
              onChange={(event) => setTwitterImage(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            Twitter Title
            <input
              value={twitterTitle}
              onChange={(event) => setTwitterTitle(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            Twitter Description
            <textarea
              rows={3}
              value={twitterDescription}
              onChange={(event) => setTwitterDescription(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            Twitter Image Alt
            <input
              value={twitterImageAlt}
              onChange={(event) => setTwitterImageAlt(event.target.value)}
              disabled={!isFetched}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h3 className="font-display text-xl uppercase leading-none text-ink">Live Social Preview</h3>
        <p className="mt-2 text-xs text-ink/70 sm:text-sm">
          Preview updates in real time from your current Open Graph and Twitter values.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-ink/25 bg-white">
            <p className="border-b border-ink/15 bg-fog px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/70">
              Facebook / Open Graph
            </p>
            <div className="aspect-[1.91/1] bg-fog">
              {preview.ogImage ? (
                <img src={preview.ogImage} alt="Open Graph preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-semibold text-ink/45">
                  No og:image set
                </div>
              )}
            </div>
            <div className="space-y-1 px-3 py-3">
              <p className="text-[0.68rem] uppercase tracking-[0.08em] text-ink/55">{preview.host}</p>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-ink">{preview.ogTitle}</p>
              <p className="line-clamp-2 text-xs leading-relaxed text-ink/70">{preview.ogDescription}</p>
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-ink/25 bg-white">
            <p className="border-b border-ink/15 bg-fog px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/70">
              Twitter
            </p>
            {preview.twitterCard === "summary" ? (
              <div className="grid grid-cols-[1fr_84px] gap-2 p-3">
                <div>
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-ink">{preview.twitterTitle}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink/70">{preview.twitterDescription}</p>
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.08em] text-ink/55">{preview.host}</p>
                </div>
                <div className="h-[84px] overflow-hidden rounded border border-ink/20 bg-fog">
                  {preview.twitterImage ? (
                    <img src={preview.twitterImage} alt="Twitter preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[0.62rem] font-semibold text-ink/45">No image</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="aspect-[1.91/1] bg-fog">
                  {preview.twitterImage ? (
                    <img src={preview.twitterImage} alt="Twitter preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-ink/45">
                      No twitter:image set
                    </div>
                  )}
                </div>
                <div className="space-y-1 px-3 py-3">
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-ink">{preview.twitterTitle}</p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink/70">{preview.twitterDescription}</p>
                  <p className="text-[0.68rem] uppercase tracking-[0.08em] text-ink/55">{preview.host}</p>
                </div>
              </>
            )}
          </article>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase leading-none text-ink">Generated Meta Tags</h2>
          <CopyButton text={code} label="Copy Tags" />
        </div>
        <textarea
          readOnly
          value={code || "Submit a URL first to fetch and generate meta tags."}
          className="h-72 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
        />
      </div>
    </section>
  );
}
