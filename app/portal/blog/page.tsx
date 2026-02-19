"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { PortalNotificationCenter } from "@/components/portal-notification-center";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type BlogPostListItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  primaryKeyword: string;
  featureImage: string;
  updatedAt: string;
};

type BlogPostRecord = BlogPostListItem & {
  content: string;
};

type BlogPostDraft = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string;
  primaryKeyword: string;
  featureImage: string;
  content: string;
};

const SIDEBAR_POSTS_PER_PAGE = 10;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyDraft(): BlogPostDraft {
  return {
    slug: "",
    title: "",
    excerpt: "",
    date: todayIsoDate(),
    author: "Optinest Digital",
    category: "SEO",
    tags: "",
    primaryKeyword: "",
    featureImage: "",
    content: ""
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function parseDraftTags(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTagsInputWithSuggestion(currentValue: string, suggestion: string) {
  const parts = currentValue.split(",");
  if (parts.length === 0) {
    return `${suggestion}, `;
  }

  parts[parts.length - 1] = ` ${suggestion}`;
  const normalized = parts.map((item) => item.trim());
  return `${normalized.filter((item) => item.length > 0).join(", ")}, `;
}

function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeMarkdownImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return normalizeExternalUrl(trimmed);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeMarkdownHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed
    .replace(
      /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ""
    )
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
}

function renderMarkdownInline(value: string): string {
  const withCode = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  const withImages = withCode.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, altText: string, src: string) => {
      const normalizedSrc = normalizeMarkdownImageUrl(src);
      if (!normalizedSrc) {
        return "";
      }

      return `<img src="${normalizedSrc}" alt="${altText.trim()}" loading="lazy" />`;
    }
  );
  const withBold = withImages.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return withItalic.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    const normalizedUrl = normalizeExternalUrl(href);
    if (!normalizedUrl) {
      return label;
    }

    return `<a href="${normalizedUrl}" target="_blank" rel="noreferrer">${label}</a>`;
  });
}

function renderMarkdownToHtml(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const chunks: string[] = [];
  let isInUnorderedList = false;
  let isInOrderedList = false;
  let currentLineIndex = 0;

  const isTableSeparator = (line: string) => {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
  };

  const parseTableCells = (line: string) => {
    const normalizedLine = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return normalizedLine.split("|").map((cell) => cell.trim());
  };

  const closeLists = () => {
    if (isInUnorderedList) {
      chunks.push("</ul>");
      isInUnorderedList = false;
    }
    if (isInOrderedList) {
      chunks.push("</ol>");
      isInOrderedList = false;
    }
  };

  while (currentLineIndex < lines.length) {
    const rawLine = lines[currentLineIndex];
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      currentLineIndex += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      chunks.push(`<h${level}>${renderMarkdownInline(escapeHtml(headingMatch[2]))}</h${level}>`);
      currentLineIndex += 1;
      continue;
    }

    const nextLine = lines[currentLineIndex + 1]?.trim() || "";
    if (line.includes("|") && isTableSeparator(nextLine)) {
      closeLists();
      const headerCells = parseTableCells(line);
      const bodyRows: string[][] = [];
      currentLineIndex += 2;

      while (currentLineIndex < lines.length) {
        const candidateLine = lines[currentLineIndex].trim();
        if (!candidateLine || !candidateLine.includes("|")) {
          break;
        }
        if (isTableSeparator(candidateLine)) {
          currentLineIndex += 1;
          continue;
        }
        bodyRows.push(parseTableCells(candidateLine));
        currentLineIndex += 1;
      }

      const headerHtml = headerCells
        .map((cell) => `<th>${renderMarkdownInline(escapeHtml(cell))}</th>`)
        .join("");
      const bodyHtml = bodyRows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td>${renderMarkdownInline(escapeHtml(cell))}</td>`)
              .join("")}</tr>`
        )
        .join("");

      chunks.push(`<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      if (!isInUnorderedList) {
        if (isInOrderedList) {
          chunks.push("</ol>");
          isInOrderedList = false;
        }
        chunks.push("<ul>");
        isInUnorderedList = true;
      }
      chunks.push(`<li>${renderMarkdownInline(escapeHtml(unorderedMatch[1]))}</li>`);
      currentLineIndex += 1;
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!isInOrderedList) {
        if (isInUnorderedList) {
          chunks.push("</ul>");
          isInUnorderedList = false;
        }
        chunks.push("<ol>");
        isInOrderedList = true;
      }
      chunks.push(`<li>${renderMarkdownInline(escapeHtml(orderedMatch[1]))}</li>`);
      currentLineIndex += 1;
      continue;
    }

    if (/^```/.test(line)) {
      closeLists();
      chunks.push(`<p><code>${escapeHtml(line)}</code></p>`);
      currentLineIndex += 1;
      continue;
    }

    closeLists();
    chunks.push(`<p>${renderMarkdownInline(escapeHtml(line))}</p>`);
    currentLineIndex += 1;
  }

  closeLists();
  return chunks.join("");
}

function fileNameToAltText(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/[-_]+/g, " ").trim() || "image";
}

export default function PortalBlogManagerPage() {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingManagerStatus, setIsLoadingManagerStatus] = useState(false);
  const [isBootstrapManager, setIsBootstrapManager] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [draft, setDraft] = useState<BlogPostDraft>(() => createEmptyDraft());
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingMarkdownImage, setIsUploadingMarkdownImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState("");
  const [markdownImageUploadMessage, setMarkdownImageUploadMessage] = useState("");
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState("");
  const hasResolvedManagerStatusRef = useRef(false);
  const localImagePreviewUrlRef = useRef("");
  const markdownEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const markdownImageInputRef = useRef<HTMLInputElement | null>(null);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchDraft.trim().toLowerCase();
    if (!normalizedSearch) {
      return posts;
    }

    return posts.filter((post) =>
      `${post.title} ${post.slug} ${post.category} ${post.primaryKeyword} ${post.author}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [posts, searchDraft]);

  const totalSidebarPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPosts.length / SIDEBAR_POSTS_PER_PAGE)),
    [filteredPosts.length]
  );

  const paginatedSidebarPosts = useMemo(() => {
    const start = (sidebarPage - 1) * SIDEBAR_POSTS_PER_PAGE;
    const end = start + SIDEBAR_POSTS_PER_PAGE;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, sidebarPage]);

  const sidebarStartIndex = useMemo(() => {
    if (filteredPosts.length === 0) {
      return 0;
    }
    return (sidebarPage - 1) * SIDEBAR_POSTS_PER_PAGE + 1;
  }, [filteredPosts.length, sidebarPage]);

  const sidebarEndIndex = useMemo(() => {
    if (filteredPosts.length === 0) {
      return 0;
    }
    return Math.min(sidebarPage * SIDEBAR_POSTS_PER_PAGE, filteredPosts.length);
  }, [filteredPosts.length, sidebarPage]);

  const categorySuggestions = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.category.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [posts]);

  const tagSuggestions = useMemo(() => {
    const unique = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) {
        const next = tag.trim();
        if (next) {
          unique.add(next);
        }
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const currentDraftTags = useMemo(() => parseDraftTags(draft.tags), [draft.tags]);

  const filteredTagSuggestions = useMemo(() => {
    const enteredTagSet = new Set(currentDraftTags.map((item) => item.toLowerCase()));
    const lastSegment = draft.tags.split(",").pop()?.trim().toLowerCase() || "";

    return tagSuggestions
      .filter((tag) => {
        const normalized = tag.toLowerCase();
        if (enteredTagSet.has(normalized)) {
          return false;
        }
        if (!lastSegment) {
          return true;
        }
        return normalized.includes(lastSegment);
      })
      .slice(0, 8);
  }, [currentDraftTags, draft.tags, tagSuggestions]);

  const featureImagePreviewSrc = localImagePreviewUrl || draft.featureImage;
  const markdownPreviewHtml = useMemo(
    () => sanitizeMarkdownHtml(renderMarkdownToHtml(draft.content)),
    [draft.content]
  );
  const markdownWordCount = useMemo(() => {
    const normalized = draft.content.trim();
    if (!normalized) {
      return 0;
    }
    return normalized.split(/\s+/).length;
  }, [draft.content]);
  const markdownReadMinutes = useMemo(() => {
    if (markdownWordCount === 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(markdownWordCount / 200));
  }, [markdownWordCount]);

  const applyPostToDraft = useCallback((post: BlogPostRecord) => {
    if (localImagePreviewUrlRef.current) {
      URL.revokeObjectURL(localImagePreviewUrlRef.current);
      localImagePreviewUrlRef.current = "";
    }
    setLocalImagePreviewUrl("");
    setImageUploadMessage("");
    setDraft({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      author: post.author,
      category: post.category,
      tags: post.tags.join(", "),
      primaryKeyword: post.primaryKeyword,
      featureImage: post.featureImage,
      content: post.content
    });
  }, []);

  const managerFetch = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T> => {
      if (!session) {
        throw new Error("You must be signed in.");
      }

      const response = await fetch(url, {
        ...init,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...(init?.headers ?? {})
        }
      });

      const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
      }

      return payload;
    },
    [session]
  );

  const loadPosts = useCallback(async () => {
    if (!session || !isBootstrapManager) {
      setPosts([]);
      return;
    }

    setIsLoadingPosts(true);
    setPortalError("");

    try {
      const payload = await managerFetch<{ posts: BlogPostListItem[] }>("/api/portal/blog-posts");
      setPosts(payload.posts ?? []);
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to load blog posts.");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [isBootstrapManager, managerFetch, session]);

  const loadPost = useCallback(
    async (slug: string) => {
      if (!session || !isBootstrapManager) {
        return;
      }

      setIsLoadingPost(true);
      setPortalError("");
      setPageMessage("");

      try {
        const payload = await managerFetch<{ post: BlogPostRecord }>(
          `/api/portal/blog-posts?slug=${encodeURIComponent(slug)}`
        );
        applyPostToDraft(payload.post);
      } catch (error) {
        setPortalError(error instanceof Error ? error.message : "Failed to load selected post.");
      } finally {
        setIsLoadingPost(false);
      }
    },
    [applyPostToDraft, isBootstrapManager, managerFetch, session]
  );

  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setPortalError("");
      setPageMessage("");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      setIsBootstrapManager(false);
      setIsLoadingManagerStatus(false);
      hasResolvedManagerStatusRef.current = false;
      return;
    }

    let cancelled = false;
    if (!hasResolvedManagerStatusRef.current) {
      setIsLoadingManagerStatus(true);
    }

    supabase.rpc("is_bootstrap_manager").then(({ data, error }) => {
      if (cancelled) {
        return;
      }

      setIsLoadingManagerStatus(false);
      hasResolvedManagerStatusRef.current = true;
      if (error) {
        setPortalError(error.message);
        return;
      }
      setIsBootstrapManager(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  useEffect(() => {
    if (!session || !isBootstrapManager) {
      if (localImagePreviewUrlRef.current) {
        URL.revokeObjectURL(localImagePreviewUrlRef.current);
        localImagePreviewUrlRef.current = "";
      }
      setLocalImagePreviewUrl("");
      setImageUploadMessage("");
      setMarkdownImageUploadMessage("");
      setPosts([]);
      setSelectedSlug(null);
      setIsCreateMode(true);
      setDraft(createEmptyDraft());
      return;
    }

    void loadPosts();
  }, [isBootstrapManager, loadPosts, session]);

  useEffect(() => {
    setSidebarPage((currentPage) => Math.min(currentPage, totalSidebarPages));
  }, [totalSidebarPages]);

  useEffect(() => {
    return () => {
      if (localImagePreviewUrlRef.current) {
        URL.revokeObjectURL(localImagePreviewUrlRef.current);
        localImagePreviewUrlRef.current = "";
      }
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    if (localImagePreviewUrlRef.current) {
      URL.revokeObjectURL(localImagePreviewUrlRef.current);
      localImagePreviewUrlRef.current = "";
    }
    setLocalImagePreviewUrl("");
    setImageUploadMessage("");
    setMarkdownImageUploadMessage("");
    setPortalError("");
    setPageMessage("");
    setPosts([]);
    setSelectedSlug(null);
    setIsCreateMode(true);
    setDraft(createEmptyDraft());
  }

  function handleStartCreate() {
    if (localImagePreviewUrlRef.current) {
      URL.revokeObjectURL(localImagePreviewUrlRef.current);
      localImagePreviewUrlRef.current = "";
    }
    setLocalImagePreviewUrl("");
    setImageUploadMessage("");
    setMarkdownImageUploadMessage("");
    setPageMessage("");
    setPortalError("");
    setSelectedSlug(null);
    setIsCreateMode(true);
    setDraft(createEmptyDraft());
  }

  async function handleSelectPost(slug: string) {
    setImageUploadMessage("");
    setMarkdownImageUploadMessage("");
    setSelectedSlug(slug);
    setIsCreateMode(false);
    await loadPost(slug);
  }

  function handleTagSuggestionSelect(suggestion: string) {
    setDraft((current) => ({
      ...current,
      tags: buildTagsInputWithSuggestion(current.tags, suggestion)
    }));
  }

  function focusMarkdownEditor(start: number, end: number) {
    requestAnimationFrame(() => {
      if (!markdownEditorRef.current) {
        return;
      }
      markdownEditorRef.current.focus();
      markdownEditorRef.current.setSelectionRange(start, end);
    });
  }

  function insertMarkdownAroundSelection(prefix: string, suffix: string, placeholder: string) {
    if (!markdownEditorRef.current) {
      return;
    }

    const editor = markdownEditorRef.current;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = draft.content.slice(start, end);
    const inserted = selected || placeholder;
    const nextContent =
      draft.content.slice(0, start) + prefix + inserted + suffix + draft.content.slice(end);

    setDraft((current) => ({ ...current, content: nextContent }));
    focusMarkdownEditor(start + prefix.length, start + prefix.length + inserted.length);
  }

  function insertMarkdownSnippet(snippet: string, cursorOffset?: number) {
    if (!markdownEditorRef.current) {
      return;
    }

    const editor = markdownEditorRef.current;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextContent = draft.content.slice(0, start) + snippet + draft.content.slice(end);
    const nextCursorPosition = typeof cursorOffset === "number" ? start + cursorOffset : start + snippet.length;

    setDraft((current) => ({ ...current, content: nextContent }));
    focusMarkdownEditor(nextCursorPosition, nextCursorPosition);
  }

  function insertMarkdownLinePrefix(prefix: string) {
    if (!markdownEditorRef.current) {
      return;
    }

    const editor = markdownEditorRef.current;
    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    const lineStart = draft.content.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
    const nextNewlineIndex = draft.content.indexOf("\n", selectionEnd);
    const lineEnd = nextNewlineIndex === -1 ? draft.content.length : nextNewlineIndex;
    const selectedBlock = draft.content.slice(lineStart, lineEnd);
    const prefixedBlock = selectedBlock
      .split("\n")
      .map((line) => (line.trim() ? `${prefix}${line}` : line))
      .join("\n");
    const nextContent =
      draft.content.slice(0, lineStart) + prefixedBlock + draft.content.slice(lineEnd);

    setDraft((current) => ({ ...current, content: nextContent }));
    focusMarkdownEditor(lineStart, lineStart + prefixedBlock.length);
  }

  async function handleUploadFeatureImage(file: File) {
    if (!session || !isBootstrapManager) {
      return;
    }

    if (localImagePreviewUrlRef.current) {
      URL.revokeObjectURL(localImagePreviewUrlRef.current);
      localImagePreviewUrlRef.current = "";
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    localImagePreviewUrlRef.current = nextPreviewUrl;
    setLocalImagePreviewUrl(nextPreviewUrl);

    setIsUploadingImage(true);
    setImageUploadMessage("");
    setMarkdownImageUploadMessage("");
    setPortalError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/portal/blog-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      });

      const payload = (await response.json()) as { path?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to upload feature image.");
      }

      if (!payload.path) {
        throw new Error("Upload completed but no image path was returned.");
      }

      setDraft((current) => ({
        ...current,
        featureImage: payload.path || current.featureImage
      }));
      setImageUploadMessage("Feature image uploaded.");
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadMarkdownImage(file: File) {
    if (!session || !isBootstrapManager) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPortalError("Only image files are allowed.");
      return;
    }

    setIsUploadingMarkdownImage(true);
    setMarkdownImageUploadMessage("");
    setPortalError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/portal/blog-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      });

      const payload = (await response.json()) as { path?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to upload markdown image.");
      }

      if (!payload.path) {
        throw new Error("Upload completed but no image URL was returned.");
      }

      const altText = fileNameToAltText(file.name);
      insertMarkdownSnippet(`![${altText}](${payload.path})`);
      setMarkdownImageUploadMessage("Markdown image uploaded and inserted.");
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to upload markdown image.");
    } finally {
      setIsUploadingMarkdownImage(false);
    }
  }

  async function handleSavePost() {
    if (!session || !isBootstrapManager) {
      return;
    }

    if (!draft.featureImage.trim()) {
      setPortalError("Upload a feature image before saving.");
      return;
    }

    setIsSavingPost(true);
    setPortalError("");
    setPageMessage("");

    try {
      const payloadBody = {
        slug: draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        date: draft.date,
        author: draft.author,
        category: draft.category,
        tags: draft.tags,
        primaryKeyword: draft.primaryKeyword,
        featureImage: draft.featureImage,
        content: draft.content
      };

      if (isCreateMode || !selectedSlug) {
        const payload = await managerFetch<{ post: BlogPostRecord }>("/api/portal/blog-posts", {
          method: "POST",
          body: JSON.stringify(payloadBody)
        });
        await loadPosts();
        setSelectedSlug(payload.post.slug);
        setIsCreateMode(false);
        applyPostToDraft(payload.post);
        setPageMessage(`Created post: ${payload.post.title}`);
      } else {
        const payload = await managerFetch<{ post: BlogPostRecord }>("/api/portal/blog-posts", {
          method: "PATCH",
          body: JSON.stringify({
            currentSlug: selectedSlug,
            ...payloadBody
          })
        });
        await loadPosts();
        setSelectedSlug(payload.post.slug);
        applyPostToDraft(payload.post);
        setPageMessage(`Updated post: ${payload.post.title}`);
      }
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to save blog post.");
    } finally {
      setIsSavingPost(false);
    }
  }

  async function handleDeletePost() {
    if (!session || !isBootstrapManager || !selectedSlug || isCreateMode) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${draft.title || selectedSlug}"? This permanently removes the markdown file.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeletingPost(true);
    setPortalError("");
    setPageMessage("");

    try {
      await managerFetch<{ success: boolean }>("/api/portal/blog-posts", {
        method: "DELETE",
        body: JSON.stringify({ slug: selectedSlug })
      });

      await loadPosts();
      setPageMessage(`Deleted post: ${selectedSlug}`);
      setSelectedSlug(null);
      setIsCreateMode(true);
      if (localImagePreviewUrlRef.current) {
        URL.revokeObjectURL(localImagePreviewUrlRef.current);
        localImagePreviewUrlRef.current = "";
      }
      setLocalImagePreviewUrl("");
      setImageUploadMessage("");
      setMarkdownImageUploadMessage("");
      setDraft(createEmptyDraft());
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to delete post.");
    } finally {
      setIsDeletingPost(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Blog Manager</h1>
          <p className="mt-4 text-sm text-ink/80">
            Supabase environment variables are missing. Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </p>
        </section>
      </main>
    );
  }

  if (isLoadingSession || (session && isLoadingManagerStatus)) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Loading manager blog workspace...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Blog Manager</h1>
          <p className="mt-4 text-sm text-ink/85">Sign in first to access the manager blog workspace.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
          >
            Open Portal Login
          </Link>
        </section>
      </main>
    );
  }

  if (!isBootstrapManager) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Blog Manager</h1>
          <p className="mt-4 text-sm text-ink/85">Only the manager can access this page.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
          >
            Back to Portal
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">Manager Blog Workspace</h1>
            <p className="mt-2 text-sm text-ink/80">
              Create, update, and delete blog markdown posts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal"
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Back to Portal
            </Link>
            <PortalNotificationCenter session={session} />
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Sign Out
            </button>
          </div>
        </div>

        {portalError ? (
          <p className="mt-4 rounded-lg border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
            {portalError}
          </p>
        ) : null}
        {pageMessage ? (
          <p className="mt-4 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
            {pageMessage}
          </p>
        ) : null}
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl uppercase text-ink">Blog Posts</h2>
            <button
              type="button"
              onClick={() => void loadPosts()}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 hover:underline"
            >
              Refresh
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="w-full rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3]"
          >
            + New Post
          </button>

          <input
            type="text"
            value={searchDraft}
            onChange={(event) => {
              setSearchDraft(event.target.value);
              setSidebarPage(1);
            }}
            placeholder="Search posts..."
            className="mt-3 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
          />

          <div className="mt-3 space-y-2">
            {isLoadingPosts ? <p className="text-sm text-ink/75">Loading posts...</p> : null}

            {!isLoadingPosts && filteredPosts.length === 0 ? (
              <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                No posts found.
              </p>
            ) : null}

            {paginatedSidebarPosts.map((post) => {
              const isSelected = !isCreateMode && selectedSlug === post.slug;
              return (
                <button
                  type="button"
                  key={post.slug}
                  onClick={() => void handleSelectPost(post.slug)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-[#a87700] bg-[#ffe8a3] shadow-[4px_4px_0_#a87700]"
                      : "border-ink/20 bg-white/75 hover:border-ink/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{post.title}</p>
                  <p className="mt-1 text-xs text-ink/70">{post.slug}</p>
                  <p className="mt-1 text-[0.68rem] text-ink/60">
                    {post.date} · Updated {formatDateTime(post.updatedAt)}
                  </p>
                </button>
              );
            })}

            {filteredPosts.length > 0 ? (
              <div className="rounded-lg border border-ink/20 bg-white px-3 py-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/65">
                  Showing {sidebarStartIndex}-{sidebarEndIndex} of {filteredPosts.length}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={sidebarPage <= 1}
                    className="inline-flex items-center rounded-full border border-ink/35 bg-mist px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/70">
                    Page {sidebarPage} / {totalSidebarPages}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarPage((currentPage) => Math.min(totalSidebarPages, currentPage + 1))
                    }
                    disabled={sidebarPage >= totalSidebarPages}
                    className="inline-flex items-center rounded-full border border-ink/35 bg-mist px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl uppercase leading-none text-ink">
              {isCreateMode ? "Create Post" : "Edit Post"}
            </h2>
            {!isCreateMode && selectedSlug ? (
              <a
                href={`/blog/${selectedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                Open Public Post
              </a>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-ink/70">
            Changes are saved in Supabase and go live immediately without rebuild.
          </p>

          {isLoadingPost ? (
            <p className="mt-4 text-sm text-ink/75">Loading selected post...</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Title
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Slug
                  <input
                    type="text"
                    value={draft.slug}
                    onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
                    placeholder="auto-from-title-if-empty"
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                </label>
              </div>

              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                Excerpt
                <textarea
                  rows={3}
                  value={draft.excerpt}
                  onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Date
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Author
                  <input
                    type="text"
                    value={draft.author}
                    onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Category
                  <input
                    type="text"
                    list="portal-blog-category-options"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                  <datalist id="portal-blog-category-options">
                    {categorySuggestions.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Tags (comma-separated)
                  <input
                    type="text"
                    value={draft.tags}
                    onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                  {filteredTagSuggestions.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5 normal-case">
                      {filteredTagSuggestions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSuggestionSelect(tag)}
                          className="inline-flex items-center rounded-full border border-[#1f56c2]/35 bg-[#e9f0ff] px-2 py-0.5 text-[0.68rem] font-semibold text-[#1f56c2]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Primary Keyword
                  <input
                    type="text"
                    value={draft.primaryKeyword}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, primaryKeyword: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                  />
                </label>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                  Feature Image Upload
                  <div className="mt-1 rounded-lg border border-ink/25 bg-white p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }
                        void handleUploadFeatureImage(file);
                        event.currentTarget.value = "";
                      }}
                      className="block w-full cursor-pointer text-sm normal-case tracking-normal text-ink file:mr-3 file:rounded-full file:border file:border-ink/25 file:bg-mist file:px-3 file:py-1 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-ink"
                    />
                    <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/60">
                      {isUploadingImage
                        ? "Uploading image..."
                        : draft.featureImage
                          ? `Saved as ${draft.featureImage}`
                          : "No image uploaded yet"}
                    </p>
                    {imageUploadMessage ? (
                      <p className="mt-1 text-[0.7rem] normal-case tracking-normal text-[#1f5c28]">
                        {imageUploadMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {featureImagePreviewSrc ? (
                <div className="rounded-lg border border-ink/25 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Feature Image Preview
                  </p>
                  <img
                    src={featureImagePreviewSrc}
                    alt="Featured preview"
                    className="mt-2 h-52 w-full rounded-lg border border-ink/15 bg-mist object-cover"
                  />
                </div>
              ) : null}

              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                Markdown Content
                <div className="mt-1 overflow-hidden rounded-xl border border-ink/25 bg-white">
                  <div className="flex flex-wrap gap-1 border-b border-ink/15 bg-mist/70 p-2">
                    <button
                      type="button"
                      onClick={() => insertMarkdownLinePrefix("# ")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownLinePrefix("## ")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAroundSelection("**", "**", "bold text")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAroundSelection("*", "*", "italic text")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAroundSelection("[", "](https://example.com)", "link text")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownAroundSelection("![", "](https://example.com/image.jpg)", "image alt")
                      }
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => markdownImageInputRef.current?.click()}
                      disabled={isUploadingMarkdownImage}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Image File
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownLinePrefix("- ")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      UL
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownLinePrefix("1. ")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      OL
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownLinePrefix("> ")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAroundSelection("`", "`", "inline code")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Code
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAroundSelection("```\n", "\n```", "code block")}
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Block
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          "\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value A | Value B | Value C |\n",
                          3
                        )
                      }
                      className="rounded-md border border-ink/25 bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                    >
                      Table
                    </button>
                    <input
                      ref={markdownImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }
                        void handleUploadMarkdownImage(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </div>
                  {isUploadingMarkdownImage || markdownImageUploadMessage ? (
                    <p className="border-b border-ink/10 px-3 py-2 text-[0.68rem] normal-case tracking-normal text-ink/70">
                      {isUploadingMarkdownImage
                        ? "Uploading image and inserting markdown..."
                        : markdownImageUploadMessage}
                    </p>
                  ) : null}

                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="border-b border-ink/15 lg:border-b-0 lg:border-r">
                      <p className="border-b border-ink/10 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink/65">
                        Editor
                      </p>
                      <textarea
                        ref={markdownEditorRef}
                        rows={24}
                        value={draft.content}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, content: event.target.value }))
                        }
                        className="h-[32rem] w-full resize-y border-0 px-3 py-3 font-mono text-xs normal-case tracking-normal text-ink outline-none"
                        placeholder="# Heading&#10;&#10;Write your blog content in markdown..."
                      />
                    </div>

                    <div>
                      <p className="border-b border-ink/10 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink/65">
                        Live Preview
                      </p>
                      <div className="h-[32rem] overflow-y-auto px-4 py-3 normal-case tracking-normal">
                        {draft.content.trim() ? (
                          <article
                            className="blog-prose max-w-none normal-case tracking-normal [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-ink/20 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-ink/25 [&_th]:border [&_th]:border-ink/20 [&_th]:bg-mist [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_td]:border [&_td]:border-ink/15 [&_td]:px-2 [&_td]:py-1.5"
                            dangerouslySetInnerHTML={{ __html: markdownPreviewHtml }}
                          />
                        ) : (
                          <p className="text-sm normal-case tracking-normal text-ink/60">
                            Start writing markdown to preview formatted output.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-ink/15 bg-mist/70 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/65">
                    Words: {markdownWordCount} | Est. read time: {markdownReadMinutes} min
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSavePost()}
                  disabled={isSavingPost || isDeletingPost || isUploadingImage || isUploadingMarkdownImage}
                  className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingPost ? "Saving..." : isCreateMode ? "Create Post" : "Update Post"}
                </button>
                {!isCreateMode ? (
                  <button
                    type="button"
                    onClick={() => void handleDeletePost()}
                    disabled={isDeletingPost || isSavingPost || isUploadingImage || isUploadingMarkdownImage}
                    className="inline-flex items-center rounded-full border-2 border-[#7f1010] bg-[#a51616] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#8d1414] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeletingPost ? "Deleting..." : "Delete Post"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleStartCreate}
                  disabled={isSavingPost || isDeletingPost || isUploadingImage || isUploadingMarkdownImage}
                  className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Reset Form
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
