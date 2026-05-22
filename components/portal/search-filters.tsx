"use client";

import type { MilestoneStatus, ApprovalStatus, AccessItemStatus } from "@/lib/portal-types";
import { milestoneStatuses, approvalStatuses, accessItemStatuses } from "@/lib/portal-utils";

type SearchFiltersProps = {
  contentSearchDraft: string;
  milestoneFilterStatus: "all" | MilestoneStatus;
  approvalFilterStatus: "all" | ApprovalStatus;
  accessStatusFilter: "all" | AccessItemStatus;
  onSetContentSearchDraft: (value: string) => void;
  onSetMilestoneFilterStatus: (value: "all" | MilestoneStatus) => void;
  onSetApprovalFilterStatus: (value: "all" | ApprovalStatus) => void;
  onSetAccessStatusFilter: (value: "all" | AccessItemStatus) => void;
};

export function SearchFilters({
  contentSearchDraft, milestoneFilterStatus, approvalFilterStatus, accessStatusFilter,
  onSetContentSearchDraft, onSetMilestoneFilterStatus, onSetApprovalFilterStatus, onSetAccessStatusFilter
}: SearchFiltersProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <h3 className="font-display text-xl uppercase text-ink">Search & Filters</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <input type="text" value={contentSearchDraft} onChange={(e) => onSetContentSearchDraft(e.target.value)} placeholder="Search updates, milestones, approvals, access, threads, files..." className="md:col-span-4 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          Milestone Status
          <select value={milestoneFilterStatus} onChange={(e) => onSetMilestoneFilterStatus(e.target.value as "all" | MilestoneStatus)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60">
            <option value="all">All</option>
            {milestoneStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          Approval Status
          <select value={approvalFilterStatus} onChange={(e) => onSetApprovalFilterStatus(e.target.value as "all" | ApprovalStatus)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60">
            <option value="all">All</option>
            {approvalStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          Access Status
          <select value={accessStatusFilter} onChange={(e) => onSetAccessStatusFilter(e.target.value as "all" | AccessItemStatus)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60">
            <option value="all">All</option>
            {accessItemStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
