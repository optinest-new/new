"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type SchemaType = "Organization" | "LocalBusiness" | "Service" | "FAQPage" | "Article" | "BreadcrumbList";

const typeOptions: SchemaType[] = ["Organization", "LocalBusiness", "Service", "FAQPage", "Article", "BreadcrumbList"];

function parseLinePairs(value: string): Array<{ name: string; value: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split("|").map((part) => part.trim());
      return { name: name || "", value: rest.join("|").trim() };
    })
    .filter((entry) => entry.name && entry.value);
}

function checkRequiredFields(schemaType: string, data: Record<string, unknown>): string[] {
  const requiredByType: Record<string, string[]> = {
    Organization: ["name", "url"],
    LocalBusiness: ["name", "url", "address", "telephone"],
    Service: ["name", "serviceType", "provider"],
    FAQPage: ["mainEntity"],
    Article: ["headline", "author", "datePublished"],
    BreadcrumbList: ["itemListElement"]
  };

  const required = requiredByType[schemaType] ?? [];
  return required.filter((field) => {
    const value = data[field];
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === undefined || value === null || `${value}`.trim().length === 0;
  });
}

function validateJsonLd(input: string): { valid: boolean; message: string; missing: string[] } {
  try {
    const parsed = JSON.parse(input) as Record<string, unknown>;
    const schemaType = typeof parsed["@type"] === "string" ? parsed["@type"] : "Unknown";
    const missing = checkRequiredFields(schemaType, parsed);

    if (missing.length > 0) {
      return {
        valid: false,
        message: `JSON is valid, but required fields are missing for ${schemaType}.`,
        missing
      };
    }

    return { valid: true, message: `JSON-LD is valid for ${schemaType}.`, missing: [] };
  } catch {
    return { valid: false, message: "Invalid JSON format. Check quotes, commas, and braces.", missing: [] };
  }
}

export function SchemaGeneratorValidatorTool() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Organization");
  const [name, setName] = useState("Optinest Digital");
  const [url, setUrl] = useState("https://optinestdigital.com");
  const [description, setDescription] = useState("Small web design and SEO agency helping brands grow with technical SEO and conversion-focused websites.");
  const [logo, setLogo] = useState("https://optinestdigital.com/og.png");
  const [telephone, setTelephone] = useState("+1-000-000-0000");
  const [address, setAddress] = useState("United States");
  const [serviceType, setServiceType] = useState("Technical SEO and Web Design");
  const [providerName, setProviderName] = useState("Optinest Digital");
  const [headline, setHeadline] = useState("How to Build SEO Systems for Long-Term Growth");
  const [authorName, setAuthorName] = useState("Optinest Digital");
  const [datePublished, setDatePublished] = useState("2026-02-18");
  const [lines, setLines] = useState(
    "What services do you offer?|We provide technical SEO, web design, and content strategy.\nHow long does a project take?|Most projects run 4 to 8 weeks depending on scope."
  );
  const [customJson, setCustomJson] = useState("");

  const schemaObject = useMemo(() => {
    const base = {
      "@context": "https://schema.org",
      "@type": schemaType
    } as Record<string, unknown>;

    if (schemaType === "Organization") {
      return {
        ...base,
        name,
        url,
        description,
        logo
      };
    }

    if (schemaType === "LocalBusiness") {
      return {
        ...base,
        name,
        url,
        description,
        telephone,
        address
      };
    }

    if (schemaType === "Service") {
      return {
        ...base,
        name,
        serviceType,
        description,
        provider: {
          "@type": "Organization",
          name: providerName
        },
        areaServed: address || "Global"
      };
    }

    if (schemaType === "FAQPage") {
      const faqItems = parseLinePairs(lines).map((item) => ({
        "@type": "Question",
        name: item.name,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.value
        }
      }));

      return {
        ...base,
        mainEntity: faqItems
      };
    }

    if (schemaType === "Article") {
      return {
        ...base,
        headline,
        description,
        author: {
          "@type": "Person",
          name: authorName
        },
        datePublished,
        image: logo,
        mainEntityOfPage: url
      };
    }

    const breadcrumbItems = parseLinePairs(lines).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.value
    }));

    return {
      ...base,
      itemListElement: breadcrumbItems
    };
  }, [
    address,
    authorName,
    datePublished,
    description,
    headline,
    lines,
    logo,
    name,
    providerName,
    schemaType,
    serviceType,
    telephone,
    url
  ]);

  const generatedJson = useMemo(() => JSON.stringify(schemaObject, null, 2), [schemaObject]);
  const generatedScript = useMemo(
    () => `<script type="application/ld+json">\n${generatedJson}\n</script>`,
    [generatedJson]
  );

  const generatedValidation = useMemo(() => validateJsonLd(generatedJson), [generatedJson]);
  const customValidation = useMemo(() => {
    if (!customJson.trim()) {
      return null;
    }
    return validateJsonLd(customJson);
  }, [customJson]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Schema Type
          <select
            value={schemaType}
            onChange={(event) => setSchemaType(event.target.value as SchemaType)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          URL
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Logo / Image URL
          <input
            value={logo}
            onChange={(event) => setLogo(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Address or Area Served
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      {(schemaType === "LocalBusiness" || schemaType === "Service") && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Telephone
            <input
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Service Type
            <input
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      )}

      {schemaType === "Service" && (
        <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
          Provider Name
          <input
            value={providerName}
            onChange={(event) => setProviderName(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      )}

      {schemaType === "Article" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Headline
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Author Name
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink">
            Publish Date
            <input
              type="date"
              value={datePublished}
              onChange={(event) => setDatePublished(event.target.value)}
              className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      )}

      {(schemaType === "FAQPage" || schemaType === "BreadcrumbList") && (
        <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
          {schemaType === "FAQPage"
            ? "FAQ Lines (Question | Answer per line)"
            : "Breadcrumb Lines (Label | URL per line)"}
          <textarea
            value={lines}
            onChange={(event) => setLines(event.target.value)}
            className="h-28 rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-sm text-ink"
          />
        </label>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border-2 border-ink/75 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">Generated JSON-LD</h2>
            <CopyButton text={generatedJson} label="Copy JSON" />
          </div>
          <textarea
            readOnly
            value={generatedJson}
            className="h-64 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
          <p className={`mt-2 text-xs font-semibold ${generatedValidation.valid ? "text-green-700" : "text-red-700"}`}>
            {generatedValidation.message}
          </p>
          {generatedValidation.missing.length > 0 && (
            <p className="mt-1 text-xs text-red-700">Missing: {generatedValidation.missing.join(", ")}</p>
          )}
        </article>

        <article className="rounded-xl border-2 border-ink/75 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">Script Tag Output</h2>
            <CopyButton text={generatedScript} label="Copy Script" />
          </div>
          <textarea
            readOnly
            value={generatedScript}
            className="h-64 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
        </article>
      </div>

      <div className="mt-6 rounded-xl border-2 border-ink/75 bg-white p-4">
        <h2 className="font-display text-xl uppercase leading-none text-ink">Validate Custom JSON-LD</h2>
        <textarea
          value={customJson}
          onChange={(event) => setCustomJson(event.target.value)}
          placeholder='Paste custom JSON-LD here, for example: {"@context":"https://schema.org","@type":"Organization","name":"Brand","url":"https://example.com"}'
          className="mt-3 h-48 w-full rounded-lg border border-ink/35 bg-white p-3 font-mono text-xs leading-relaxed text-ink"
        />
        {customValidation && (
          <p className={`mt-2 text-xs font-semibold ${customValidation.valid ? "text-green-700" : "text-red-700"}`}>
            {customValidation.message}
            {customValidation.missing.length > 0 ? ` Missing: ${customValidation.missing.join(", ")}` : ""}
          </p>
        )}
      </div>
    </section>
  );
}
