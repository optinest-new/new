import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog/blog-list";
import { getPaginatedPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
export const dynamic = "force-dynamic";

type BlogPaginationPageProps = {
  params: Promise<{ page: string }>;
};

export async function generateMetadata({ params }: BlogPaginationPageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isFinite(pageNumber) || pageNumber < 2) {
    return {};
  }

  return {
    title: `Blog Page ${pageNumber}`,
    description: `Read page ${pageNumber} of the Optinest Digital blog for focused SEO and web design growth articles.`,
    alternates: {
      canonical: `/blog/page/${pageNumber}`
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/blog/page/${pageNumber}`,
      title: `Optinest Digital Blog - Page ${pageNumber}`,
      description: `Focused SEO and web design guidance on blog page ${pageNumber}.`,
      images: ["/og.png"]
    },
    twitter: {
      card: "summary_large_image",
      title: `Optinest Digital Blog - Page ${pageNumber}`,
      description: `Focused SEO and web design guidance on blog page ${pageNumber}.`,
      images: ["/og.png"]
    }
  };
}

export default async function BlogPaginationPage({ params }: BlogPaginationPageProps) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const { posts, currentPage, totalPages } = await getPaginatedPosts(pageNumber);

  if (pageNumber > totalPages) {
    notFound();
  }

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
