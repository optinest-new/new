import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { assertManagerAccess } from "@/lib/portal-manager-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

type BlogPostBodyInput = {
  slug?: string;
  title?: string;
  excerpt?: string;
  date?: string;
  author?: string;
  category?: string;
  tags?: string[] | string;
  primaryKeyword?: string;
  featureImage?: string;
  content?: string;
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
  updated_at: string;
};

type BlogPostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  primaryKeyword: string;
  featureImage: string;
  content: string;
  updatedAt: string;
};

type BlogPostListItem = Omit<BlogPostRecord, "content">;

function ensureContentDirectory() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeDate(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Date must be a valid date.");
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTags(input: BlogPostBodyInput["tags"]) {
  const raw =
    typeof input === "string"
      ? input.split(",")
      : Array.isArray(input)
        ? input
        : [];

  const tags = raw.map((item) => String(item).trim()).filter(Boolean);
  return Array.from(new Set(tags));
}

function postPathFromSlug(slug: string) {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

function parseLegacyPostBySlug(slug: string): BlogPostRecord | null {
  ensureContentDirectory();
  const filePath = postPathFromSlug(slug);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = fs.statSync(filePath);

  return {
    slug,
    title: String(data.title ?? ""),
    excerpt: String(data.excerpt ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? ""),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map((item) => String(item)) : [],
    primaryKeyword: String(data.primaryKeyword ?? ""),
    featureImage: String(data.featureImage ?? ""),
    content,
    updatedAt: stats.mtime.toISOString()
  };
}

function getAllLegacyPosts(): BlogPostRecord[] {
  ensureContentDirectory();
  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));

  return slugs
    .map((slug) => parseLegacyPostBySlug(slug))
    .filter((post): post is BlogPostRecord => Boolean(post));
}

function mapRowToRecord(row: BlogPostRow): BlogPostRecord {
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
    content: row.content_markdown,
    updatedAt: row.updated_at
  };
}

function toListItem(post: BlogPostRecord): BlogPostListItem {
  const { content: _content, ...meta } = post;
  return meta;
}

function sortByDateDesc(a: { date: string }, b: { date: string }) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function validatePostInput(input: BlogPostBodyInput) {
  const title = String(input.title ?? "").trim();
  const excerpt = String(input.excerpt ?? "").trim();
  const author = String(input.author ?? "").trim();
  const category = String(input.category ?? "").trim();
  const primaryKeyword = String(input.primaryKeyword ?? "").trim();
  const featureImage = String(input.featureImage ?? "").trim();
  const content = String(input.content ?? "").trim();
  const slugSource = String(input.slug ?? "").trim() || title;
  const slug = normalizeSlug(slugSource);

  if (!slug) {
    throw new Error("Slug is required.");
  }
  if (!title) {
    throw new Error("Title is required.");
  }
  if (!excerpt) {
    throw new Error("Excerpt is required.");
  }
  if (!author) {
    throw new Error("Author is required.");
  }
  if (!category) {
    throw new Error("Category is required.");
  }
  if (!primaryKeyword) {
    throw new Error("Primary keyword is required.");
  }
  if (!featureImage) {
    throw new Error("Feature image is required.");
  }
  if (!content) {
    throw new Error("Post content is required.");
  }

  return {
    slug,
    title,
    excerpt,
    date: normalizeDate(String(input.date ?? "")),
    author,
    category,
    tags: normalizeTags(input.tags),
    primaryKeyword,
    featureImage,
    content
  };
}

export async function GET(request: Request) {
  const access = await assertManagerAccess(request);
  if (!access.ok) {
    return access.response;
  }

  const supabase = createSupabaseServerClient(access.accessToken);
  const { searchParams } = new URL(request.url);
  const slugQuery = searchParams.get("slug");

  if (slugQuery) {
    const slug = normalizeSlug(slugQuery);
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
    }

    const { data: row, error } = await supabase
      .from("blog_posts")
      .select(
        "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown,updated_at"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error && !error.message.toLowerCase().includes("relation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (row) {
      return NextResponse.json({ post: mapRowToRecord(row as BlogPostRow) });
    }

    const legacyPost = parseLegacyPostBySlug(slug);
    if (!legacyPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post: legacyPost });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown,updated_at"
    )
    .order("published_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error && !error.message.toLowerCase().includes("relation")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const recordsFromDb = ((data ?? []) as BlogPostRow[]).map((row) => mapRowToRecord(row));
  const recordsBySlug = new Map<string, BlogPostRecord>();
  for (const post of recordsFromDb) {
    recordsBySlug.set(post.slug, post);
  }

  for (const legacyPost of getAllLegacyPosts()) {
    if (!recordsBySlug.has(legacyPost.slug)) {
      recordsBySlug.set(legacyPost.slug, legacyPost);
    }
  }

  const posts = Array.from(recordsBySlug.values()).sort(sortByDateDesc).map((post) => toListItem(post));
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const access = await assertManagerAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = (await request.json()) as BlogPostBodyInput;
    const postInput = validatePostInput(body);
    const supabase = createSupabaseServerClient(access.accessToken);

    const { data: existingRow } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", postInput.slug)
      .maybeSingle();

    if (existingRow) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }

    const { data: insertedRow, error } = await supabase
      .from("blog_posts")
      .insert({
        slug: postInput.slug,
        title: postInput.title,
        excerpt: postInput.excerpt,
        published_at: postInput.date,
        author: postInput.author,
        category: postInput.category,
        tags: postInput.tags,
        primary_keyword: postInput.primaryKeyword,
        feature_image: postInput.featureImage,
        content_markdown: postInput.content,
        is_published: true
      })
      .select(
        "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown,updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ post: mapRowToRecord(insertedRow as BlogPostRow) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const access = await assertManagerAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = (await request.json()) as BlogPostBodyInput & { currentSlug?: string };
    const currentSlug = normalizeSlug(String(body.currentSlug ?? ""));
    if (!currentSlug) {
      return NextResponse.json({ error: "Current slug is required." }, { status: 400 });
    }

    const postInput = validatePostInput(body);
    const supabase = createSupabaseServerClient(access.accessToken);

    if (postInput.slug !== currentSlug) {
      const { data: conflictRow } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("slug", postInput.slug)
        .maybeSingle();

      if (conflictRow) {
        return NextResponse.json({ error: "A post with the new slug already exists." }, { status: 409 });
      }
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("blog_posts")
      .update({
        slug: postInput.slug,
        title: postInput.title,
        excerpt: postInput.excerpt,
        published_at: postInput.date,
        author: postInput.author,
        category: postInput.category,
        tags: postInput.tags,
        primary_keyword: postInput.primaryKeyword,
        feature_image: postInput.featureImage,
        content_markdown: postInput.content,
        is_published: true
      })
      .eq("slug", currentSlug)
      .select(
        "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown,updated_at"
      )
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    let effectiveRow = updatedRow as BlogPostRow | null;

    if (!effectiveRow) {
      const { data: insertedRow, error: insertError } = await supabase
        .from("blog_posts")
        .insert({
          slug: postInput.slug,
          title: postInput.title,
          excerpt: postInput.excerpt,
          published_at: postInput.date,
          author: postInput.author,
          category: postInput.category,
          tags: postInput.tags,
          primary_keyword: postInput.primaryKeyword,
          feature_image: postInput.featureImage,
          content_markdown: postInput.content,
          is_published: true
        })
        .select(
          "slug,title,excerpt,published_at,author,category,tags,primary_keyword,feature_image,content_markdown,updated_at"
        )
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
      effectiveRow = insertedRow as BlogPostRow;
    }

    const legacyPath = postPathFromSlug(currentSlug);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }

    return NextResponse.json({ post: mapRowToRecord(effectiveRow) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const access = await assertManagerAccess(request);
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = (await request.json()) as { slug?: string };
    const slug = normalizeSlug(String(body.slug ?? ""));
    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient(access.accessToken);
    const { error, count } = await supabase
      .from("blog_posts")
      .delete({ count: "exact" })
      .eq("slug", slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let removedLegacy = false;
    const legacyPath = postPathFromSlug(slug);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
      removedLegacy = true;
    }

    if (!removedLegacy && (!count || count === 0)) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
