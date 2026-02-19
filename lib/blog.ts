import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase-server";

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

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
  faqItems: BlogFaqItem[];
};

type BlogPostSourceRecord = BlogFrontmatter & {
  slug: string;
  contentMarkdown: string;
};

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  author: string;
  category: string;
  tags: string[] | null;
  primary_keyword: string;
  feature_image: string;
  content_markdown: string;
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

function stripMarkdown(text: string) {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqItems(markdown: string): BlogFaqItem[] {
  const lines = markdown.split(/\r?\n/);
  let faqStart = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^##\s+(.+)$/);
    if (match && /faq/i.test(match[1])) {
      faqStart = i + 1;
      break;
    }
  }

  if (faqStart === -1) {
    return [];
  }

  let faqEnd = lines.length;
  for (let i = faqStart; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      faqEnd = i;
      break;
    }
  }

  const section = lines.slice(faqStart, faqEnd);
  const items: BlogFaqItem[] = [];
  let question: string | null = null;
  let answerLines: string[] = [];

  const pushItem = () => {
    if (!question) {
      return;
    }
    const answer = stripMarkdown(answerLines.join("\n"));
    if (answer) {
      items.push({ question, answer });
    }
  };

  for (const line of section) {
    const questionMatch = line.match(/^###\s+(.+)$/);
    if (questionMatch) {
      pushItem();
      question = stripMarkdown(questionMatch[1]);
      answerLines = [];
      continue;
    }
    if (question) {
      answerLines.push(line);
    }
  }

  pushItem();
  return items.slice(0, 10);
}

function mapRowToSourceRecord(row: BlogPostRow): BlogPostSourceRecord {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.published_at,
    author: row.author,
    category: row.category,
    tags: row.tags ?? [],
    primaryKeyword: row.primary_keyword,
    featureImage: row.feature_image,
    contentMarkdown: row.content_markdown
  };
}

function parseLegacyPostFile(slug: string): BlogPostSourceRecord | null {
  ensureContentDirectory();
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const file = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(file);
  const frontmatter = data as Partial<BlogFrontmatter>;

  return {
    slug,
    title: String(frontmatter.title ?? ""),
    excerpt: String(frontmatter.excerpt ?? ""),
    date: String(frontmatter.date ?? ""),
    author: String(frontmatter.author ?? ""),
    category: String(frontmatter.category ?? ""),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map((item) => String(item)) : [],
    primaryKeyword: String(frontmatter.primaryKeyword ?? ""),
    featureImage: String(frontmatter.featureImage ?? ""),
    contentMarkdown: content
  };
}

function getAllLegacyPostRecords(): BlogPostSourceRecord[] {
  ensureContentDirectory();
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .map((slug) => parseLegacyPostFile(slug))
    .filter((post): post is BlogPostSourceRecord => Boolean(post));
}

async function getAllDbPostRecords(): Promise<BlogPostSourceRecord[]> {
  if (!hasSupabaseServerEnv()) {
    return [];
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      return [];
    }

    return ((data ?? []) as BlogPostRow[]).map((row) => mapRowToSourceRecord(row));
  } catch {
    return [];
  }
}

async function getDbPostBySlug(slug: string): Promise<BlogPostSourceRecord | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown"
      )
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapRowToSourceRecord(data as BlogPostRow);
  } catch {
    return null;
  }
}

function sortRecordsByDateDesc(a: BlogPostSourceRecord, b: BlogPostSourceRecord) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

async function getAllMergedPostRecords(): Promise<BlogPostSourceRecord[]> {
  const [dbPosts, legacyPosts] = await Promise.all([getAllDbPostRecords(), Promise.resolve(getAllLegacyPostRecords())]);
  const merged = new Map<string, BlogPostSourceRecord>();

  for (const post of dbPosts) {
    merged.set(post.slug, post);
  }

  for (const post of legacyPosts) {
    if (!merged.has(post.slug)) {
      merged.set(post.slug, post);
    }
  }

  return Array.from(merged.values()).sort(sortRecordsByDateDesc);
}

function toPostMeta(record: BlogPostSourceRecord): BlogPostMeta {
  return {
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    date: record.date,
    author: record.author,
    category: record.category,
    tags: record.tags,
    primaryKeyword: record.primaryKeyword,
    featureImage: record.featureImage,
    readingTime: toReadingTime(record.contentMarkdown)
  };
}

export async function getAllBlogSlugs() {
  const posts = await getAllMergedPostRecords();
  return posts.map((post) => post.slug);
}

export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  const posts = await getAllMergedPostRecords();
  return posts.map((post) => toPostMeta(post));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fromDb = await getDbPostBySlug(slug);
  const record = fromDb ?? parseLegacyPostFile(slug);
  if (!record) {
    return null;
  }

  const processed = await remark().use(remarkGfm).use(remarkHtml).process(record.contentMarkdown);

  return {
    ...toPostMeta(record),
    contentHtml: processed.toString(),
    faqItems: extractFaqItems(record.contentMarkdown)
  };
}

export async function getPaginatedPosts(page: number, perPage = POSTS_PER_PAGE) {
  const all = await getAllPostsMeta();
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
