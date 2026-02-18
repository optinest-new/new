"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";
import { PortalNotificationCenter } from "@/components/portal-notification-center";

type PortalProject = {
  id: string;
  name: string;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  summary: string | null;
  updated_at: string;
};

type ProjectUpdate = {
  id: string;
  title: string;
  body: string;
  progress: number | null;
  created_at: string;
};

type ProjectQuestion = {
  id: string;
  question: string;
  created_at: string;
};

type ProjectFile = {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  planning: "bg-[#d8ecff] text-[#134d7a]",
  in_progress: "bg-[#fff1c5] text-[#8a5a00]",
  review: "bg-[#e9dbff] text-[#4f2b88]",
  completed: "bg-[#d5f4e2] text-[#0b6a40]"
};

function formatDate(value: string | null): string {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeProjectSummaryHtml(value: string): string {
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

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdownInline(value: string): string {
  const withCode = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return withItalic.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    const normalizedUrl = /^https?:\/\//i.test(href) ? href : `https://${href}`;
    try {
      const url = new URL(normalizedUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return label;
      }
      return `<a href="${url.toString()}" target="_blank" rel="noreferrer">${label}</a>`;
    } catch {
      return label;
    }
  });
}

function renderMarkdownToHtml(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const chunks: string[] = [];
  let isInUnorderedList = false;
  let isInOrderedList = false;

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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      chunks.push(`<h${level}>${renderMarkdownInline(escapeHtml(headingMatch[2]))}</h${level}>`);
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
      continue;
    }

    closeLists();
    chunks.push(`<p>${renderMarkdownInline(escapeHtml(line))}</p>`);
  }

  closeLists();
  return chunks.join("");
}

function renderProjectSummaryContent(value: string | null): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) {
    return "";
  }

  const looksLikeHtml = /<\/?[a-z][^>]*>/i.test(trimmed);
  const html = looksLikeHtml ? trimmed : renderMarkdownToHtml(trimmed);
  return sanitizeProjectSummaryHtml(html);
}

function formatDeleteProjectError(message: string): string {
  if (message.includes("not_authorized")) {
    return "You do not have permission to delete this project.";
  }

  if (message.includes("project_not_found")) {
    return "This project was not found. It may have already been deleted.";
  }

  if (message.includes("project_required")) {
    return "Project id is missing.";
  }

  return message;
}

export default function CompletedProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const router = useRouter();

  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [project, setProject] = useState<PortalProject | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [projectQuestions, setProjectQuestions] = useState<ProjectQuestion[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [canManageProject, setCanManageProject] = useState(false);
  const [isReactivatingProject, setIsReactivatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

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
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loadCompletedProject = useCallback(async () => {
    if (!supabase || !session || !projectId) {
      return;
    }

    setIsLoadingProject(true);
    setPortalError("");

    const [projectResult, updatesResult, questionsResult, filesResult] = await Promise.all([
      supabase
        .from("projects")
        .select("id,name,status,progress,start_date,due_date,summary,updated_at")
        .eq("id", projectId)
        .single(),
      supabase
        .from("project_updates")
        .select("id,title,body,progress,created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("project_questions")
        .select("id,question,created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("project_files")
        .select("id,file_name,mime_type,size_bytes,created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(12)
    ]);

    setIsLoadingProject(false);

    if (projectResult.error) {
      setPortalError(projectResult.error.message);
      setProject(null);
      return;
    }

    if (updatesResult.error) {
      setPortalError(updatesResult.error.message);
      return;
    }

    if (questionsResult.error) {
      setPortalError(questionsResult.error.message);
      return;
    }

    if (filesResult.error) {
      setPortalError(filesResult.error.message);
      return;
    }

    setProject(projectResult.data as PortalProject);
    setProjectUpdates((updatesResult.data ?? []) as ProjectUpdate[]);
    setProjectQuestions((questionsResult.data ?? []) as ProjectQuestion[]);
    setProjectFiles((filesResult.data ?? []) as ProjectFile[]);
  }, [projectId, session, supabase]);

  useEffect(() => {
    if (!session || !projectId) {
      return;
    }

    void loadCompletedProject();
  }, [loadCompletedProject, projectId, session]);

  useEffect(() => {
    if (!supabase || !session || !projectId) {
      setCanManageProject(false);
      return;
    }

    let cancelled = false;

    supabase
      .rpc("is_project_admin", { project_uuid: projectId })
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }

        if (error) {
          setPortalError(error.message);
          setCanManageProject(false);
          return;
        }

        setCanManageProject(Boolean(data));
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, session, supabase]);

  async function handleReactivateProject() {
    if (!supabase || !project || !canManageProject || isReactivatingProject) {
      return;
    }

    setIsReactivatingProject(true);
    setPortalError("");

    const { error } = await supabase
      .from("projects")
      .update({
        status: "in_progress",
        progress: project.progress >= 100 ? 99 : project.progress
      })
      .eq("id", project.id);

    setIsReactivatingProject(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    router.push(`/portal?project=${project.id}`);
  }

  async function removeProjectStorageFiles(targetProjectId: string): Promise<string | null> {
    if (!supabase) {
      return "Supabase is not configured.";
    }

    const [projectFilesResult, questionMessageFilesResult] = await Promise.all([
      supabase.from("project_files").select("file_path").eq("project_id", targetProjectId),
      supabase
        .from("project_question_messages")
        .select("attachment_file_path")
        .eq("project_id", targetProjectId)
    ]);

    if (projectFilesResult.error) {
      return projectFilesResult.error.message;
    }

    if (questionMessageFilesResult.error) {
      return questionMessageFilesResult.error.message;
    }

    const filePaths = ((projectFilesResult.data ?? []) as Array<{ file_path: string | null }>)
      .map((entry) => entry.file_path)
      .filter((value): value is string => Boolean(value));
    const attachmentPaths = (
      (questionMessageFilesResult.data ?? []) as Array<{ attachment_file_path: string | null }>
    )
      .map((entry) => entry.attachment_file_path)
      .filter((value): value is string => Boolean(value));
    const uniquePaths = Array.from(new Set([...filePaths, ...attachmentPaths]));

    if (uniquePaths.length === 0) {
      return null;
    }

    const batchSize = 100;
    for (let index = 0; index < uniquePaths.length; index += batchSize) {
      const batch = uniquePaths.slice(index, index + batchSize);
      const { error } = await supabase.storage.from("project-files").remove(batch);
      if (error) {
        return error.message;
      }
    }

    return null;
  }

  async function handleDeleteProjectPermanently() {
    if (!supabase || !project || !canManageProject || isDeletingProject) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Permanently delete "${project.name}"? This removes all updates, files, messages, milestones, approvals, and project data. This cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingProject(true);
    setPortalError("");

    const storageError = await removeProjectStorageFiles(project.id);
    if (storageError) {
      setIsDeletingProject(false);
      setPortalError(storageError);
      return;
    }

    const { error } = await supabase.rpc("delete_project_permanently", {
      project_uuid: project.id
    });

    setIsDeletingProject(false);

    if (error) {
      setPortalError(formatDeleteProjectError(error.message));
      return;
    }

    router.push("/portal");
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
          <h1 className="font-display text-2xl uppercase text-ink">Supabase Not Configured</h1>
          <p className="mt-2 text-sm text-ink/80">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use the portal.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">
              Manager Completed Project View
            </p>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">Project Details</h1>
            {session?.user.email ? (
              <p className="mt-2 text-sm text-ink/80">
                Signed in as <span className="font-semibold">{session.user.email}</span>
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <PortalNotificationCenter session={session} />
            <Link
              href="/portal"
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
            >
              Back To Portal
            </Link>
            {session ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {isLoadingSession ? (
        <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
          <p className="text-sm text-ink/80">Checking your session...</p>
        </section>
      ) : null}

      {!isLoadingSession && !session ? (
        <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
          <p className="text-sm text-ink/80">Please sign in from the portal to view completed projects.</p>
          <Link
            href="/portal"
            className="mt-3 inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
          >
            Open Portal Login
          </Link>
        </section>
      ) : null}

      {session ? (
        <>
          {portalError ? (
            <section className="mt-6 rounded-2xl border border-[#d88] bg-[#fff1f1] px-4 py-3 text-sm text-[#7a1f1f] shadow-hard">
              {portalError}
            </section>
          ) : null}

          {isLoadingProject ? (
            <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
              <p className="text-sm text-ink/80">Loading completed project details...</p>
            </section>
          ) : null}

          {!isLoadingProject && project ? (
            <div className="mt-6 space-y-6">
              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl uppercase leading-none text-ink">{project.name}</h2>
                    <p className="mt-2 text-sm text-ink/75">
                      Start {formatDate(project.start_date)} · Due {formatDate(project.due_date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        statusStyles[project.status] || "bg-fog text-ink/70"
                      }`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                    {canManageProject && project.status === "completed" ? (
                      <button
                        type="button"
                        onClick={() => void handleReactivateProject()}
                        disabled={isReactivatingProject || isDeletingProject}
                        className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isReactivatingProject ? "Reactivating..." : "Set Active Again"}
                      </button>
                    ) : null}
                    {canManageProject ? (
                      <button
                        type="button"
                        onClick={() => void handleDeleteProjectPermanently()}
                        disabled={isReactivatingProject || isDeletingProject}
                        className="inline-flex items-center rounded-full border-2 border-[#7f1010] bg-[#a51616] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:bg-[#8d1414] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeletingProject ? "Deleting..." : "Delete Permanently"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {project.status !== "completed" ? (
                  <p className="mt-3 rounded-lg border border-[#e0ba47] bg-[#fff8cf] px-3 py-2 text-sm text-[#6f4a00]">
                    This project is not marked completed yet. Open it from active projects in the portal.
                  </p>
                ) : null}

                {project.summary ? (
                  <div className="mt-4 rounded-lg border border-ink/20 bg-white p-3">
                    <div
                      className="text-sm text-ink/80 [&_a]:text-[#2d5bd1] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold"
                      dangerouslySetInnerHTML={{
                        __html: renderProjectSummaryContent(project.summary)
                      }}
                    />
                  </div>
                ) : null}

                <div className="mt-4 rounded-lg border border-ink/20 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Final Progress
                    </p>
                    <p className="text-sm font-semibold text-ink">{project.progress}%</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-ink/20 bg-fog">
                    <div
                      className="h-full bg-[#4a83ff] transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink/60">Last updated: {formatDateTime(project.updated_at)}</p>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                  <h3 className="font-display text-xl uppercase text-ink">Progress Updates</h3>
                  {projectUpdates.length === 0 ? (
                    <p className="mt-3 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                      No updates posted.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {projectUpdates.map((update) => (
                        <article key={update.id} className="rounded-lg border border-ink/20 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-ink">{update.title}</p>
                            <p className="text-xs text-ink/60">{formatDateTime(update.created_at)}</p>
                          </div>
                          {update.progress !== null ? (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2d5bd1]">
                              Progress: {update.progress}%
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm text-ink/80">{update.body}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </article>

                <article className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                  <h3 className="font-display text-xl uppercase text-ink">Threads & Files</h3>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-ink/20 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Threads</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{projectQuestions.length}</p>
                    </div>
                    <div className="rounded-lg border border-ink/20 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Files</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{projectFiles.length}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">
                      Recent Thread Topics
                    </p>
                    {projectQuestions.length === 0 ? (
                      <p className="mt-2 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                        No questions posted.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {projectQuestions.map((question) => (
                          <div key={question.id} className="rounded-lg border border-ink/20 bg-white px-3 py-2">
                            <p className="text-sm font-semibold text-ink">{question.question}</p>
                            <p className="mt-1 text-xs text-ink/60">{formatDateTime(question.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">
                      Recent Files
                    </p>
                    {projectFiles.length === 0 ? (
                      <p className="mt-2 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                        No files uploaded.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {projectFiles.map((file) => (
                          <div key={file.id} className="rounded-lg border border-ink/20 bg-white px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-ink">{file.file_name}</p>
                              <p className="text-xs text-ink/60">{formatBytes(file.size_bytes)}</p>
                            </div>
                            <p className="mt-1 text-xs text-ink/60">{formatDateTime(file.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </section>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
