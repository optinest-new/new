import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export const POSTS_PER_PAGE = 9;

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  primaryKeyword: string;
  featureImage: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

function ensureContentDirectory() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

function toReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parsePostFile(slug: string): BlogPost {
  ensureContentDirectory();
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const file = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(file);

  const frontmatter = data as BlogFrontmatter;
  const readingTime = toReadingTime(content);

  return {
    slug,
    ...frontmatter,
    readingTime,
    contentHtml: content
  };
}

export function getAllBlogSlugs() {
  ensureContentDirectory();
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllPostsMeta(): BlogPostMeta[] {
  return getAllBlogSlugs()
    .map((slug) => parsePostFile(slug))
    .map(({ contentHtml: _contentHtml, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const slugs = getAllBlogSlugs();
  if (!slugs.includes(slug)) {
    return null;
  }

  const post = parsePostFile(slug);
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(post.contentHtml);

  return {
    ...post,
    contentHtml: processed.toString()
  };
}

export function getPaginatedPosts(page: number, perPage = POSTS_PER_PAGE) {
  const all = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  return {
    posts: all.slice(start, end),
    currentPage,
    totalPages,
    totalPosts: all.length
  };
}
