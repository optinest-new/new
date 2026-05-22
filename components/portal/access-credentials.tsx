"use client";

import type { ClientIntakeProfile, ClientServiceNeed, AccessItemStatus, ProjectAccessItem, AccessItemDraft, AccessItemVisibilityField, AccessItemVisibilityState } from "@/lib/portal-types";
import { formatDateTime, clientServiceNeedOptions, accessItemStatuses, accessStatusStyles, defaultAccessItemVisibility } from "@/lib/portal-utils";

type AccessCredentialsProps = {
  isProjectAdmin: boolean;
  projectClientIntake: ClientIntakeProfile | null;
  isClientIntakeOpen: boolean;
  intakeCompanyNameDraft: string;
  intakeWebsiteUrlDraft: string;
  intakeTargetAudienceDraft: string;
  intakePrimaryGoalDraft: string;
  intakeSecondaryGoalDraft: string;
  intakeTimelineGoalDraft: string;
  intakeSuccessMetricsDraft: string;
  intakeCmsPlatformDraft: string;
  intakeNotesDraft: string;
  intakeServiceNeedsDraft: ClientServiceNeed[];
  isSavingClientIntake: boolean;
  isGeneratingAccessChecklist: boolean;
  isAccessChecklistOpen: boolean;
  accessStatusCounts: { missing: number; submitted: number; verified: number; not_needed: number };
  filteredProjectAccessItems: ProjectAccessItem[];
  projectAccessItems: ProjectAccessItem[];
  accessItemDrafts: Record<string, AccessItemDraft>;
  expandedAccessItemIds: Record<string, boolean>;
  accessFieldVisibilityById: Record<string, AccessItemVisibilityState>;
  savingAccessItemById: Record<string, boolean>;
  onSetIsClientIntakeOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSetIntakeCompanyNameDraft: (value: string) => void;
  onSetIntakeWebsiteUrlDraft: (value: string) => void;
  onSetIntakeTargetAudienceDraft: (value: string) => void;
  onSetIntakePrimaryGoalDraft: (value: string) => void;
  onSetIntakeSecondaryGoalDraft: (value: string) => void;
  onSetIntakeTimelineGoalDraft: (value: string) => void;
  onSetIntakeSuccessMetricsDraft: (value: string) => void;
  onSetIntakeCmsPlatformDraft: (value: string) => void;
  onSetIntakeNotesDraft: (value: string) => void;
  onHandleToggleServiceNeed: (value: ClientServiceNeed) => void;
  onSaveClientIntake: (e: React.FormEvent<HTMLFormElement>) => void;
  onGenerateAccessChecklist: () => void;
  onSetIsAccessChecklistOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  onToggleAccessItem: (itemId: string) => void;
  onAccessDraftChange: (itemId: string, field: keyof AccessItemDraft, value: string) => void;
  onToggleAccessFieldVisibility: (itemId: string, field: AccessItemVisibilityField) => void;
  onSaveAccessItem: (itemId: string) => void;
};

export function AccessCredentials({
  isProjectAdmin, projectClientIntake, isClientIntakeOpen,
  intakeCompanyNameDraft, intakeWebsiteUrlDraft, intakeTargetAudienceDraft,
  intakePrimaryGoalDraft, intakeSecondaryGoalDraft, intakeTimelineGoalDraft,
  intakeSuccessMetricsDraft, intakeCmsPlatformDraft, intakeNotesDraft,
  intakeServiceNeedsDraft, isSavingClientIntake,
  isGeneratingAccessChecklist, isAccessChecklistOpen,
  accessStatusCounts, filteredProjectAccessItems, projectAccessItems,
  accessItemDrafts, expandedAccessItemIds, accessFieldVisibilityById, savingAccessItemById,
  onSetIsClientIntakeOpen, onSetIntakeCompanyNameDraft, onSetIntakeWebsiteUrlDraft,
  onSetIntakeTargetAudienceDraft, onSetIntakePrimaryGoalDraft, onSetIntakeSecondaryGoalDraft,
  onSetIntakeTimelineGoalDraft, onSetIntakeSuccessMetricsDraft, onSetIntakeCmsPlatformDraft,
  onSetIntakeNotesDraft, onHandleToggleServiceNeed, onSaveClientIntake,
  onGenerateAccessChecklist, onSetIsAccessChecklistOpen,
  onToggleAccessItem, onAccessDraftChange, onToggleAccessFieldVisibility, onSaveAccessItem
}: AccessCredentialsProps) {
  const renderEyeToggle = (itemId: string, field: AccessItemVisibilityField, isVisible: boolean) => (
    <button type="button" onClick={() => onToggleAccessFieldVisibility(itemId, field)} className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75" aria-label={isVisible ? `Hide ${field}` : `Show ${field}`} title={isVisible ? "Hide" : "Show"}>
      {isVisible ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 3l18 18" /><path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" /><path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl uppercase text-ink">
          {isProjectAdmin ? "Access & Credentials Checklist" : "Client Intake & Access"}
        </h3>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
          {isProjectAdmin ? "Manager view" : "Compact workspace"}
        </span>
      </div>

      <div className={isProjectAdmin ? "mt-3 grid gap-3" : "mt-3 grid gap-3 xl:grid-cols-2"}>
        {!isProjectAdmin ? (
          <article className="rounded-lg border border-ink/20 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Business Goals & Scope</p>
                <p className="mt-1 text-[0.72rem] text-ink/65">
                  {projectClientIntake ? `Last updated ${formatDateTime(projectClientIntake.updated_at)}` : "No intake saved yet"}
                </p>
              </div>
              <button type="button" onClick={() => onSetIsClientIntakeOpen((current) => !current)} className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink">
                {isClientIntakeOpen ? "Hide Intake" : "Edit Intake"}
              </button>
            </div>

            {!isClientIntakeOpen ? (
              <div className="mt-3 space-y-2 text-sm text-ink/80">
                <p><span className="font-semibold text-ink">Company:</span> {intakeCompanyNameDraft.trim() || "Not set"}</p>
                <p><span className="font-semibold text-ink">Website:</span> {intakeWebsiteUrlDraft.trim() ? <a href={intakeWebsiteUrlDraft} target="_blank" rel="noreferrer" className="underline">{intakeWebsiteUrlDraft}</a> : "Not set"}</p>
                <p><span className="font-semibold text-ink">Services:</span> {intakeServiceNeedsDraft.length > 0 ? intakeServiceNeedsDraft.map((value) => value.replace("_", " ")).join(", ") : "None selected"}</p>
              </div>
            ) : (
              <form onSubmit={onSaveClientIntake} className="mt-3 space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input type="text" value={intakeCompanyNameDraft} onChange={(e) => onSetIntakeCompanyNameDraft(e.target.value)} placeholder="Business name" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <input type="text" value={intakeWebsiteUrlDraft} onChange={(e) => onSetIntakeWebsiteUrlDraft(e.target.value)} placeholder="Website URL" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <textarea rows={2} value={intakeTargetAudienceDraft} onChange={(e) => onSetIntakeTargetAudienceDraft(e.target.value)} placeholder="Target audience" className="md:col-span-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <textarea rows={2} value={intakePrimaryGoalDraft} onChange={(e) => onSetIntakePrimaryGoalDraft(e.target.value)} placeholder="Primary goal" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <textarea rows={2} value={intakeSecondaryGoalDraft} onChange={(e) => onSetIntakeSecondaryGoalDraft(e.target.value)} placeholder="Secondary goal" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <input type="text" value={intakeTimelineGoalDraft} onChange={(e) => onSetIntakeTimelineGoalDraft(e.target.value)} placeholder="Timeline goal" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <input type="text" value={intakeSuccessMetricsDraft} onChange={(e) => onSetIntakeSuccessMetricsDraft(e.target.value)} placeholder="Success metrics" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <input type="text" value={intakeCmsPlatformDraft} onChange={(e) => onSetIntakeCmsPlatformDraft(e.target.value)} placeholder="CMS platform" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                  <textarea rows={2} value={intakeNotesDraft} onChange={(e) => onSetIntakeNotesDraft(e.target.value)} placeholder="Additional notes" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Services Needed</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clientServiceNeedOptions.map((option) => {
                      const isActive = intakeServiceNeedsDraft.includes(option.value);
                      return (
                        <button key={option.value} type="button" onClick={() => onHandleToggleServiceNeed(option.value)} className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition ${isActive ? "border-ink/70 bg-ink text-mist" : "border-ink/30 bg-white text-ink hover:border-ink/60"}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" disabled={isSavingClientIntake} className="inline-flex items-center rounded-full border border-[#0f7663] bg-[#0f7663] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#0c5f4f] disabled:cursor-not-allowed disabled:opacity-70">
                    {isSavingClientIntake ? "Saving..." : "Save Intake"}
                  </button>
                  <button type="button" onClick={() => onSetIsClientIntakeOpen(false)} className="inline-flex items-center rounded-full border border-ink/30 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                    Collapse
                  </button>
                </div>
              </form>
            )}
          </article>
        ) : null}

        <article className="rounded-lg border border-ink/20 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Access & Credentials Checklist</p>
              <p className="mt-1 text-[0.72rem] text-ink/65">Sensitive fields are visible only to project members.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void onGenerateAccessChecklist()} disabled={isGeneratingAccessChecklist || intakeServiceNeedsDraft.length === 0} className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink disabled:cursor-not-allowed disabled:opacity-70">
                {isGeneratingAccessChecklist ? "Generating..." : "Generate"}
              </button>
              <button type="button" onClick={() => onSetIsAccessChecklistOpen((current) => !current)} className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink">
                {isAccessChecklistOpen ? "Hide List" : "Open List"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ffe2e2] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#892727]">Missing {accessStatusCounts.missing}</span>
            <span className="rounded-full bg-[#fff5cf] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#8a5a00]">Submitted {accessStatusCounts.submitted}</span>
            <span className="rounded-full bg-[#d5f4e2] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#0b6a40]">Verified {accessStatusCounts.verified}</span>
            <span className="rounded-full bg-[#e7ecff] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#254084]">Not needed {accessStatusCounts.not_needed}</span>
          </div>

          {isAccessChecklistOpen ? (
            <div className="mt-3 space-y-2">
              {filteredProjectAccessItems.length === 0 ? (
                <p className="rounded-lg border border-ink/20 bg-mist px-3 py-2 text-sm text-ink/75">
                  {projectAccessItems.length === 0 ? "No access checklist items yet. Save intake and generate checklist." : "No access items match your current filters."}
                </p>
              ) : null}
              {filteredProjectAccessItems.map((item) => {
                const draft = accessItemDrafts[item.id];
                const isItemOpen = Boolean(expandedAccessItemIds[item.id]);
                const accessFieldVisibility = accessFieldVisibilityById[item.id] ?? defaultAccessItemVisibility;
                const savedFields = [
                  draft?.login_url.trim() ? "URL" : null,
                  draft?.account_email.trim() ? "Email" : null,
                  draft?.username.trim() ? "Username" : null,
                  draft?.secret_value.trim() ? "Password/token" : null,
                  draft?.secure_link.trim() ? "Secure link" : null
                ].filter((value): value is string => Boolean(value));
                if (!draft) return null;

                return (
                  <article key={item.id} className="rounded-lg border border-ink/20 bg-mist px-3 py-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="mt-0.5 text-[0.72rem] text-ink/60">{item.service_area || "general"} · Updated {formatDateTime(item.updated_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${accessStatusStyles[draft.status]}`}>{draft.status.replace("_", " ")}</span>
                        <button type="button" onClick={() => onToggleAccessItem(item.id)} className="inline-flex items-center rounded-full border border-ink/30 bg-white px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink">
                          {isItemOpen ? "Hide" : "Open"}
                        </button>
                      </div>
                    </div>
                    {item.description ? <p className="mt-1 text-xs text-ink/75">{item.description}</p> : null}
                    {!isItemOpen ? (
                      <p className="mt-1 text-xs text-ink/65">{savedFields.length > 0 ? `Saved fields: ${savedFields.join(", ")}` : "No credentials saved yet."}</p>
                    ) : (
                      <>
                        <div className="mt-2 grid gap-2 md:grid-cols-3 relative">
                          <select value={draft.status} onChange={(e) => onAccessDraftChange(item.id, "status", e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60">
                            {accessItemStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                          </select>
                          <div className="relative">
                            <input type={accessFieldVisibility.login_url ? "text" : "password"} value={draft.login_url} onChange={(e) => onAccessDraftChange(item.id, "login_url", e.target.value)} placeholder="Login URL" autoComplete="new-password" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60" />
                            {renderEyeToggle(item.id, "login_url", accessFieldVisibility.login_url)}
                          </div>
                        </div>
                        <div className="relative mt-2">
                          <input type={accessFieldVisibility.account_email ? "text" : "password"} value={draft.account_email} onChange={(e) => onAccessDraftChange(item.id, "account_email", e.target.value)} placeholder="Account email" autoComplete="new-password" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60" />
                          {renderEyeToggle(item.id, "account_email", accessFieldVisibility.account_email)}
                        </div>
                        <div className="relative mt-2">
                          <input type={accessFieldVisibility.username ? "text" : "password"} value={draft.username} onChange={(e) => onAccessDraftChange(item.id, "username", e.target.value)} placeholder="Username" autoComplete="new-password" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60" />
                          {renderEyeToggle(item.id, "username", accessFieldVisibility.username)}
                        </div>
                        <div className="relative mt-2">
                          <input type={accessFieldVisibility.secret_value ? "text" : "password"} value={draft.secret_value} onChange={(e) => onAccessDraftChange(item.id, "secret_value", e.target.value)} placeholder="Password / token" autoComplete="new-password" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60" />
                          {renderEyeToggle(item.id, "secret_value", accessFieldVisibility.secret_value)}
                        </div>
                        <div className="relative mt-2">
                          <input type={accessFieldVisibility.secure_link ? "text" : "password"} value={draft.secure_link} onChange={(e) => onAccessDraftChange(item.id, "secure_link", e.target.value)} placeholder="Secure share link" autoComplete="new-password" className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60" />
                          {renderEyeToggle(item.id, "secure_link", accessFieldVisibility.secure_link)}
                        </div>
                        <textarea rows={2} value={draft.notes} onChange={(e) => onAccessDraftChange(item.id, "notes", e.target.value)} placeholder="Notes (permissions, 2FA, owner, backup code location)" className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => void onSaveAccessItem(item.id)} disabled={Boolean(savingAccessItemById[item.id])} className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink disabled:cursor-not-allowed disabled:opacity-70">
                            {savingAccessItemById[item.id] ? "Saving..." : "Save Access Item"}
                          </button>
                          <button type="button" onClick={() => onToggleAccessItem(item.id)} className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
                            Collapse
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
