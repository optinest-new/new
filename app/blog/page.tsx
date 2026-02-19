import type { Metadata } from "next";
import { BlogList } from "@/components/blog/blog-list";
import { getPaginatedPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "SEO and web design articles from Optinest Digital covering technical SEO, content strategy, local SEO, and conversion-focused website growth.",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Optinest Digital Blog",
    description:
      "SEO and web design insights from Optinest Digital for businesses that want sustainable growth.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinest Digital Blog",
    description:
      "SEO and web design insights from Optinest Digital for businesses that want sustainable growth.",
    images: ["/og.png"]
  }
};

export default async function BlogIndexPage() {
  const { posts, currentPage, totalPages } = await getPaginatedPosts(1);

  return (
    <BlogList
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
      title="Growth Blog"
      description="Explore practical playbooks for technical SEO, local search visibility, website redesign, and conversion-focused growth systems."
    />
  );
}
