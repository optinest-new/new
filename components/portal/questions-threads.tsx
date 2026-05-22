"use client";

import type { ProjectQuestion, QuestionMessage } from "@/lib/portal-types";
import { formatDateTime } from "@/lib/portal-utils";

type QuestionsThreadsProps = {
  questionDraft: string;
  questionUrlDraft: string;
  questionFileDraft: File | null;
  questionFilePreviewUrl: string | null;
  isSubmittingQuestion: boolean;
  filteredProjectQuestions: ProjectQuestion[];
  projectQuestions: ProjectQuestion[];
  messagesByQuestionId: Record<string, QuestionMessage[]>;
  replyDrafts: Record<string, string>;
  replyUrlDrafts: Record<string, string>;
  replyFileDrafts: Record<string, File | null>;
  replyFilePreviewUrls: Record<string, string | null>;
  replySubmittingByQuestionId: Record<string, boolean>;
  questionMessageAttachmentUrls: Record<string, string>;
  currentUserId: string;
  isBootstrapManager: boolean;
  memberRolesByUserId: Record<string, string>;
  onSubmitQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  onSetQuestionDraft: (value: string) => void;
  onSetQuestionUrlDraft: (value: string) => void;
  onQuestionFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitThreadReply: (questionId: string, e: React.FormEvent<HTMLFormElement>) => void;
  onSetReplyDrafts: (value: React.SetStateAction<Record<string, string>>) => void;
  onSetReplyUrlDrafts: (value: React.SetStateAction<Record<string, string>>) => void;
  onThreadReplyFileChange: (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function QuestionsThreads({
  questionDraft, questionUrlDraft, questionFileDraft, questionFilePreviewUrl,
  isSubmittingQuestion, filteredProjectQuestions, projectQuestions,
  messagesByQuestionId, replyDrafts, replyUrlDrafts, replyFileDrafts, replyFilePreviewUrls,
  replySubmittingByQuestionId, questionMessageAttachmentUrls,
  currentUserId, isBootstrapManager, memberRolesByUserId,
  onSubmitQuestion, onSetQuestionDraft, onSetQuestionUrlDraft, onQuestionFileChange,
  onSubmitThreadReply, onSetReplyDrafts, onSetReplyUrlDrafts, onThreadReplyFileChange
}: QuestionsThreadsProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <h3 className="font-display text-xl uppercase text-ink">Questions & Threads</h3>
      <form onSubmit={onSubmitQuestion} className="mt-3 space-y-3">
        <textarea value={questionDraft} onChange={(e) => onSetQuestionDraft(e.target.value)} placeholder="Ask a question about scope, status, timeline, or deliverables..." rows={4} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" required />
        <input type="text" value={questionUrlDraft} onChange={(e) => onSetQuestionUrlDraft(e.target.value)} placeholder="Optional reference URL (https://...)" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
        <label className="inline-flex cursor-pointer items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:-translate-y-0.5">
          <input type="file" onChange={onQuestionFileChange} className="sr-only" disabled={isSubmittingQuestion} />
          Add Attachment
        </label>
        {questionFileDraft ? <p className="text-xs text-ink/65">Selected file: {questionFileDraft.name}</p> : null}
        {(() => {
          const previewUrl = questionFilePreviewUrl;
          if (!previewUrl) return null;
          return (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[240px]">
              <img src={previewUrl} alt="Question attachment preview" className="w-full rounded-lg border border-ink/20 object-cover" />
            </a>
          );
        })()}
        <button type="submit" disabled={isSubmittingQuestion} className="inline-flex items-center rounded-full border-2 border-[#0c6fbe] bg-[#0c6fbe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#0a5ea5] disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmittingQuestion ? "Sending..." : "Start Thread"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {filteredProjectQuestions.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {projectQuestions.length === 0 ? "No questions yet." : "No threads match your current search/filter."}
          </p>
        ) : null}
        {filteredProjectQuestions.map((question, threadIndex) => {
          const threadMessages = messagesByQuestionId[question.id] || [];
          const hasThreadAttachment = threadMessages.some((m) => Boolean(m.attachment_file_path || m.attachment_url));

          return (
            <article key={question.id} className="rounded-lg border border-ink/20 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${hasThreadAttachment ? "border-[#9cc9f3] bg-[#d8ecff] text-[#134d7a]" : "border-[#d2ab19] bg-[#fff1a8] text-[#6f4a00]"}`} title={hasThreadAttachment ? "Thread with attachment" : "Thread"} aria-label={hasThreadAttachment ? "Thread with attachment" : "Thread"}>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                      <path d="M4.9 4.5h14.2c1.1 0 1.9.8 1.9 1.9v9.2c0 1.1-.8 1.9-1.9 1.9h-9.7l-4.5 3v-3H4.9c-1.1 0-1.9-.8-1.9-1.9V6.4c0-1.1.8-1.9 1.9-1.9zm.1 2v7.8h1.9v1.8l2.8-1.8h9.4V6.5z" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-ink">{question.question}</p>
                </div>
                <p className="text-xs text-ink/60">{formatDateTime(question.created_at)}</p>
              </div>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/55">Thread {threadIndex + 1}</p>

              <div className="mt-3 space-y-2">
                {threadMessages.map((message) => {
                  const isCurrentUserMessage = message.author_id === currentUserId;
                  const roleLabel = isCurrentUserMessage ? "you" : isBootstrapManager ? memberRolesByUserId[message.author_id] || "manager" : memberRolesByUserId[message.author_id] || "client";

                  return (
                    <div key={message.id} className={`max-w-[88%] rounded-md border p-2 ${isCurrentUserMessage ? "ml-auto border-[#d2ab19] bg-[#fff1a8]" : "mr-auto border-ink/20 bg-mist/70"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">{roleLabel}</p>
                        <p className="text-[0.68rem] text-ink/55">{formatDateTime(message.created_at)}</p>
                      </div>
                      <p className="mt-1 text-sm text-ink/85">{message.message}</p>
                      {message.attachment_url ? (
                        <p className="mt-1 text-xs">
                          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#2d5bd1] underline underline-offset-2">{message.attachment_url}</a>
                        </p>
                      ) : null}
                      {message.attachment_file_path ? (
                        <div className="mt-1">
                          {questionMessageAttachmentUrls[message.id] ? (
                            message.attachment_mime_type?.startsWith("image/") ? (
                              <a href={questionMessageAttachmentUrls[message.id]} target="_blank" rel="noopener noreferrer" className="block max-w-[220px]">
                                <img src={questionMessageAttachmentUrls[message.id]} alt={message.attachment_file_name || "Attached image"} className="w-full rounded border border-ink/20 object-cover" />
                              </a>
                            ) : (
                              <a href={questionMessageAttachmentUrls[message.id]} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#2d5bd1] underline underline-offset-2">{message.attachment_file_name || "View attachment"}</a>
                            )
                          ) : (
                            <p className="text-xs text-ink/60">{message.attachment_file_name || "Attachment"}</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={(event) => void onSubmitThreadReply(question.id, event)} className="mt-3 space-y-2 rounded-md border border-ink/15 bg-white p-2">
                <textarea rows={2} value={replyDrafts[question.id] || ""} onChange={(event) => onSetReplyDrafts((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Reply to this thread..." className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" required />
                <input type="text" value={replyUrlDrafts[question.id] || ""} onChange={(event) => onSetReplyUrlDrafts((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Optional URL" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                <label className="inline-flex cursor-pointer items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:-translate-y-0.5">
                  <input type="file" onChange={(event) => onThreadReplyFileChange(question.id, event)} className="sr-only" disabled={Boolean(replySubmittingByQuestionId[question.id])} />
                  Add Attachment
                </label>
                {replyFileDrafts[question.id] ? <p className="text-xs text-ink/65">Selected file: {replyFileDrafts[question.id]?.name}</p> : null}
                {(() => {
                  const previewUrl = replyFilePreviewUrls[question.id];
                  if (!previewUrl) return null;
                  return (
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[220px]">
                      <img src={previewUrl} alt="Reply attachment preview" className="w-full rounded border border-ink/20 object-cover" />
                    </a>
                  );
                })()}
                <button type="submit" disabled={Boolean(replySubmittingByQuestionId[question.id])} className="inline-flex items-center rounded-full border border-[#15803d] bg-[#dcfce7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#166534] transition hover:-translate-y-0.5 hover:bg-[#bbf7d0] disabled:cursor-not-allowed disabled:opacity-70">
                  {replySubmittingByQuestionId[question.id] ? "Sending..." : "Send Reply"}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
