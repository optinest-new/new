import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingShare } from "@/components/blog/floating-share";
import { LeadMagnetCard } from "@/components/blog/lead-magnet-card";
import { getBlogLeadMagnet } from "@/lib/blog-lead-magnet";
import { getAllBlogSlugs, getAllPostsMeta, getPostBySlug } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const RESOURCE_TITLE_ACRONYMS = new Set([
  "AI",
  "SEO",
  "UX",
  "UI",
  "CRO",
  "SERP",
  "CMS",
  "DNS",
  "FAQ",
  "SaaS".toUpperCase(),
  "B2B",
  "HVAC",
  "PPC",
  "API"
]);

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
    const updatedListItemBody = listItemBody.replace(
      /<a([^>]*)>([^<]+)<\/a>/g,
      (anchorMatch, attrs: string, anchorText: string) => {
        const trimmed = anchorText.trim();
        if (!trimmed) {
          return anchorMatch;
        }

        const isMostlyLowercase =
          trimmed === trimmed.toLowerCase() && /^[a-z0-9\s\-&/().,'":]+$/.test(trimmed);
        if (!isMostlyLowercase) {
          return anchorMatch;
        }

        return `<a${attrs}>${toResourceTitleCase(trimmed)}</a>`;
      }
    );

    return `<li>${updatedListItemBody}</li>`;
  });
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
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
          url: post.featureImage,
          alt: `Feature image for ${post.title}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.featureImage]
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllPostsMeta()
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
    image: `${siteUrl}${post.featureImage}`,
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
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-28 sm:px-6 md:py-16 md:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-7 text-xs text-ink/70 sm:mb-8 sm:text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        / <span aria-current="page" className="break-words">{post.title}</span>
      </nav>

      <article className="w-full rounded-2xl border-2 border-ink/80 bg-mist px-4 py-6 shadow-hard sm:px-8 sm:py-7 lg:px-10">
        <header className="mx-auto w-full max-w-[78ch]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70">{post.category}</p>
          <h1 className="mt-2 text-balance font-display text-3xl uppercase leading-[0.95] text-ink sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-ink/80 sm:text-base">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.78rem] sm:gap-x-5 sm:text-sm">
            <span className="font-semibold text-[#1f2d5a]">{post.author}</span>
            <time dateTime={post.date} className="text-ink/65">
              {post.date}
            </time>
            <span className="font-semibold text-[#9a6b00]">{post.readingTime} min read</span>
          </div>
        </header>

        <figure className="mt-7">
          <img
            src={post.featureImage}
            alt={`Feature image for ${post.title}`}
            className="w-full rounded-xl border-2 border-ink/75 bg-white"
          />
        </figure>

        <section
          className="blog-prose mx-auto mt-8 w-full max-w-[78ch]"
          dangerouslySetInnerHTML={{ __html: normalizedContentHtml }}
          aria-label="Blog article content"
        />

        <LeadMagnetCard magnet={leadMagnet} postTitle={post.title} postSlug={post.slug} />

        <aside className="mx-auto mt-10 w-full max-w-[78ch] border-t-2 border-ink/20 pt-7" aria-label="Related articles">
          <h2 className="font-display text-2xl leading-[0.95] text-ink sm:text-3xl">Related Resources</h2>
          <p className="mt-2 text-xs text-ink/75 sm:text-sm">
            Keep exploring this topic with related guides from the blog.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <li key={related.slug} className="overflow-hidden rounded-lg border-2 border-ink/20 bg-white">
                <Link href={`/blog/${related.slug}`} className="block">
                  <img
                    src={related.featureImage}
                    alt={`Feature image for ${related.title}`}
                    loading="lazy"
                    className="h-32 w-full border-b-2 border-ink/15 bg-white object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm font-semibold text-ink hover:underline">{related.title}</p>
                    <p className="mt-1 text-xs text-ink/65">{related.primaryKeyword}</p>
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
