import type { MetadataRoute } from "next";
import { POSTS_PER_PAGE, getAllPostsMeta } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";
  const posts = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const paginatedUrls: MetadataRoute.Sitemap = Array.from({ length: totalPages - 1 }, (_, i) => ({
    url: `${siteUrl}/blog/page/${i + 2}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8
  }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    ...paginatedUrls,
    ...postUrls
  ];
}
