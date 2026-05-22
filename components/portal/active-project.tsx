"use client";

import type { PortalProject, ProjectPayment, ProjectContact, MemberRole } from "@/lib/portal-types";
import { statusStyles } from "@/lib/portal-utils";
import { formatDate, formatDateTime, formatUsd, formatProjectBalance, formatRole, formatPaymentStatus, getPaymentStatusBadgeClass, renderProjectSummaryContent } from "@/lib/portal-utils";

type ActiveProjectProps = {
  selectedProject: PortalProject;
  effectiveRole: MemberRole | null;
  isProjectAdmin: boolean;
  projectContacts: ProjectContact[];
  selectedProjectBalance: number | null;
  paypalStatusMessage: string | null;
  isCapturingPaypalCheckout: boolean;
  manualPaymentsEnabled: boolean;
  paypalAmountDraft: string;
  isStartingPaypalCheckout: boolean;
  selectedProjectPayments: ProjectPayment[];
  isArchivingProject: boolean;
  isDeletingProject: boolean;
  onOpenSnapshotModal: () => void;
  onArchiveProject: () => void;
  onDeleteProjectPermanently: () => void;
  onSetPaypalAmountDraft: (value: string) => void;
  onStartPayPalCheckout: () => void;
};

export function ActiveProject({
  selectedProject, effectiveRole, isProjectAdmin, projectContacts,
  selectedProjectBalance, paypalStatusMessage, isCapturingPaypalCheckout,
  manualPaymentsEnabled, paypalAmountDraft, isStartingPaypalCheckout,
  selectedProjectPayments, isArchivingProject, isDeletingProject,
  onOpenSnapshotModal, onArchiveProject, onDeleteProjectPermanently,
  onSetPaypalAmountDraft, onStartPayPalCheckout
}: ActiveProjectProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase leading-none text-ink">{selectedProject.name}</h2>
          <p className="mt-2 text-sm text-ink/75">
            Start {formatDate(selectedProject.start_date)} · Due {formatDate(selectedProject.due_date)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink/60">
            Your Access: {formatRole(effectiveRole)}
          </p>
          {isProjectAdmin ? (
            <div className="mt-2 text-xs text-ink/70">
              <p className="font-semibold uppercase tracking-[0.1em] text-ink/60">Project Contacts</p>
              {projectContacts.length === 0 ? (
                <p className="mt-1">No project contacts assigned yet.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {projectContacts.map((contact) => (
                    <li key={`${contact.email}-${contact.role}`}>
                      <span className="font-semibold text-ink">{contact.full_name || "Project Contact"}</span>{" "}
                      <span className="text-ink/65">({contact.email})</span>{" "}
                      <span className="rounded-full border border-ink/20 bg-white px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink/70">
                        {formatRole(contact.role)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
        <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusStyles[selectedProject.status] || "bg-fog text-ink/70"}`}>
          {selectedProject.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-ink/20 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">Project Snapshot</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onOpenSnapshotModal} className="inline-flex items-center rounded-full border border-[#475569] bg-[#64748b] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#55657c]">
              {isProjectAdmin ? "Edit Snapshot" : "Edit Summary"}
            </button>
            {isProjectAdmin && selectedProject.status !== "archived" ? (
              <button type="button" onClick={() => void onArchiveProject()} disabled={isArchivingProject || isDeletingProject} className="inline-flex items-center rounded-full border border-[#9b1c1c] bg-[#b91c1c] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#991515] disabled:cursor-not-allowed disabled:opacity-70">
                {isArchivingProject ? "Archiving..." : "Archive Project"}
              </button>
            ) : null}
            {isProjectAdmin ? (
              <button type="button" onClick={() => void onDeleteProjectPermanently()} disabled={isArchivingProject || isDeletingProject} className="inline-flex items-center rounded-full border border-[#7f1010] bg-[#a51616] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#8d1414] disabled:cursor-not-allowed disabled:opacity-70">
                {isDeletingProject ? "Deleting..." : "Delete Permanently"}
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-sm text-ink/75">
          Status: <span className="font-semibold text-ink">{selectedProject.status.replace("_", " ")}</span>
        </p>
        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">Project Progress</p>
            <p className="text-sm font-semibold text-ink">{selectedProject.progress}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-ink/20 bg-fog">
            <div className="h-full bg-[#4a83ff] transition-all" style={{ width: `${Math.max(0, Math.min(100, selectedProject.progress))}%` }} />
          </div>
        </div>

        <div className="mt-3 border-t border-ink/15 pt-3">
          <div className="rounded-lg border border-ink/20 bg-[#f3f9ff] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">Billing Summary</p>
            <div className="mt-2 grid gap-2 text-sm text-ink/80 sm:grid-cols-3">
              <p>Quoted Amount: <span className="font-semibold text-ink">{formatUsd(selectedProject.quoted_amount)}</span></p>
              <p>Amount Paid: <span className="font-semibold text-ink">{formatUsd(selectedProject.amount_paid)}</span></p>
              <p>
                Balance:{" "}
                <span className={`font-semibold ${selectedProjectBalance !== null && selectedProjectBalance > 0 ? "text-[#8a5a00]" : "text-ink"}`}>
                  {formatProjectBalance(selectedProject.quoted_amount, selectedProject.amount_paid)}
                </span>
              </p>
            </div>
            <p className="mt-2 text-xs text-ink/65">Balance = Quoted Amount - Amount Paid</p>

            {paypalStatusMessage ? (
              <p className="mt-3 rounded-md border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-xs text-[#1f5c28]">{paypalStatusMessage}</p>
            ) : null}
            {isCapturingPaypalCheckout ? (
              <p className="mt-3 rounded-md border border-[#a3b2d6] bg-[#eef3ff] px-3 py-2 text-xs text-[#254084]">Confirming PayPal payment...</p>
            ) : null}
            {!isProjectAdmin && !manualPaymentsEnabled && selectedProjectBalance !== null && selectedProjectBalance > 0 ? (
              <p className="mt-3 rounded-md border border-[#e3b36d] bg-[#fff8ec] px-3 py-2 text-xs text-[#8a5a00]">Manual payments are currently disabled. Please contact your manager.</p>
            ) : null}

            {!isProjectAdmin && manualPaymentsEnabled && selectedProjectBalance !== null && selectedProjectBalance > 0 ? (
              <form onSubmit={(event) => { event.preventDefault(); void onStartPayPalCheckout(); }} className="mt-3 rounded-md border border-ink/20 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Pay With PayPal</p>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <label className="text-xs text-ink/70">
                    Amount (USD)
                    <input type="text" inputMode="decimal" value={paypalAmountDraft} onChange={(event) => onSetPaypalAmountDraft(event.target.value)} className="mt-1 w-40 rounded-md border border-ink/25 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-ink/60" placeholder="0.00" />
                  </label>
                  <button type="submit" disabled={isStartingPaypalCheckout || isCapturingPaypalCheckout} className="inline-flex items-center rounded-full border-2 border-[#0d5d31] bg-[#1d7a46] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#17653a] disabled:cursor-not-allowed disabled:opacity-70">
                    {isStartingPaypalCheckout ? "Redirecting..." : "Pay Securely"}
                  </button>
                </div>
                <p className="mt-2 text-[0.7rem] text-ink/60">Max payable now: {formatUsd(selectedProjectBalance)}</p>
              </form>
            ) : null}

            {!isProjectAdmin ? (
              <div className="mt-3 rounded-md border border-ink/20 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Payment History</p>
                  <span className="text-[0.68rem] text-ink/60">{selectedProjectPayments.length} transaction{selectedProjectPayments.length === 1 ? "" : "s"}</span>
                </div>
                {selectedProjectPayments.length === 0 ? (
                  <p className="mt-2 text-xs text-ink/65">No payments have been recorded for this project yet.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selectedProjectPayments.map((payment) => (
                      <article key={payment.id} className="rounded-md border border-ink/15 bg-mist px-2.5 py-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-ink">{formatDateTime(payment.created_at)}</span>
                          <span className="font-semibold text-ink">{formatUsd(payment.amount)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-ink/70">
                          <span className={`rounded-full border px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${getPaymentStatusBadgeClass(payment.status)}`}>
                            {formatPaymentStatus(payment.status)}
                          </span>
                          <span>{payment.payer_email || "Unknown payer"}</span>
                        </div>
                        <p className="mt-1 text-[0.68rem] text-ink/60">Ref: {payment.provider_capture_id || payment.provider_order_id}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-3 border-t border-ink/15 pt-3">
            {selectedProject.summary ? (
              <div className="text-sm text-ink/80 [&_a]:text-[#2d5bd1] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold" dangerouslySetInnerHTML={{ __html: renderProjectSummaryContent(selectedProject.summary) }} />
            ) : (
              <p className="text-sm text-ink/65">No summary added yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
