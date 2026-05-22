import type {
  RecurringInterval, ProjectPaymentStatus, MemberRole, MilestoneStatus, ApprovalStatus,
  AccessItemStatus, OnboardingStatus, ProjectStatus, ProjectBillingProfile,
  ProjectBillingProfileDraft, ClientServiceNeed, AccessItemVisibilityState,
  OnboardingLead, OnboardingLeadDraft, ClientIntakeProfile
} from "./portal-types";

export const projectStatuses: ProjectStatus[] = ["planning", "in_progress", "review", "completed"];
export const onboardingStatuses: OnboardingStatus[] = ["call_scheduled", "qualified", "deposited", "project_started"];
export const milestoneStatuses: MilestoneStatus[] = ["planned", "in_progress", "done"];
export const approvalStatuses: ApprovalStatus[] = ["pending", "approved", "changes_requested"];
export const accessItemStatuses: AccessItemStatus[] = ["missing", "submitted", "verified", "not_needed"];

export const recurringIntervalOptions: Array<{ value: RecurringInterval; label: string }> = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" }
];

export const defaultAccessItemVisibility: AccessItemVisibilityState = {
  login_url: false,
  account_email: false,
  username: false,
  secret_value: false,
  secure_link: false
};

export const clientServiceNeedOptions: Array<{ value: ClientServiceNeed; label: string }> = [
  { value: "seo", label: "SEO" },
  { value: "web_design", label: "Web Design" },
  { value: "web_development", label: "Web Development" },
  { value: "content", label: "Content" },
  { value: "analytics", label: "Analytics" },
  { value: "maintenance", label: "Maintenance" }
];

export const statusStyles: Record<string, string> = {
  planning: "bg-[#d8ecff] text-[#134d7a]",
  in_progress: "bg-[#fff1c5] text-[#8a5a00]",
  review: "bg-[#e9dbff] text-[#4f2b88]",
  completed: "bg-[#d5f4e2] text-[#0b6a40]",
  archived: "bg-[#ececec] text-[#5f5f5f]"
};

export const milestoneStatusStyles: Record<MilestoneStatus, string> = {
  planned: "bg-[#e7ecff] text-[#254084]",
  in_progress: "bg-[#fff1c5] text-[#8a5a00]",
  done: "bg-[#d5f4e2] text-[#0b6a40]"
};

export const approvalStatusStyles: Record<ApprovalStatus, string> = {
  pending: "bg-[#fff5cf] text-[#8a5a00]",
  approved: "bg-[#d5f4e2] text-[#0b6a40]",
  changes_requested: "bg-[#ffe2e2] text-[#892727]"
};

export const onboardingStatusStyles: Record<OnboardingStatus, string> = {
  call_scheduled: "bg-[#d8ecff] text-[#134d7a]",
  qualified: "bg-[#d5f4e2] text-[#0b6a40]",
  deposited: "bg-[#d1fae5] text-[#065f46]",
  project_started: "bg-[#def7f7] text-[#0f6a70]"
};

export const accessStatusStyles: Record<AccessItemStatus, string> = {
  missing: "bg-[#ffe2e2] text-[#892727]",
  submitted: "bg-[#fff5cf] text-[#8a5a00]",
  verified: "bg-[#d5f4e2] text-[#0b6a40]",
  not_needed: "bg-[#e7ecff] text-[#254084]"
};

export function parseTimestampMs(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatDate(value: string | null): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatRole(role: MemberRole | null): string {
  if (!role) return "unknown";
  if (role === "owner") return "owner";
  if (role === "manager") return "manager";
  return "client";
}

export function formatKeyLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function formatUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "Not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatProjectBalance(quotedAmount: number | null, amountPaid: number | null): string {
  if (quotedAmount === null || Number.isNaN(quotedAmount)) return "Not set";
  const balance = quotedAmount - (amountPaid ?? 0);
  if (balance < 0) return `Credit ${formatUsd(Math.abs(balance))}`;
  return formatUsd(balance);
}

export function getProjectBalanceAmount(quotedAmount: number | null, amountPaid: number | null): number | null {
  if (quotedAmount === null || Number.isNaN(quotedAmount)) return null;
  return Number((quotedAmount - (amountPaid ?? 0)).toFixed(2));
}

export function getProjectPaymentBadge(quotedAmount: number | null, amountPaid: number | null) {
  const balance = getProjectBalanceAmount(quotedAmount, amountPaid);
  if (balance === null) return { label: "No Quote" as const, className: "border-ink/25 bg-fog text-ink/65", balance: null };
  if (balance > 0) return { label: "Outstanding" as const, className: "border-[#e3b36d] bg-[#fff8ec] text-[#8a5a00]", balance };
  return { label: "Paid" as const, className: "border-[#84b98d] bg-[#e9f9ec] text-[#1f5c28]", balance };
}

export function formatRecurringInterval(value: RecurringInterval): string {
  return recurringIntervalOptions.find((o) => o.value === value)?.label || "Monthly";
}

export function formatPaymentStatus(status: ProjectPaymentStatus): string {
  return status.replace("_", " ");
}

export function getPaymentStatusBadgeClass(status: ProjectPaymentStatus): string {
  if (status === "captured") return "border-[#84b98d] bg-[#e9f9ec] text-[#1f5c28]";
  if (status === "created") return "border-[#e3b36d] bg-[#fff8ec] text-[#8a5a00]";
  if (status === "approved") return "border-[#9cc9f3] bg-[#e8f4ff] text-[#134d7a]";
  if (status === "failed") return "border-[#e7a4a4] bg-[#fff1f1] text-[#7a1f1f]";
  return "border-ink/20 bg-fog text-ink/70";
}

export function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function createBillingProfileDraft(profile: ProjectBillingProfile | null | undefined): ProjectBillingProfileDraft {
  return {
    recurring_enabled: Boolean(profile?.recurring_enabled),
    recurring_amount: profile?.recurring_amount != null ? String(profile.recurring_amount) : "",
    recurring_interval: profile?.recurring_interval || "monthly",
    next_payment_due_at: toDateInputValue(profile?.next_payment_due_at || null),
    notes: profile?.notes || ""
  };
}

export function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "";
  const normalized = localPart.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "Project Owner";
  return normalized.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function toSafeFileName(fileName: string): string {
  return fileName.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function parseProgress(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed;
}

export function parseUsdAmount(value: string): number | null {
  const normalized = value.replace(/[$,\s]/g, "").trim();
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return Number(parsed.toFixed(2));
}

export function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch { return null; }
}

export function sanitizeProjectSummaryHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderMarkdownInline(value: string): string {
  const withCode = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  return withItalic.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const normalizedUrl = normalizeExternalUrl(href);
    if (!normalizedUrl) return label;
    return `<a href="${normalizedUrl}" target="_blank" rel="noreferrer">${label}</a>`;
  });
}

export function renderMarkdownToHtml(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const chunks: string[] = [];
  let isInUnorderedList = false;
  let isInOrderedList = false;
  const closeLists = () => {
    if (isInUnorderedList) { chunks.push("</ul>"); isInUnorderedList = false; }
    if (isInOrderedList) { chunks.push("</ol>"); isInOrderedList = false; }
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeLists(); continue; }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) { closeLists(); chunks.push(`<h${headingMatch[1].length}>${renderMarkdownInline(escapeHtml(headingMatch[2]))}</h${headingMatch[1].length}>`); continue; }
    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) { if (!isInUnorderedList) { if (isInOrderedList) { chunks.push("</ol>"); isInOrderedList = false; } chunks.push("<ul>"); isInUnorderedList = true; } chunks.push(`<li>${renderMarkdownInline(escapeHtml(unorderedMatch[1]))}</li>`); continue; }
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) { if (!isInOrderedList) { if (isInUnorderedList) { chunks.push("</ul>"); isInUnorderedList = false; } chunks.push("<ol>"); isInOrderedList = true; } chunks.push(`<li>${renderMarkdownInline(escapeHtml(orderedMatch[1]))}</li>`); continue; }
    closeLists();
    chunks.push(`<p>${renderMarkdownInline(escapeHtml(line))}</p>`);
  }
  closeLists();
  return chunks.join("");
}

export function renderProjectSummaryContent(value: string | null): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  const looksLikeHtml = /<\/?[a-z][^>]*>/i.test(trimmed);
  const html = looksLikeHtml ? trimmed : renderMarkdownToHtml(trimmed);
  return sanitizeProjectSummaryHtml(html);
}

export function clipThreadTitle(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= 80) return normalized;
  return `${normalized.slice(0, 80)}...`;
}

export function formatAssignmentError(message: string): string {
  if (message.includes("invalid_email")) return "Please use a valid client email.";
  if (message.includes("not_authorized")) return "You do not have permission to assign this project.";
  if (message.includes("invalid_role")) return "Invalid project role.";
  return message;
}

export function formatDeleteProjectError(message: string): string {
  if (message.includes("not_authorized")) return "You do not have permission to delete this project.";
  if (message.includes("project_not_found")) return "This project was not found. It may have already been deleted.";
  if (message.includes("project_required")) return "Select a project first.";
  return message;
}

export function formatClientProjectSubmissionError(message: string): string {
  if (message.includes("active_project_exists")) return "You already have an active project. Submit a new request after active projects are completed or archived.";
  if (message.includes("project_name_required")) return "Project name is required.";
  if (message.includes("invalid_date_range")) return "Due date cannot be earlier than start date.";
  if (message.includes("email_required")) return "Your account email is required before submitting a project request.";
  if (message.includes("not_authenticated")) return "Please sign in again and retry.";
  return message;
}

export function getDepositedLeadRequirementsError(draft: OnboardingLeadDraft): string | null {
  if (draft.status !== "deposited") return null;
  const missing: string[] = [];
  if (!draft.quoted_amount.trim()) missing.push("Quoted Amount");
  if (!draft.deposit_amount.trim()) missing.push("Deposit Amount");
  if (!draft.payment_reference.trim()) missing.push("Payment Reference");
  if (!draft.manager_notes.trim()) missing.push("Manager Notes");
  if (missing.length === 0) return null;
  return `Status "deposited" requires: ${missing.join(", ")}.`;
}

export const tabLastSeenStoragePrefix = "portal-dashboard-tab-last-seen-v1";

export function getTabLastSeenStorageKey(userId: string, projectId: string): string {
  return `${tabLastSeenStoragePrefix}:${userId}:${projectId}`;
}

export type SuggestedAccessTemplate = {
  key: string;
  title: string;
  description: string;
  serviceArea: string;
};

export function buildSuggestedAccessTemplates(serviceNeeds: ClientServiceNeed[], cmsPlatform: string): SuggestedAccessTemplate[] {
  const templates: SuggestedAccessTemplate[] = [];
  const needs = new Set(serviceNeeds);
  const platform = cmsPlatform.trim().toLowerCase();
  const add = (entry: SuggestedAccessTemplate) => { if (!templates.some((t) => t.key === entry.key)) templates.push(entry); };
  if (needs.has("seo") || needs.has("analytics")) {
    add({ key: "google_search_console", title: "Google Search Console", description: "Property access for index coverage, performance, and technical SEO checks.", serviceArea: "seo" });
    add({ key: "google_analytics_4", title: "Google Analytics 4", description: "Read/admin access to validate tracking and conversion reporting.", serviceArea: "analytics" });
    add({ key: "google_tag_manager", title: "Google Tag Manager", description: "Container access for event tracking and analytics implementation.", serviceArea: "analytics" });
  }
  if (needs.has("web_design") || needs.has("web_development") || needs.has("maintenance")) {
    add({ key: "domain_registrar", title: "Domain Registrar", description: "Access to domain settings and ownership details.", serviceArea: "web" });
    add({ key: "dns_management", title: "DNS Management", description: "Access to DNS records for domain cutover and integrations.", serviceArea: "web" });
    add({ key: "hosting_cpanel", title: "Hosting / cPanel", description: "Access to hosting panel for files, SSL, redirects, and server settings.", serviceArea: "web" });
    add({ key: "cms_admin", title: "CMS Admin Access", description: "Admin/editor access to current site CMS for implementation.", serviceArea: "web" });
  }
  if (needs.has("web_development")) add({ key: "code_repository", title: "Code Repository", description: "GitHub/GitLab access for code changes and deployments.", serviceArea: "web_development" });
  if (platform.includes("wordpress")) add({ key: "wordpress_admin", title: "WordPress Admin", description: "WP Admin access for SEO plugin setup, content updates, and fixes.", serviceArea: "wordpress" });
  return templates;
}

export function mapScheduleCallServiceSelection(value: string): ClientServiceNeed[] {
  const map: Record<string, ClientServiceNeed[]> = {
    "Web Design": ["web_design"],
    "Web Development": ["web_development"],
    "SEO": ["seo"],
    "Web Design + SEO": ["web_design", "seo"],
    "Web Design + Web Development": ["web_design", "web_development"],
    "SEO + Web Development": ["seo", "web_development"],
    "All Three": ["web_design", "seo", "web_development"]
  };
  return map[value] || [];
}
