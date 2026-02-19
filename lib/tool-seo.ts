import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type ToolSeoInput = {
  slug: string;
  title: string;
  description: string;
  keywords?: string[];
};

function uniqueKeywords(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.toLowerCase())
    )
  );
}

export function buildToolMetadata({ slug, title, description, keywords = [] }: ToolSeoInput): Metadata {
  const url = `${siteUrl}/tools/${slug}`;
  const brandedTitle = `${title} | Optinest Digital`;
  const mergedKeywords = uniqueKeywords([
    title,
    `${title} tool`,
    "free web developer tools",
    "seo tools",
    "website optimization tools",
    ...keywords
  ]);

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: `/tools/${slug}`
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      type: "website",
      url,
      title: brandedTitle,
      description,
      images: ["/og.png"]
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: ["/og.png"]
    }
  };
}

export function buildToolStructuredData({ slug, title, description }: ToolSeoInput) {
  const url = `${siteUrl}/tools/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${title} | Optinest Digital`,
        description,
        isPartOf: {
          "@id": `${siteUrl}/#website`
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: `${siteUrl}/tools`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: url
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        name: title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        description,
        url
      }
    ]
  };
}

export function buildToolsHubStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/tools#webpage`,
        url: `${siteUrl}/tools`,
        name: "Web Developer Tools | Optinest Digital",
        description:
          "SEO and web workflow tools including SEO health scans, UTM builders, sitemap validation, SERP snippets, meta tags, schema markup, robots testing, internal links, content briefs, and CSS layout generation.",
        isPartOf: {
          "@id": `${siteUrl}/#website`
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: `${siteUrl}/tools`
          }
        ]
      }
    ]
  };
}
