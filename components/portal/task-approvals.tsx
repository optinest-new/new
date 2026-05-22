"use client";

import type { ProjectApprovalTask, ApprovalStatus } from "@/lib/portal-types";
import { formatDateTime, approvalStatusStyles, approvalStatuses } from "@/lib/portal-utils";

type TaskApprovalsProps = {
  projectApprovalTasks: ProjectApprovalTask[];
  filteredProjectApprovalTasks: ProjectApprovalTask[];
  isProjectAdmin: boolean;
  approvalTitleDraft: string;
  approvalDetailsDraft: string;
  isCreatingApprovalTask: boolean;
  approvalResponseDrafts: Record<string, string>;
  approvalSubmittingById: Record<string, boolean>;
  onSetApprovalTitleDraft: (value: string) => void;
  onSetApprovalDetailsDraft: (value: string) => void;
  onCreateApprovalTask: (e: React.FormEvent<HTMLFormElement>) => void;
  onSetApprovalResponseDrafts: (value: React.SetStateAction<Record<string, string>>) => void;
  onRespondApprovalTask: (taskId: string, status: "approved" | "changes_requested") => void;
  onReopenApprovalTask?: (taskId: string) => void;
};

export function TaskApprovals({
  projectApprovalTasks, filteredProjectApprovalTasks, isProjectAdmin,
  approvalTitleDraft, approvalDetailsDraft, isCreatingApprovalTask,
  approvalResponseDrafts, approvalSubmittingById,
  onSetApprovalTitleDraft, onSetApprovalDetailsDraft, onCreateApprovalTask,
  onSetApprovalResponseDrafts, onRespondApprovalTask, onReopenApprovalTask
}: TaskApprovalsProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl uppercase text-ink">Task Approvals</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          {filteredProjectApprovalTasks.length} shown
        </span>
      </div>

      {isProjectAdmin ? (
        <form onSubmit={onCreateApprovalTask} className="mt-3 rounded-lg border border-ink/20 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Request Approval</p>
          <input type="text" value={approvalTitleDraft} onChange={(e) => onSetApprovalTitleDraft(e.target.value)} placeholder="Deliverable / task title" className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" required />
          <textarea rows={2} value={approvalDetailsDraft} onChange={(e) => onSetApprovalDetailsDraft(e.target.value)} placeholder="What should the client approve?" className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
          <button type="submit" disabled={isCreatingApprovalTask} className="mt-2 inline-flex items-center rounded-full border border-[#b45309] bg-[#fde68a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#7c2d12] transition hover:bg-[#fcd34d] disabled:cursor-not-allowed disabled:opacity-70">
            {isCreatingApprovalTask ? "Sending..." : "Send For Approval"}
          </button>
        </form>
      ) : null}

      <div className="mt-4 space-y-2">
        {filteredProjectApprovalTasks.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {projectApprovalTasks.length === 0 ? "No approval tasks yet." : "No approval tasks match your current filters."}
          </p>
        ) : null}
        {filteredProjectApprovalTasks.map((task) => {
          const canRespond = !isProjectAdmin && task.status === "pending";
          return (
            <article key={task.id} className="rounded-lg border border-ink/20 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{task.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${approvalStatusStyles[task.status]}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/60">Requested {formatDateTime(task.created_at)}</p>
              {task.details ? <p className="mt-2 text-sm text-ink/80">{task.details}</p> : null}
              {task.client_note ? <p className="mt-2 rounded bg-mist px-2 py-1 text-sm text-ink/80">Client note: {task.client_note}</p> : null}
              {task.decided_at ? <p className="mt-1 text-xs text-ink/60">Decision: {formatDateTime(task.decided_at)}</p> : null}
              {canRespond ? (
                <div className="mt-2 space-y-2">
                  <textarea rows={2} value={approvalResponseDrafts[task.id] || ""} onChange={(e) => onSetApprovalResponseDrafts((current) => ({ ...current, [task.id]: e.target.value }))} placeholder="Optional note for your decision" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void onRespondApprovalTask(task.id, "approved")} disabled={Boolean(approvalSubmittingById[task.id])} className="inline-flex items-center rounded-full border border-[#0b6a40] bg-[#d5f4e2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#0b6a40] disabled:cursor-not-allowed disabled:opacity-70">
                      {approvalSubmittingById[task.id] ? "Saving..." : "Approve"}
                    </button>
                    <button type="button" onClick={() => void onRespondApprovalTask(task.id, "changes_requested")} disabled={Boolean(approvalSubmittingById[task.id])} className="inline-flex items-center rounded-full border border-[#892727] bg-[#ffe2e2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#892727] disabled:cursor-not-allowed disabled:opacity-70">
                      {approvalSubmittingById[task.id] ? "Saving..." : "Request Changes"}
                    </button>
                  </div>
                </div>
              ) : null}
              {isProjectAdmin && task.status !== "pending" ? (
                <button type="button" onClick={() => onReopenApprovalTask?.(task.id)} disabled={Boolean(approvalSubmittingById[task.id])} className="mt-2 inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink disabled:cursor-not-allowed disabled:opacity-70">
                  Re-open Approval
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
