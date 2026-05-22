import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingShare } from "@/components/blog/floating-share";
import { LeadMagnetCard } from "@/components/blog/lead-magnet-card";
import { getBlogLeadMagnet } from "@/lib/blog-lead-magnet";
import { getAllPostsMeta, getPostBySlug } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
export const dynamic = "force-dynamic";

function toAbsoluteAssetUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${siteUrl}${value}`;
  }
  return `${siteUrl}/${value}`;
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const RESOURCE_TITLE_ACRONYMS = new Set(["AI", "SEO", "UX", "UI", "CRO", "SERP", "CMS", "DNS", "FAQ", "SAAS", "B2B", "HVAC", "PPC", "API"]);

function toResourceTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((token) => {
      if (!token) {
        return token;
      }

      const parts = token.split("-");
      const normalizedParts = parts.map((part) => {
        const cleaned = part.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
        if (!cleaned) {
          return part;
        }

        const upper = cleaned.toUpperCase();
        if (RESOURCE_TITLE_ACRONYMS.has(upper)) {
          return part.replace(cleaned, upper);
        }

        return part.replace(cleaned, cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
      });

      return normalizedParts.join("-");
    })
    .join(" ");
}

function normalizeLowercaseListLinkTitles(html: string): string {
  return html.replace(/<li>([\s\S]*?)<\/li>/g, (listItemMatch, listItemBody: string) => {
    const updatedListItemBody = listItemBody.replace(/<a([^>]*)>([^<]+)<\/a>/g, (anchorMatch, attrs: string, anchorText: string) => {
      const trimmed = anchorText.trim();
      if (!trimmed) {
        return anchorMatch;
      }

      const isMostlyLowercase = trimmed === trimmed.toLowerCase() && /^[a-z0-9\s\-&/().,'":]+$/.test(trimmed);
      if (!isMostlyLowercase) {
        return anchorMatch;
      }

      return `<a${attrs}>${toResourceTitleCase(trimmed)}</a>`;
    });

    return `<li>${updatedListItemBody}</li>`;
  });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    keywords: [post.primaryKeyword, ...post.tags],
    openGraph: {
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: toAbsoluteAssetUrl(post.featureImage),
          alt: `Feature image for ${post.title}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [toAbsoluteAssetUrl(post.featureImage)]
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await getAllPostsMeta())
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === post.category) {
        score += 3;
      }
      const overlap = candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      score += overlap;
      if (candidate.primaryKeyword.split(" ")[0] === post.primaryKeyword.split(" ")[0]) {
        score += 1;
      }
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);

  const blogPostingSchema = {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: toAbsoluteAssetUrl(post.featureImage),
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: post.author
    },
    publisher: {
      "@type": "Organization",
      name: "Optinest Digital",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`
      }
    },
    keywords: [post.primaryKeyword, ...post.tags].join(", ")
  };

  const faqSchema =
    post.faqItems.length > 0
      ? {
          "@type": "FAQPage",
          mainEntity: post.faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer
            }
          }))
        }
      : null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": faqSchema ? [blogPostingSchema, faqSchema] : [blogPostingSchema]
  };
  const normalizedContentHtml = normalizeLowercaseListLinkTitles(post.contentHtml);
  const leadMagnet = getBlogLeadMagnet({
    title: post.title,
    category: post.category,
    tags: post.tags
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 pb-24 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-8 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink/55 sm:text-xs">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-primary">
          Blog
        </Link>{" "}
        / <span aria-current="page" className="break-words text-primary">{post.title}</span>
      </nav>

      <article className="border-2 border-line/85 bg-mist px-4 py-6 shadow-hard sm:px-8 sm:py-8 lg:px-10">
        <header className="mx-auto w-full max-w-[78ch]">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">{post.category}</p>
          <h1 className="hero-title mt-4 font-display text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.92] tracking-[-0.06em] text-ink">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-8 text-ink/78">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/12 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/55 sm:text-xs">
            <span className="text-primary">{post.author}</span>
            <time dateTime={post.date}>{post.date}</time>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <figure className="mx-auto mt-8 max-w-[78ch]">
          <img src={post.featureImage} alt={`Feature image for ${post.title}`} className="w-full border-2 border-line/75 bg-white" />
        </figure>

        <section
          className="blog-prose mx-auto mt-8 w-full max-w-[78ch]"
          dangerouslySetInnerHTML={{ __html: normalizedContentHtml }}
          aria-label="Blog article content"
        />

        <div className="mx-auto mt-10 w-full max-w-[78ch]">
          <LeadMagnetCard magnet={leadMagnet} postTitle={post.title} postSlug={post.slug} />
        </div>

        <aside className="mx-auto mt-12 w-full max-w-[78ch] border-t-2 border-line/12 pt-8" aria-label="Related articles">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-primary">Keep reading</p>
          <h2 className="mt-3 font-display text-3xl uppercase leading-[0.94] tracking-[-0.04em] text-ink sm:text-4xl">
            Related resources
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/70">Keep exploring this topic with related guides from the blog.</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related, index) => (
              <li key={related.slug} className={`overflow-hidden border-2 border-line/75 ${index === 1 ? "bg-primary text-black" : "bg-surface-dim text-ink"}`}>
                <Link href={`/blog/${related.slug}`} className="block">
                  <img
                    src={related.featureImage}
                    alt={`Feature image for ${related.title}`}
                    loading="lazy"
                    className="h-32 w-full border-b-2 border-black/20 bg-white object-cover"
                  />
                  <div className="p-4">
                    <p className="font-display text-2xl uppercase leading-[0.95] tracking-[-0.03em]">{related.title}</p>
                    <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] opacity-70">{related.primaryKeyword}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>

      <FloatingShare title={post.title} url={`${siteUrl}/blog/${post.slug}`} />
    </main>
  );
}
