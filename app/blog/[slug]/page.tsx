import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingShare } from "@/components/blog/floating-share";
import { getAllBlogSlugs, getAllPostsMeta, getPostBySlug } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const schema = {
    "@context": "https://schema.org",
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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 pb-28 sm:px-6 sm:py-12 md:py-16 md:pb-20">
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

      <article className="rounded-2xl border-2 border-ink/80 bg-mist px-4 py-6 shadow-hard sm:px-8 sm:py-7">
        <header>
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
          className="blog-prose mt-8"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          aria-label="Blog article content"
        />

        <aside className="mt-10 border-t-2 border-ink/20 pt-7" aria-label="Related articles">
          <h2 className="font-display text-2xl uppercase leading-[0.95] text-ink sm:text-3xl">Related Articles</h2>
          <p className="mt-2 text-xs text-ink/75 sm:text-sm">
            Keep exploring this topic with related guides from the blog.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <li key={related.slug} className="rounded-lg border-2 border-ink/20 bg-white p-4">
                <Link href={`/blog/${related.slug}`} className="text-sm font-semibold text-ink hover:underline">
                  {related.title}
                </Link>
                <p className="mt-1 text-xs text-ink/65">{related.primaryKeyword}</p>
              </li>
            ))}
          </ul>
        </aside>
      </article>

      <FloatingShare title={post.title} url={`${siteUrl}/blog/${post.slug}`} />
    </main>
  );
}
