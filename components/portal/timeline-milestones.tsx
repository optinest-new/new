"use client";

import type { ProjectMilestone, MilestoneStatus } from "@/lib/portal-types";
import { formatDate, formatDateTime, milestoneStatusStyles, milestoneStatuses } from "@/lib/portal-utils";

type TimelineMilestonesProps = {
  projectMilestones: ProjectMilestone[];
  filteredProjectMilestones: ProjectMilestone[];
  isProjectAdmin: boolean;
  milestoneTitleDraft: string;
  milestoneDetailsDraft: string;
  milestoneDueDateDraft: string;
  isCreatingMilestone: boolean;
  onSetMilestoneTitleDraft: (value: string) => void;
  onSetMilestoneDetailsDraft: (value: string) => void;
  onSetMilestoneDueDateDraft: (value: string) => void;
  onCreateMilestone: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateMilestoneStatus: (id: string, status: MilestoneStatus) => void;
};

export function TimelineMilestones({
  projectMilestones, filteredProjectMilestones, isProjectAdmin,
  milestoneTitleDraft, milestoneDetailsDraft, milestoneDueDateDraft, isCreatingMilestone,
  onSetMilestoneTitleDraft, onSetMilestoneDetailsDraft, onSetMilestoneDueDateDraft,
  onCreateMilestone, onUpdateMilestoneStatus
}: TimelineMilestonesProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl uppercase text-ink">Project Timeline & Milestones</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          {filteredProjectMilestones.length} shown
        </span>
      </div>

      {isProjectAdmin ? (
        <form onSubmit={onCreateMilestone} className="mt-3 rounded-lg border border-ink/20 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Add Milestone</p>
          <div className="mt-2 grid gap-2 md:grid-cols-[1.2fr_1fr_auto]">
            <input type="text" value={milestoneTitleDraft} onChange={(e) => onSetMilestoneTitleDraft(e.target.value)} placeholder="Milestone title" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" required />
            <input type="date" value={milestoneDueDateDraft} onChange={(e) => onSetMilestoneDueDateDraft(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
            <button type="submit" disabled={isCreatingMilestone} className="inline-flex items-center justify-center rounded-full border border-[#0f7663] bg-[#d1fae5] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#065f46] transition hover:bg-[#bbf7d0] disabled:cursor-not-allowed disabled:opacity-70">
              {isCreatingMilestone ? "Adding..." : "Add"}
            </button>
          </div>
          <textarea rows={2} value={milestoneDetailsDraft} onChange={(e) => onSetMilestoneDetailsDraft(e.target.value)} placeholder="Optional details" className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
        </form>
      ) : null}

      <div className="mt-4 space-y-2">
        {filteredProjectMilestones.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {projectMilestones.length === 0 ? "No milestones added yet." : "No milestones match your current filters."}
          </p>
        ) : null}
        {filteredProjectMilestones.map((milestone) => (
          <article key={milestone.id} className="rounded-lg border border-ink/20 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{milestone.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${milestoneStatusStyles[milestone.status]}`}>
                {milestone.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/60">Due {formatDate(milestone.due_date)} · Added {formatDateTime(milestone.created_at)}</p>
            {milestone.details ? <p className="mt-2 text-sm text-ink/80">{milestone.details}</p> : null}
            {isProjectAdmin ? (
              <div className="mt-2">
                <label className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink/65">Status</label>
                <select value={milestone.status} onChange={(e) => onUpdateMilestoneStatus(milestone.id, e.target.value as MilestoneStatus)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60 sm:max-w-[220px]">
                  {milestoneStatuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                </select>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
