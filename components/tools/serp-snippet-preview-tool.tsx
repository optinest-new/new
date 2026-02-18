"use client";

import { useMemo, useState } from "react";

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 160;
const TITLE_PIXEL_LIMIT = 580;

function estimatePixelWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    if ("MW@#%&".includes(char)) {
      width += 12;
    } else if ("il.,:;'|! ".includes(char)) {
      width += 4;
    } else if (char === char.toUpperCase() && /[A-Z]/.test(char)) {
      width += 10;
    } else {
      width += 8;
    }
  }
  return width;
}

function getScoreLabel(isGood: boolean): string {
  return isGood ? "Good" : "Needs adjustment";
}

export function SerpSnippetPreviewTool() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  const [domain, setDomain] = useState("");
  const [path, setPath] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchFromUrl = async () => {
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
      };

      if (!response.ok) {
        setError(payload.error || "Failed to fetch metadata.");
        return;
      }

      const canonical = payload.canonicalUrl?.trim() || validatedUrl.toString();
      let finalUrl = validatedUrl;

      try {
        finalUrl = new URL(canonical);
      } catch {
        finalUrl = validatedUrl;
      }

      setDomain(finalUrl.origin);
      const builtPath = `${finalUrl.pathname || "/"}${finalUrl.search || ""}`;
      setPath(builtPath || "/");
      setTitle(payload.title?.trim() || "");
      setDescription(payload.description?.trim() || "");
      setIsFetched(true);
    } catch {
      setError("Could not fetch the URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fullUrl = useMemo(() => {
    if (!isFetched) {
      return "";
    }
    const cleanDomain = domain.trim().replace(/\/+$/, "");
    const cleanPath = path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`;
    return `${cleanDomain}${cleanPath}`;
  }, [domain, isFetched, path]);

  const titlePixels = useMemo(() => estimatePixelWidth(title.trim()), [title]);
  const titleLength = title.trim().length;
  const descLength = description.trim().length;

  const isTitleLengthGood = titleLength >= TITLE_MIN && titleLength <= TITLE_MAX;
  const isDescLengthGood = descLength >= DESC_MIN && descLength <= DESC_MAX;
  const isTitlePixelGood = titlePixels <= TITLE_PIXEL_LIMIT;

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
            onClick={fetchFromUrl}
            disabled={isLoading}
            className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-mist disabled:opacity-60"
          >
            {isLoading ? "Fetching..." : "Fetch URL"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
      </div>

      <h2 className="mt-5 font-display text-2xl uppercase leading-none text-ink">Step 2: Edit and Preview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Domain
          <input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="https://example.com"
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          URL Path
          <input
            value={path}
            onChange={(event) => setPath(event.target.value)}
            placeholder="/services/seo"
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          SEO Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!isFetched}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Meta Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!isFetched}
            className="h-24 rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink disabled:bg-fog"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Title Length</p>
          <p className="text-sm font-bold text-ink">
            {isFetched ? `${titleLength} chars · ${getScoreLabel(isTitleLengthGood)}` : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Description Length</p>
          <p className="text-sm font-bold text-ink">
            {isFetched ? `${descLength} chars · ${getScoreLabel(isDescLengthGood)}` : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-ink/25 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/60">Title Pixel Width</p>
          <p className="text-sm font-bold text-ink">
            {isFetched ? `${titlePixels}px · ${getScoreLabel(isTitlePixelGood)}` : "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border-2 border-ink/75 bg-white p-4">
          <h2 className="font-display text-xl uppercase leading-none text-ink">Desktop SERP Preview</h2>
          <div className="mt-4 rounded-lg border border-ink/20 p-3">
            <p className="line-clamp-2 text-[1.35rem] leading-tight text-[#1a0dab]">
              {isFetched ? title || "SEO title goes here" : "Fetch a URL first"}
            </p>
            <p className="mt-1 text-sm text-[#0b8043]">{isFetched ? fullUrl : "https://example.com/page"}</p>
            <p className="mt-2 text-sm text-[#3c4043]">
              {isFetched ? description || "Meta description preview appears here." : "Fetch a URL to generate the snippet preview."}
            </p>
          </div>
        </article>

        <article className="rounded-xl border-2 border-ink/75 bg-white p-4">
          <h2 className="font-display text-xl uppercase leading-none text-ink">Mobile SERP Preview</h2>
          <div className="mt-4 max-w-sm rounded-2xl border border-ink/20 p-3">
            <p className="line-clamp-2 text-[1.05rem] leading-tight text-[#1a0dab]">
              {isFetched ? title || "SEO title goes here" : "Fetch a URL first"}
            </p>
            <p className="mt-1 text-xs text-[#0b8043]">{isFetched ? fullUrl : "https://example.com/page"}</p>
            <p className="mt-2 text-[0.84rem] text-[#3c4043]">
              {isFetched ? description || "Meta description preview appears here." : "Fetch a URL to generate the snippet preview."}
            </p>
          </div>
        </article>
      </div>

    </section>
  );
}
