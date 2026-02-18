"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type CampaignEntry = {
  id: string;
  name: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  generatedUrl: string;
  createdAt: string;
};

const storageKey = "optinest:utm-campaign-library:v1";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeParam(value: string) {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
}

function buildUtmUrl({
  baseUrl,
  source,
  medium,
  campaign,
  term,
  content
}: {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}) {
  let parsed: URL;
  try {
    parsed = new URL(baseUrl.trim());
  } catch {
    return "";
  }

  const utmSource = normalizeParam(source);
  const utmMedium = normalizeParam(medium);
  const utmCampaign = normalizeParam(campaign);

  if (!utmSource || !utmMedium || !utmCampaign) {
    return "";
  }

  parsed.searchParams.set("utm_source", utmSource);
  parsed.searchParams.set("utm_medium", utmMedium);
  parsed.searchParams.set("utm_campaign", utmCampaign);

  const utmTerm = normalizeParam(term);
  const utmContent = normalizeParam(content);
  if (utmTerm) {
    parsed.searchParams.set("utm_term", utmTerm);
  } else {
    parsed.searchParams.delete("utm_term");
  }
  if (utmContent) {
    parsed.searchParams.set("utm_content", utmContent);
  } else {
    parsed.searchParams.delete("utm_content");
  }

  return parsed.toString();
}

export function UtmBuilderCampaignLibraryTool() {
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [library, setLibrary] = useState<CampaignEntry[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as CampaignEntry[];
      if (Array.isArray(parsed)) {
        setLibrary(parsed);
      }
    } catch {
      setLibrary([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(library));
  }, [library]);

  const generatedUrl = useMemo(
    () =>
      buildUtmUrl({
        baseUrl,
        source,
        medium,
        campaign,
        term,
        content
      }),
    [baseUrl, campaign, content, medium, source, term]
  );

  const canSave = Boolean(generatedUrl);

  function resetBuilder() {
    setBaseUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    setCampaignName("");
  }

  function saveCampaign() {
    setError("");
    setMessage("");

    if (!generatedUrl) {
      setError("Provide a valid URL plus source, medium, and campaign.");
      return;
    }

    const entry: CampaignEntry = {
      id: createId(),
      name: campaignName.trim() || campaign.trim(),
      baseUrl: baseUrl.trim(),
      source: normalizeParam(source),
      medium: normalizeParam(medium),
      campaign: normalizeParam(campaign),
      term: normalizeParam(term),
      content: normalizeParam(content),
      generatedUrl,
      createdAt: new Date().toISOString()
    };

    setLibrary((current) => [entry, ...current]);
    setMessage("Campaign saved to your local library.");
  }

  function applyCampaign(entry: CampaignEntry) {
    setBaseUrl(entry.baseUrl);
    setSource(entry.source);
    setMedium(entry.medium);
    setCampaign(entry.campaign);
    setTerm(entry.term);
    setContent(entry.content);
    setCampaignName(entry.name);
    setMessage(`Loaded campaign "${entry.name}".`);
    setError("");
  }

  function deleteCampaign(id: string) {
    setLibrary((current) => current.filter((entry) => entry.id !== id));
  }

  function clearLibrary() {
    setLibrary([]);
    setMessage("Campaign library cleared.");
  }

  const csvOutput = useMemo(() => {
    if (library.length === 0) {
      return "No saved campaigns yet.";
    }
    const header = ["name", "base_url", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "generated_url", "created_at"];
    const rows = library.map((entry) =>
      [
        entry.name,
        entry.baseUrl,
        entry.source,
        entry.medium,
        entry.campaign,
        entry.term,
        entry.content,
        entry.generatedUrl,
        entry.createdAt
      ].join(",")
    );
    return [header.join(","), ...rows].join("\n");
  }, [library]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="rounded-lg border border-ink/25 bg-white p-3 sm:p-4">
        <h2 className="font-display text-2xl uppercase leading-none text-ink">Step 1: Build UTM URL</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
            Page URL
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://example.com/pricing"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            UTM Source
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="newsletter"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            UTM Medium
            <input
              value={medium}
              onChange={(event) => setMedium(event.target.value)}
              placeholder="email"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            UTM Campaign
            <input
              value={campaign}
              onChange={(event) => setCampaign(event.target.value)}
              placeholder="spring_launch"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            UTM Term (optional)
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="seo_agency"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            UTM Content (optional)
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="hero_button"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Campaign Label (library)
            <input
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="March Newsletter CTA"
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-ink/20 bg-mist p-3">
          <p className="text-xs uppercase tracking-[0.1em] text-ink/65">Generated URL</p>
          <p className="mt-1 break-all text-sm text-ink">{generatedUrl || "Complete required fields to generate URL."}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={generatedUrl || ""} label="Copy URL" />
            <button
              type="button"
              onClick={saveCampaign}
              disabled={!canSave}
              className="inline-flex items-center rounded-full border-2 border-[#0f7663] bg-[#16a085] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#0f8d74] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Save To Library
            </button>
            <button
              type="button"
              onClick={resetBuilder}
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink"
            >
              Reset
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p> : null}
        {message ? <p className="mt-2 text-sm font-semibold text-[#1f5c28]">{message}</p> : null}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl uppercase leading-none text-ink">Campaign Library</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#1d4ea5]">
              {library.length} saved
            </span>
            <button
              type="button"
              onClick={clearLibrary}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        {library.length === 0 ? (
          <p className="mt-3 text-sm text-ink/75">No campaigns saved yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {library.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-ink/20 bg-mist p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{entry.name}</p>
                  <p className="text-[0.68rem] text-ink/60">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-1 break-all text-xs text-ink/75">{entry.generatedUrl}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyCampaign(entry)}
                    className="inline-flex items-center rounded-full border border-[#1d4ea5] bg-[#2967d8] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white"
                  >
                    Load
                  </button>
                  <CopyButton text={entry.generatedUrl} label="Copy URL" />
                  <button
                    type="button"
                    onClick={() => deleteCampaign(entry.id)}
                    className="inline-flex items-center rounded-full border border-[#9b1c1c] bg-[#d44444] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-xl uppercase leading-none text-ink">Library CSV Output</h3>
          <CopyButton text={csvOutput} label="Copy CSV" />
        </div>
        <textarea
          readOnly
          value={csvOutput}
          className="h-48 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
        />
      </div>
    </section>
  );
}
