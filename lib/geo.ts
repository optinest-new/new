type HeaderReader = {
  get(name: string): string | null;
};

function normalizeCountryCode(countryCode: string | null | undefined) {
  if (!countryCode) {
    return null;
  }

  const normalized = countryCode.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

function readNetlifyCountryCode(rawGeoHeader: string) {
  try {
    const parsed = JSON.parse(rawGeoHeader) as Record<string, unknown>;
    const country = parsed.country;

    if (typeof country === "string") {
      return normalizeCountryCode(country);
    }

    if (typeof country === "object" && country !== null && "code" in country) {
      const nestedCode = (country as { code?: unknown }).code;
      if (typeof nestedCode === "string") {
        return normalizeCountryCode(nestedCode);
      }
    }

    const countryCode = parsed.countryCode;
    if (typeof countryCode === "string") {
      return normalizeCountryCode(countryCode);
    }
  } catch {
    return null;
  }

  return null;
}

export function getCountryCodeFromHeaders(headers: HeaderReader) {
  const directHeaderCountryCode = [
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("x-country"),
    headers.get("x-country-code")
  ]
    .map((value) => normalizeCountryCode(value))
    .find(Boolean);

  if (directHeaderCountryCode) {
    return directHeaderCountryCode;
  }

  const netlifyGeoHeader = headers.get("x-nf-geo");
  if (netlifyGeoHeader) {
    return readNetlifyCountryCode(netlifyGeoHeader);
  }

  return null;
}
