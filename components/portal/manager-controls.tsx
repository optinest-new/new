"use client";

import type { ProjectStatus, ClientDirectorySuggestion, PortalWorkspaceTabId } from "@/lib/portal-types";
import { projectStatuses } from "@/lib/portal-utils";

type ManagerControlsProps = {
  isManagerControlsOpen: boolean;
  newProjectName: string;
  newProjectClientEmail: string;
  newProjectStatus: ProjectStatus;
  newProjectProgress: string;
  newProjectStartDate: string;
  newProjectDueDate: string;
  newProjectSummary: string;
  isCreatingProject: boolean;
  assignmentMessage: string;
  selectedCreateClientSuggestion: ClientDirectorySuggestion | null;
  isLoadingNewProjectEmailSuggestions: boolean;
  newProjectEmailSuggestions: ClientDirectorySuggestion[];
  onSetNewProjectName: (value: string) => void;
  onSetNewProjectClientEmail: (value: string) => void;
  onSetNewProjectStatus: (value: ProjectStatus) => void;
  onSetNewProjectProgress: (value: string) => void;
  onSetNewProjectStartDate: (value: string) => void;
  onSetNewProjectDueDate: (value: string) => void;
  onSetNewProjectSummary: (value: string) => void;
  onSubmitCreateProject: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleOpen: () => void;
  onSwitchTab: (tab: PortalWorkspaceTabId) => void;
};

export function ManagerControls({
  isManagerControlsOpen,
  newProjectName, newProjectClientEmail, newProjectStatus, newProjectProgress,
  newProjectStartDate, newProjectDueDate, newProjectSummary,
  isCreatingProject, assignmentMessage,
  selectedCreateClientSuggestion, isLoadingNewProjectEmailSuggestions, newProjectEmailSuggestions,
  onSetNewProjectName, onSetNewProjectClientEmail, onSetNewProjectStatus, onSetNewProjectProgress,
  onSetNewProjectStartDate, onSetNewProjectDueDate, onSetNewProjectSummary,
  onSubmitCreateProject, onToggleOpen, onSwitchTab
}: ManagerControlsProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl uppercase text-ink">Manager Controls</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onSwitchTab("payment_mode_controls")} className="inline-flex items-center rounded-full border border-[#1f56c2] bg-[#1f56c2] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#1a4aa8]">Payment Mode</button>
          <button type="button" onClick={() => onSwitchTab("client_billing")} className="inline-flex items-center rounded-full border border-[#1f56c2] bg-[#1f56c2] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#1a4aa8]">Client Billing</button>
          <button type="button" onClick={onToggleOpen} className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-xl font-semibold leading-none text-ink transition hover:-translate-y-0.5" aria-label={isManagerControlsOpen ? "Hide manager controls" : "Show manager controls"}>
            {isManagerControlsOpen ? "−" : "+"}
          </button>
        </div>
      </div>

      {isManagerControlsOpen ? (
        <>
          <p className="mt-3 text-sm text-ink/75">You are the bootstrap manager. Create projects and assign clients by email.</p>
          {assignmentMessage ? <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">{assignmentMessage}</p> : null}
          <div className="mt-4">
            <form onSubmit={onSubmitCreateProject} className="rounded-lg border border-ink/20 bg-white p-3.5">
              <h3 className="text-sm font-semibold text-ink">Create Project + Assign Client</h3>
              <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Project Name</label>
                <input type="text" value={newProjectName} onChange={(e) => onSetNewProjectName(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="Client website revamp" required />
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Client Email</label>
                <input type="email" value={newProjectClientEmail} onChange={(e) => onSetNewProjectClientEmail(e.target.value)} autoComplete="email" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="client@company.com" required />
                {selectedCreateClientSuggestion?.full_name ? <p className="text-xs text-ink/70">Client name: <span className="font-semibold">{selectedCreateClientSuggestion.full_name}</span></p> : null}
                {isLoadingNewProjectEmailSuggestions ? <p className="text-xs text-ink/60">Finding matching emails...</p> : null}
                {!isLoadingNewProjectEmailSuggestions && newProjectClientEmail.trim().length >= 2 && newProjectEmailSuggestions.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-ink/20 bg-white">
                    {newProjectEmailSuggestions.map((suggestion) => (
                      <button key={suggestion.email} type="button" onClick={() => onSetNewProjectClientEmail(suggestion.email)} className="block w-full border-b border-ink/10 px-3 py-2 text-left last:border-b-0 hover:bg-mist">
                        <p className="text-xs font-semibold text-ink">{suggestion.full_name || "Client account"}</p>
                        <p className="text-xs text-ink/65">{suggestion.email}</p>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Status</label>
                    <select value={newProjectStatus} onChange={(e) => onSetNewProjectStatus(e.target.value as ProjectStatus)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60">
                      {projectStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Progress</label>
                    <input type="number" min={0} max={100} value={newProjectProgress} onChange={(e) => onSetNewProjectProgress(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" required />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Start Date</label>
                    <input type="date" value={newProjectStartDate} onChange={(e) => onSetNewProjectStartDate(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Due Date</label>
                    <input type="date" value={newProjectDueDate} onChange={(e) => onSetNewProjectDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  </div>
                </div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Project Summary (HTML / Markdown)</label>
                <textarea rows={3} value={newProjectSummary} onChange={(e) => onSetNewProjectSummary(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="Use HTML or Markdown, e.g. ## Launch prep or <p>Launch prep</p>" />
                <button type="submit" disabled={isCreatingProject} className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70">
                  {isCreatingProject ? "Creating..." : "Create & Assign"}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/70">Manager controls drawer is collapsed.</p>
      )}
    </section>
  );
}
