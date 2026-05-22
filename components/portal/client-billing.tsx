"use client";

import type { ProjectPayment, RecurringInterval, ManagerBillingProjectRow, ProjectBillingProfileDraft } from "@/lib/portal-types";
import { formatDate, formatDateTime, formatUsd, formatProjectBalance, formatPaymentStatus, getPaymentStatusBadgeClass, formatRecurringInterval, createBillingProfileDraft, recurringIntervalOptions } from "@/lib/portal-utils";

type ClientBillingProps = {
  managerBillingMessage: string | null;
  isLoadingManagerBilling: boolean;
  recurringPaymentsEnabled: boolean;
  totalOutstandingBalance: number;
  totalCapturedPayments: number;
  paidInFullProjectsCount: number;
  nextRecurringPayments: ManagerBillingProjectRow[];
  managerBillingRows: ManagerBillingProjectRow[];
  billingProfileDrafts: Record<string, ProjectBillingProfileDraft>;
  isSavingBillingProfileByProjectId: Record<string, boolean>;
  recentProjectPayments: ProjectPayment[];
  projectNameById: Record<string, string>;
  onRefreshBilling: () => void;
  onBillingDraftChange: (projectId: string, field: keyof ProjectBillingProfileDraft, value: string | boolean) => void;
  onSaveBillingProfile: (projectId: string) => void;
};

export function ClientBilling({
  managerBillingMessage, isLoadingManagerBilling, recurringPaymentsEnabled,
  totalOutstandingBalance, totalCapturedPayments, paidInFullProjectsCount,
  nextRecurringPayments, managerBillingRows, billingProfileDrafts,
  isSavingBillingProfileByProjectId, recentProjectPayments, projectNameById,
  onRefreshBilling, onBillingDraftChange, onSaveBillingProfile
}: ClientBillingProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase text-ink">Client Transactions & Recurring Billing</h2>
          <p className="mt-1 text-sm text-ink/75">All client balances, paid projects, recent transactions, and next recurring payments.</p>
        </div>
        <button type="button" onClick={() => void onRefreshBilling()} className="inline-flex items-center rounded-full border border-ink/25 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-ink/45">
          Refresh Billing
        </button>
      </div>

      {managerBillingMessage ? <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-xs text-[#1f5c28]">{managerBillingMessage}</p> : null}
      {isLoadingManagerBilling ? <p className="mt-3 rounded-lg border border-ink/20 bg-mist px-3 py-2 text-xs text-ink/70">Loading manager billing data...</p> : null}
      {!recurringPaymentsEnabled ? <p className="mt-3 rounded-lg border border-[#e3b36d] bg-[#fff8ec] px-3 py-2 text-xs text-[#8a5a00]">Automatic/recurring payments are currently disabled in manager settings.</p> : null}

      <div className="mt-3 grid gap-2 grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-ink/20 bg-white px-3 py-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">Outstanding Balance</p>
          <p className="mt-1 text-sm font-semibold text-[#8a5a00]">{formatUsd(Number(totalOutstandingBalance.toFixed(2)))}</p>
        </div>
        <div className="rounded-lg border border-ink/20 bg-white px-3 py-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">Captured Payments</p>
          <p className="mt-1 text-sm font-semibold text-[#0b6a40]">{formatUsd(Number(totalCapturedPayments.toFixed(2)))}</p>
        </div>
        <div className="rounded-lg border border-ink/20 bg-white px-3 py-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">Paid Projects</p>
          <p className="mt-1 text-sm font-semibold text-ink">{paidInFullProjectsCount}</p>
        </div>
        <div className="rounded-lg border border-ink/20 bg-white px-3 py-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">Next Recurring</p>
          <p className="mt-1 text-sm font-semibold text-ink">{nextRecurringPayments.length}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {managerBillingRows.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-3 text-sm text-ink/65 xl:col-span-2">No projects available yet.</p>
        ) : (
          managerBillingRows.map((row) => {
            const draft = billingProfileDrafts[row.project.id] || createBillingProfileDraft(row.recurringProfile);
            const isSaving = Boolean(isSavingBillingProfileByProjectId[row.project.id]);
            return (
              <article key={row.project.id} className="rounded-lg border border-ink/20 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{row.project.name}</p>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.08em] text-ink/60">{row.project.status.replace("_", " ")}</p>
                  </div>
                  {row.lastPaymentAt ? <p className="text-[0.68rem] text-ink/65">{formatDateTime(row.lastPaymentAt)}</p> : <p className="text-[0.68rem] text-ink/55">No payments yet</p>}
                </div>
                <div className="mt-3 grid gap-2 text-xs text-ink/80 sm:grid-cols-2">
                  <p>Quoted: <span className="font-semibold text-ink">{formatUsd(row.project.quoted_amount)}</span></p>
                  <p>Paid: <span className="font-semibold text-ink">{formatUsd(row.project.amount_paid)}</span></p>
                  <p>Balance: <span className="font-semibold text-ink">{formatProjectBalance(row.project.quoted_amount, row.project.amount_paid)}</span></p>
                  <p>Captured: <span className="font-semibold text-ink">{row.capturedPaymentCount} ({formatUsd(Number(row.capturedPaymentTotal.toFixed(2)))})</span></p>
                </div>
                <div className="mt-3 space-y-2 border-t border-ink/15 pt-3">
                  <label className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/70">
                    <input type="checkbox" checked={draft.recurring_enabled} onChange={(event) => { if (event.target.checked && !recurringPaymentsEnabled) return; onBillingDraftChange(row.project.id, "recurring_enabled", event.target.checked); }} />
                    Recurring Enabled
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input type="text" value={draft.recurring_amount} onChange={(event) => onBillingDraftChange(row.project.id, "recurring_amount", event.target.value)} placeholder="Amount (USD)" disabled={!recurringPaymentsEnabled || !draft.recurring_enabled} className="rounded border border-ink/25 bg-white px-2 py-1 text-xs text-ink outline-none disabled:cursor-not-allowed disabled:bg-fog disabled:text-ink/50" />
                    <select value={draft.recurring_interval} onChange={(event) => onBillingDraftChange(row.project.id, "recurring_interval", event.target.value as RecurringInterval)} disabled={!recurringPaymentsEnabled || !draft.recurring_enabled} className="rounded border border-ink/25 bg-white px-2 py-1 text-xs text-ink outline-none disabled:cursor-not-allowed disabled:bg-fog disabled:text-ink/50">
                      {recurringIntervalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input type="date" value={draft.next_payment_due_at} onChange={(event) => onBillingDraftChange(row.project.id, "next_payment_due_at", event.target.value)} disabled={!recurringPaymentsEnabled || !draft.recurring_enabled} className="rounded border border-ink/25 bg-white px-2 py-1 text-xs text-ink outline-none disabled:cursor-not-allowed disabled:bg-fog disabled:text-ink/50" />
                    <button type="button" onClick={() => void onSaveBillingProfile(row.project.id)} disabled={isSaving} className="inline-flex items-center rounded-full border border-[#1f56c2] bg-[#2d6cdf] px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70">
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <textarea rows={2} value={draft.notes} onChange={(event) => onBillingDraftChange(row.project.id, "notes", event.target.value)} placeholder="Recurring notes" className="w-full rounded border border-ink/25 bg-white px-2 py-1 text-xs text-ink outline-none" />
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-4 rounded-lg border border-ink/20 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/70">Next Recurring Payments</p>
        {nextRecurringPayments.length === 0 ? (
          <p className="mt-2 text-xs text-ink/65">No recurring schedules configured yet.</p>
        ) : (
          <div className="mt-2 space-y-1 text-xs text-ink/80">
            {nextRecurringPayments.slice(0, 8).map((row) => (
              <p key={`next-recurring-${row.project.id}`}>
                <span className="font-semibold text-ink">{row.project.name}</span>: {formatUsd(row.recurringProfile?.recurring_amount ?? null)} on {formatDate(row.recurringProfile?.next_payment_due_at || null)} ({formatRecurringInterval(row.recurringProfile?.recurring_interval || "monthly")})
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 sm:hidden space-y-2">
        {recentProjectPayments.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-3 text-sm text-ink/65">No transactions yet.</p>
        ) : (
          recentProjectPayments.map((payment) => (
            <article key={payment.id} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-xs">
              <p className="font-semibold text-ink">{projectNameById[payment.project_id] || payment.project_id}</p>
              <p className="mt-1 text-ink/70">{formatDateTime(payment.created_at)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-ink/80">
                <span className={`rounded-full border px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${getPaymentStatusBadgeClass(payment.status)}`}>{formatPaymentStatus(payment.status)}</span>
                <span>{formatUsd(payment.amount)}</span>
              </p>
              <p className="mt-1 text-ink/70">{payment.payer_email || "Unknown payer"}</p>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 hidden sm:block overflow-x-auto rounded-lg border border-ink/20">
        <table className="min-w-[860px] w-full text-left text-xs text-ink/80">
          <thead className="bg-mist text-[0.64rem] uppercase tracking-[0.1em] text-ink/65">
            <tr>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 font-semibold">Project</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Amount</th>
              <th className="px-3 py-2 font-semibold">Payer</th>
              <th className="px-3 py-2 font-semibold">Provider Ref</th>
            </tr>
          </thead>
          <tbody>
            {recentProjectPayments.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-3 text-sm text-ink/65">No transactions yet.</td></tr>
            ) : (
              recentProjectPayments.map((payment) => (
                <tr key={payment.id} className="border-t border-ink/10">
                  <td className="px-3 py-2">{formatDateTime(payment.created_at)}</td>
                  <td className="px-3 py-2">{projectNameById[payment.project_id] || payment.project_id}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${getPaymentStatusBadgeClass(payment.status)}`}>{formatPaymentStatus(payment.status)}</span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-ink">{formatUsd(payment.amount)}</td>
                  <td className="px-3 py-2">{payment.payer_email || "Unknown"}</td>
                  <td className="px-3 py-2">{payment.provider_capture_id || payment.provider_order_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
