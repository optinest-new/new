"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";
import { PortalNotificationCenter } from "@/components/portal-notification-center";
import { PortalAlertModal, type PortalAlertTone } from "@/components/portal-alert-modal";
import { ManagerControls, ClientBilling, ActiveProject, SearchFilters, AccessCredentials, AdminWorkspace, TimelineMilestones, TaskApprovals, ProgressUpdates, QuestionsThreads, FilesDocuments } from "@/components/portal";

type PortalProject = {
  id: string;
  name: string;
  status: string;
  progress: number;
  quoted_amount: number | null;
  amount_paid: number | null;
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
  project_id: string;
  author_id: string;
  question: string;
  created_at: string;
};

type ProjectFile = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

type ProjectPaymentStatus = "created" | "approved" | "captured" | "voided" | "failed";

type ProjectPayment = {
  id: string;
  project_id: string;
  provider: "paypal";
  provider_order_id: string;
  provider_capture_id: string | null;
  status: ProjectPaymentStatus;
  amount: number;
  currency_code: string;
  payer_user_id: string | null;
  payer_email: string | null;
  created_at: string;
};

type RecurringInterval = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

type ProjectBillingProfile = {
  project_id: string;
  recurring_enabled: boolean;
  recurring_amount: number | null;
  recurring_interval: RecurringInterval;
  next_payment_due_at: string | null;
  autopay_provider: "paypal" | null;
  notes: string | null;
  updated_at: string;
};

type PaymentFeatureFlags = {
  manual_payments_enabled: boolean;
  recurring_payments_enabled: boolean;
};

type PaymentFeatureSettingsDraft = PaymentFeatureFlags;

type ProjectBillingProfileDraft = {
  recurring_enabled: boolean;
  recurring_amount: string;
  recurring_interval: RecurringInterval;
  next_payment_due_at: string;
  notes: string;
};

type ManagerBillingProjectRow = {
  project: PortalProject;
  balance: number | null;
  capturedPaymentTotal: number;
  capturedPaymentCount: number;
  lastPaymentAt: string | null;
  recurringProfile: ProjectBillingProfile | null;
};

type ProjectMilestone = {
  id: string;
  project_id: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: "planned" | "in_progress" | "done";
  sort_order: number;
  created_at: string;
};

type ProjectApprovalTask = {
  id: string;
  project_id: string;
  title: string;
  details: string | null;
  status: "pending" | "approved" | "changes_requested";
  requested_by: string;
  decided_by: string | null;
  decided_at: string | null;
  client_note: string | null;
  created_at: string;
};

type ClientServiceNeed =
  | "seo"
  | "web_design"
  | "web_development"
  | "content"
  | "analytics"
  | "maintenance";

type ClientIntakeProfile = {
  project_id: string;
  company_name: string | null;
  website_url: string | null;
  target_audience: string | null;
  primary_goal: string | null;
  secondary_goal: string | null;
  timeline_goal: string | null;
  success_metrics: string | null;
  service_needs: ClientServiceNeed[];
  cms_platform: string | null;
  notes: string | null;
  updated_at: string;
};

type AccessItemStatus = "missing" | "submitted" | "verified" | "not_needed";

type ProjectAccessItem = {
  id: string;
  project_id: string;
  access_key: string;
  title: string;
  description: string | null;
  service_area: string | null;
  status: AccessItemStatus;
  login_url: string | null;
  account_email: string | null;
  username: string | null;
  secret_value: string | null;
  secure_link: string | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
};

type AccessItemDraft = {
  status: AccessItemStatus;
  login_url: string;
  account_email: string;
  username: string;
  secret_value: string;
  secure_link: string;
  notes: string;
};

type AccessItemVisibilityField =
  | "login_url"
  | "account_email"
  | "username"
  | "secret_value"
  | "secure_link";

type AccessItemVisibilityState = Record<AccessItemVisibilityField, boolean>;

type QuestionMessage = {
  id: string;
  question_id: string;
  project_id: string;
  author_id: string;
  message: string;
  attachment_url: string | null;
  attachment_file_name: string | null;
  attachment_file_path: string | null;
  attachment_mime_type: string | null;
  created_at: string;
};

type OnboardingStatus =
  | "call_scheduled"
  | "qualified"
  | "deposited"
  | "project_started";

type OnboardingLead = {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  services_needed: string[] | null;
  budget_range: string | null;
  timeline_goal: string | null;
  preferred_call_at: string | null;
  goals: string | null;
  notes: string | null;
  status: OnboardingStatus;
  manager_notes: string | null;
  proposed_project_name: string | null;
  quoted_amount: number | null;
  deposit_amount: number | null;
  payment_reference: string | null;
  converted_project_id: string | null;
  converted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type OnboardingLeadDraft = {
  status: OnboardingStatus;
  manager_notes: string;
  proposed_project_name: string;
  quoted_amount: string;
  deposit_amount: string;
  payment_reference: string;
};

type ClientDirectorySuggestion = {
  email: string;
  full_name: string | null;
};

type ProjectContact = {
  email: string;
  full_name: string | null;
  role: MemberRole;
};

type UploadThreadAttachmentResult =
  | {
      ok: true;
      attachment_file_name: string | null;
      attachment_file_path: string | null;
      attachment_mime_type: string | null;
    }
  | {
      ok: false;
      error: string;
    };

type MemberRole = "client" | "manager" | "owner";
type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "archived";
type MilestoneStatus = "planned" | "in_progress" | "done";
type ApprovalStatus = "pending" | "approved" | "changes_requested";
type PortalWorkspaceTabId =
  | "manager_controls"
  | "client_billing"
  | "payment_mode_controls"
  | "active_project"
  | "search_filters"
  | "access_credentials"
  | "admin_workspace"
  | "timeline_milestones"
  | "task_approvals"
  | "progress_updates"
  | "questions_threads"
  | "files_documents";
type PortalWorkspaceTab = {
  id: PortalWorkspaceTabId;
  label: string;
  requiresProject?: boolean;
  adminOnly?: boolean;
  bootstrapOnly?: boolean;
};
type TabLastSeenById = Partial<Record<PortalWorkspaceTabId, string>>;

const projectStatuses: ProjectStatus[] = ["planning", "in_progress", "review", "completed"];
const onboardingStatuses: OnboardingStatus[] = [
  "call_scheduled",
  "qualified",
  "deposited",
  "project_started"
];
const milestoneStatuses: MilestoneStatus[] = ["planned", "in_progress", "done"];
const approvalStatuses: ApprovalStatus[] = ["pending", "approved", "changes_requested"];
const accessItemStatuses: AccessItemStatus[] = ["missing", "submitted", "verified", "not_needed"];
const recurringIntervalOptions: Array<{ value: RecurringInterval; label: string }> = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" }
];
const defaultAccessItemVisibility: AccessItemVisibilityState = {
  login_url: false,
  account_email: false,
  username: false,
  secret_value: false,
  secure_link: false
};
const clientServiceNeedOptions: Array<{ value: ClientServiceNeed; label: string }> = [
  { value: "seo", label: "SEO" },
  { value: "web_design", label: "Web Design" },
  { value: "web_development", label: "Web Development" },
  { value: "content", label: "Content" },
  { value: "analytics", label: "Analytics" },
  { value: "maintenance", label: "Maintenance" }
];
const portalWorkspaceTabs: PortalWorkspaceTab[] = [
  { id: "manager_controls", label: "Manager Controls", bootstrapOnly: true },
  { id: "client_billing", label: "Client Billing", bootstrapOnly: true },
  { id: "active_project", label: "Active Project", requiresProject: true },
  { id: "search_filters", label: "Search & Filters", requiresProject: true },
  { id: "access_credentials", label: "Access & Credentials", requiresProject: true },
  { id: "admin_workspace", label: "Admin Workspace", requiresProject: true, adminOnly: true },
  { id: "payment_mode_controls", label: "Payment Mode Controls", adminOnly: true },
  { id: "timeline_milestones", label: "Timeline & Milestones", requiresProject: true },
  { id: "task_approvals", label: "Task Approvals", requiresProject: true },
  { id: "progress_updates", label: "Progress Updates", requiresProject: true },
  { id: "questions_threads", label: "Questions & Threads", requiresProject: true },
  { id: "files_documents", label: "Files & Documents", requiresProject: true }
];
const tabLastSeenStoragePrefix = "portal-dashboard-tab-last-seen-v1";

function parseTimestampMs(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getTabLastSeenStorageKey(userId: string, projectId: string): string {
  return `${tabLastSeenStoragePrefix}:${userId}:${projectId}`;
}

function mapScheduleCallServiceSelection(value: string): ClientServiceNeed[] {
  if (value === "Web Design") {
    return ["web_design"];
  }

  if (value === "Web Development") {
    return ["web_development"];
  }

  if (value === "SEO") {
    return ["seo"];
  }

  if (value === "Web Design + SEO") {
    return ["web_design", "seo"];
  }

  if (value === "Web Design + Web Development") {
    return ["web_design", "web_development"];
  }

  if (value === "SEO + Web Development") {
    return ["seo", "web_development"];
  }

  if (value === "All Three") {
    return ["web_design", "seo", "web_development"];
  }

  return [];
}

const statusStyles: Record<string, string> = {
  planning: "bg-[#d8ecff] text-[#134d7a]",
  in_progress: "bg-[#fff1c5] text-[#8a5a00]",
  review: "bg-[#e9dbff] text-[#4f2b88]",
  completed: "bg-[#d5f4e2] text-[#0b6a40]",
  archived: "bg-[#ececec] text-[#5f5f5f]"
};

const milestoneStatusStyles: Record<MilestoneStatus, string> = {
  planned: "bg-[#e7ecff] text-[#254084]",
  in_progress: "bg-[#fff1c5] text-[#8a5a00]",
  done: "bg-[#d5f4e2] text-[#0b6a40]"
};

const approvalStatusStyles: Record<ApprovalStatus, string> = {
  pending: "bg-[#fff5cf] text-[#8a5a00]",
  approved: "bg-[#d5f4e2] text-[#0b6a40]",
  changes_requested: "bg-[#ffe2e2] text-[#892727]"
};

const onboardingStatusStyles: Record<OnboardingStatus, string> = {
  call_scheduled: "bg-[#d8ecff] text-[#134d7a]",
  qualified: "bg-[#d5f4e2] text-[#0b6a40]",
  deposited: "bg-[#d1fae5] text-[#065f46]",
  project_started: "bg-[#def7f7] text-[#0f6a70]"
};

const accessStatusStyles: Record<AccessItemStatus, string> = {
  missing: "bg-[#ffe2e2] text-[#892727]",
  submitted: "bg-[#fff5cf] text-[#8a5a00]",
  verified: "bg-[#d5f4e2] text-[#0b6a40]",
  not_needed: "bg-[#e7ecff] text-[#254084]"
};

type SuggestedAccessTemplate = {
  key: string;
  title: string;
  description: string;
  serviceArea: string;
};

function buildSuggestedAccessTemplates(
  serviceNeeds: ClientServiceNeed[],
  cmsPlatform: string
): SuggestedAccessTemplate[] {
  const templates: SuggestedAccessTemplate[] = [];
  const needs = new Set(serviceNeeds);
  const platform = cmsPlatform.trim().toLowerCase();

  const add = (entry: SuggestedAccessTemplate) => {
    if (!templates.some((current) => current.key === entry.key)) {
      templates.push(entry);
    }
  };

  if (needs.has("seo") || needs.has("analytics")) {
    add({
      key: "google_search_console",
      title: "Google Search Console",
      description: "Property access for index coverage, performance, and technical SEO checks.",
      serviceArea: "seo"
    });
    add({
      key: "google_analytics_4",
      title: "Google Analytics 4",
      description: "Read/admin access to validate tracking and conversion reporting.",
      serviceArea: "analytics"
    });
    add({
      key: "google_tag_manager",
      title: "Google Tag Manager",
      description: "Container access for event tracking and analytics implementation.",
      serviceArea: "analytics"
    });
  }

  if (needs.has("web_design") || needs.has("web_development") || needs.has("maintenance")) {
    add({
      key: "domain_registrar",
      title: "Domain Registrar",
      description: "Access to domain settings and ownership details.",
      serviceArea: "web"
    });
    add({
      key: "dns_management",
      title: "DNS Management",
      description: "Access to DNS records for domain cutover and integrations.",
      serviceArea: "web"
    });
    add({
      key: "hosting_cpanel",
      title: "Hosting / cPanel",
      description: "Access to hosting panel for files, SSL, redirects, and server settings.",
      serviceArea: "web"
    });
    add({
      key: "cms_admin",
      title: "CMS Admin Access",
      description: "Admin/editor access to current site CMS for implementation.",
      serviceArea: "web"
    });
  }

  if (needs.has("web_development")) {
    add({
      key: "code_repository",
      title: "Code Repository",
      description: "GitHub/GitLab access for code changes and deployments.",
      serviceArea: "web_development"
    });
  }

  if (platform.includes("wordpress")) {
    add({
      key: "wordpress_admin",
      title: "WordPress Admin",
      description: "WP Admin access for SEO plugin setup, content updates, and fixes.",
      serviceArea: "wordpress"
    });
  }

  return templates;
}

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

function formatRole(role: MemberRole | null): string {
  if (!role) {
    return "unknown";
  }

  if (role === "owner") {
    return "owner";
  }

  if (role === "manager") {
    return "manager";
  }

  return "client";
}

function formatKeyLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function formatUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatProjectBalance(quotedAmount: number | null, amountPaid: number | null): string {
  if (quotedAmount === null || Number.isNaN(quotedAmount)) {
    return "Not set";
  }

  const balance = quotedAmount - (amountPaid ?? 0);
  if (balance < 0) {
    return `Credit ${formatUsd(Math.abs(balance))}`;
  }

  return formatUsd(balance);
}

function getProjectBalanceAmount(quotedAmount: number | null, amountPaid: number | null): number | null {
  if (quotedAmount === null || Number.isNaN(quotedAmount)) {
    return null;
  }

  return Number((quotedAmount - (amountPaid ?? 0)).toFixed(2));
}

function getProjectPaymentBadge(quotedAmount: number | null, amountPaid: number | null): {
  label: "Outstanding" | "Paid" | "No Quote";
  className: string;
  balance: number | null;
} {
  const balance = getProjectBalanceAmount(quotedAmount, amountPaid);

  if (balance === null) {
    return {
      label: "No Quote",
      className: "border-ink/25 bg-fog text-ink/65",
      balance: null
    };
  }

  if (balance > 0) {
    return {
      label: "Outstanding",
      className: "border-[#e3b36d] bg-[#fff8ec] text-[#8a5a00]",
      balance
    };
  }

  return {
    label: "Paid",
    className: "border-[#84b98d] bg-[#e9f9ec] text-[#1f5c28]",
    balance
  };
}

function formatRecurringInterval(value: RecurringInterval): string {
  return recurringIntervalOptions.find((option) => option.value === value)?.label || "Monthly";
}

function formatPaymentStatus(status: ProjectPaymentStatus): string {
  return status.replace("_", " ");
}

function getPaymentStatusBadgeClass(status: ProjectPaymentStatus): string {
  if (status === "captured") {
    return "border-[#84b98d] bg-[#e9f9ec] text-[#1f5c28]";
  }

  if (status === "created") {
    return "border-[#e3b36d] bg-[#fff8ec] text-[#8a5a00]";
  }

  if (status === "approved") {
    return "border-[#9cc9f3] bg-[#e8f4ff] text-[#134d7a]";
  }

  if (status === "failed") {
    return "border-[#e7a4a4] bg-[#fff1f1] text-[#7a1f1f]";
  }

  return "border-ink/20 bg-fog text-ink/70";
}

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function createBillingProfileDraft(
  profile: ProjectBillingProfile | null | undefined
): ProjectBillingProfileDraft {
  return {
    recurring_enabled: Boolean(profile?.recurring_enabled),
    recurring_amount:
      profile?.recurring_amount !== null && profile?.recurring_amount !== undefined
        ? String(profile.recurring_amount)
        : "",
    recurring_interval: profile?.recurring_interval || "monthly",
    next_payment_due_at: toDateInputValue(profile?.next_payment_due_at || null),
    notes: profile?.notes || ""
  };
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

function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "";
  const normalized = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "Project Owner";
  }

  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toSafeFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseProgress(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed;
}

function parseUsdAmount(value: string): number | null {
  const normalized = value.replace(/[$,\s]/g, "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
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
    const normalizedUrl = normalizeExternalUrl(href);
    if (!normalizedUrl) {
      return label;
    }

    return `<a href="${normalizedUrl}" target="_blank" rel="noreferrer">${label}</a>`;
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

function clipThreadTitle(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= 80) {
    return normalized;
  }

  return `${normalized.slice(0, 80)}...`;
}

function formatAssignmentError(message: string): string {
  if (message.includes("invalid_email")) {
    return "Please use a valid client email.";
  }

  if (message.includes("not_authorized")) {
    return "You do not have permission to assign this project.";
  }

  if (message.includes("invalid_role")) {
    return "Invalid project role.";
  }

  return message;
}

function formatDeleteProjectError(message: string): string {
  if (message.includes("not_authorized")) {
    return "You do not have permission to delete this project.";
  }

  if (message.includes("project_not_found")) {
    return "This project was not found. It may have already been deleted.";
  }

  if (message.includes("project_required")) {
    return "Select a project first.";
  }

  return message;
}

function formatClientProjectSubmissionError(message: string): string {
  if (message.includes("active_project_exists")) {
    return "You already have an active project. Submit a new request after active projects are completed or archived.";
  }

  if (message.includes("project_name_required")) {
    return "Project name is required.";
  }

  if (message.includes("invalid_date_range")) {
    return "Due date cannot be earlier than start date.";
  }

  if (message.includes("email_required")) {
    return "Your account email is required before submitting a project request.";
  }

  if (message.includes("not_authenticated")) {
    return "Please sign in again and retry.";
  }

  return message;
}

function getDepositedLeadRequirementsError(draft: OnboardingLeadDraft): string | null {
  if (draft.status !== "deposited") {
    return null;
  }

  const missing: string[] = [];

  if (!draft.quoted_amount.trim()) {
    missing.push("Quoted Amount");
  }

  if (!draft.deposit_amount.trim()) {
    missing.push("Deposit Amount");
  }

  if (!draft.payment_reference.trim()) {
    missing.push("Payment Reference");
  }

  if (!draft.manager_notes.trim()) {
    missing.push("Manager Notes");
  }

  if (missing.length === 0) {
    return null;
  }

  return `Status "deposited" requires: ${missing.join(", ")}.`;
}

export default function PortalPage() {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [portalError, setPortalError] = useState("");
  const [alertModal, setAlertModal] = useState<{ tone: PortalAlertTone; title: string; message: string } | null>(
    null
  );
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [isUpdatingRecoveryPassword, setIsUpdatingRecoveryPassword] = useState(false);

  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [projectQuestions, setProjectQuestions] = useState<ProjectQuestion[]>([]);
  const [questionMessages, setQuestionMessages] = useState<QuestionMessage[]>([]);
  const [memberRolesByUserId, setMemberRolesByUserId] = useState<Record<string, MemberRole>>({});
  const [projectContacts, setProjectContacts] = useState<ProjectContact[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [projectApprovalTasks, setProjectApprovalTasks] = useState<ProjectApprovalTask[]>([]);
  const [projectClientIntake, setProjectClientIntake] = useState<ClientIntakeProfile | null>(null);
  const [projectAccessItems, setProjectAccessItems] = useState<ProjectAccessItem[]>([]);
  const [projectPayments, setProjectPayments] = useState<ProjectPayment[]>([]);
  const [selectedProjectPayments, setSelectedProjectPayments] = useState<ProjectPayment[]>([]);
  const [tabLastSeenById, setTabLastSeenById] = useState<TabLastSeenById>({});
  const [projectBillingProfiles, setProjectBillingProfiles] = useState<ProjectBillingProfile[]>([]);
  const [billingProfileDrafts, setBillingProfileDrafts] = useState<Record<string, ProjectBillingProfileDraft>>({});
  const [isLoadingManagerBilling, setIsLoadingManagerBilling] = useState(false);
  const [isSavingBillingProfileByProjectId, setIsSavingBillingProfileByProjectId] = useState<
    Record<string, boolean>
  >({});
  const [managerBillingMessage, setManagerBillingMessage] = useState("");
  const [paymentFeatureFlags, setPaymentFeatureFlags] = useState<PaymentFeatureFlags>({
    manual_payments_enabled: true,
    recurring_payments_enabled: true
  });
  const [paymentFeatureSettingsDraft, setPaymentFeatureSettingsDraft] =
    useState<PaymentFeatureSettingsDraft>({
      manual_payments_enabled: true,
      recurring_payments_enabled: true
    });
  const [isLoadingPaymentFeatureSettings, setIsLoadingPaymentFeatureSettings] = useState(false);
  const [isSavingPaymentFeatureSettings, setIsSavingPaymentFeatureSettings] = useState(false);
  const [paymentFeatureSettingsMessage, setPaymentFeatureSettingsMessage] = useState("");
  const [isLoadingProjectData, setIsLoadingProjectData] = useState(false);
  const [currentRole, setCurrentRole] = useState<MemberRole | null>(null);
  const [isBootstrapManager, setIsBootstrapManager] = useState(false);

  const [questionDraft, setQuestionDraft] = useState("");
  const [questionUrlDraft, setQuestionUrlDraft] = useState("");
  const [questionFileDraft, setQuestionFileDraft] = useState<File | null>(null);
  const [questionFilePreviewUrl, setQuestionFilePreviewUrl] = useState<string | null>(null);
  const [questionMessageAttachmentUrls, setQuestionMessageAttachmentUrls] = useState<Record<string, string>>({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [projectStatusDraft, setProjectStatusDraft] = useState<ProjectStatus>("planning");
  const [projectProgressDraft, setProjectProgressDraft] = useState("0");
  const [projectStartDateDraft, setProjectStartDateDraft] = useState("");
  const [projectDueDateDraft, setProjectDueDateDraft] = useState("");
  const [projectSummaryDraft, setProjectSummaryDraft] = useState("");
  const [projectQuotedAmountDraft, setProjectQuotedAmountDraft] = useState("");
  const [projectAmountPaidDraft, setProjectAmountPaidDraft] = useState("");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isArchivingProject, setIsArchivingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isProjectSnapshotModalOpen, setIsProjectSnapshotModalOpen] = useState(false);
  const [updateTitleDraft, setUpdateTitleDraft] = useState("");
  const [updateBodyDraft, setUpdateBodyDraft] = useState("");
  const [updateProgressDraft, setUpdateProgressDraft] = useState("");
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSummary, setNewProjectSummary] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>("planning");
  const [newProjectProgress, setNewProjectProgress] = useState("0");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  const [newProjectClientEmail, setNewProjectClientEmail] = useState("");
  const [scheduleCallFullName, setScheduleCallFullName] = useState("");
  const [scheduleCallEmail, setScheduleCallEmail] = useState("");
  const [scheduleCallCompanyName, setScheduleCallCompanyName] = useState("");
  const [scheduleCallPhone, setScheduleCallPhone] = useState("");
  const [scheduleCallServicesNeeded, setScheduleCallServicesNeeded] = useState("");
  const [scheduleCallBudgetRange, setScheduleCallBudgetRange] = useState("");
  const [scheduleCallTimelineGoal, setScheduleCallTimelineGoal] = useState("");
  const [scheduleCallPreferredAt, setScheduleCallPreferredAt] = useState("");
  const [scheduleCallGoals, setScheduleCallGoals] = useState("");
  const [scheduleCallNotes, setScheduleCallNotes] = useState("");
  const [isSubmittingScheduleCall, setIsSubmittingScheduleCall] = useState(false);
  const [scheduleCallMessage, setScheduleCallMessage] = useState("");
  const [scheduleCallError, setScheduleCallError] = useState("");
  const [isClientProjectRequestOpen, setIsClientProjectRequestOpen] = useState(false);
  const [clientProjectRequestName, setClientProjectRequestName] = useState("");
  const [clientProjectRequestSummary, setClientProjectRequestSummary] = useState("");
  const [clientProjectRequestStartDate, setClientProjectRequestStartDate] = useState("");
  const [clientProjectRequestDueDate, setClientProjectRequestDueDate] = useState("");
  const [isSubmittingClientProjectRequest, setIsSubmittingClientProjectRequest] = useState(false);
  const [clientProjectRequestMessage, setClientProjectRequestMessage] = useState("");
  const [clientProjectRequestError, setClientProjectRequestError] = useState("");
  const [onboardingLeads, setOnboardingLeads] = useState<OnboardingLead[]>([]);
  const [isLoadingOnboardingLeads, setIsLoadingOnboardingLeads] = useState(false);
  const [onboardingSearchDraft, setOnboardingSearchDraft] = useState("");
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState<"all" | OnboardingStatus>("all");
  const [onboardingLeadDrafts, setOnboardingLeadDrafts] = useState<Record<string, OnboardingLeadDraft>>({});
  const [savingOnboardingLeadById, setSavingOnboardingLeadById] = useState<Record<string, boolean>>({});
  const [convertingOnboardingLeadById, setConvertingOnboardingLeadById] = useState<Record<string, boolean>>({});
  const [newProjectEmailSuggestions, setNewProjectEmailSuggestions] = useState<
    ClientDirectorySuggestion[]
  >([]);
  const [isLoadingNewProjectEmailSuggestions, setIsLoadingNewProjectEmailSuggestions] =
    useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [isManagerProjectsDrawerOpen, setIsManagerProjectsDrawerOpen] = useState(true);
  const [isManagerControlsOpen, setIsManagerControlsOpen] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyUrlDrafts, setReplyUrlDrafts] = useState<Record<string, string>>({});
  const [replyFileDrafts, setReplyFileDrafts] = useState<Record<string, File | null>>({});
  const [replyFilePreviewUrls, setReplyFilePreviewUrls] = useState<Record<string, string>>({});
  const [replySubmittingByQuestionId, setReplySubmittingByQuestionId] = useState<Record<string, boolean>>({});
  const [projectSearchDraft, setProjectSearchDraft] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [contentSearchDraft, setContentSearchDraft] = useState("");
  const [milestoneFilterStatus, setMilestoneFilterStatus] = useState<"all" | MilestoneStatus>("all");
  const [approvalFilterStatus, setApprovalFilterStatus] = useState<"all" | ApprovalStatus>("all");
  const [milestoneTitleDraft, setMilestoneTitleDraft] = useState("");
  const [milestoneDetailsDraft, setMilestoneDetailsDraft] = useState("");
  const [milestoneDueDateDraft, setMilestoneDueDateDraft] = useState("");
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [approvalTitleDraft, setApprovalTitleDraft] = useState("");
  const [approvalDetailsDraft, setApprovalDetailsDraft] = useState("");
  const [isCreatingApprovalTask, setIsCreatingApprovalTask] = useState(false);
  const [approvalResponseDrafts, setApprovalResponseDrafts] = useState<Record<string, string>>({});
  const [approvalSubmittingById, setApprovalSubmittingById] = useState<Record<string, boolean>>({});
  const [intakeCompanyNameDraft, setIntakeCompanyNameDraft] = useState("");
  const [intakeWebsiteUrlDraft, setIntakeWebsiteUrlDraft] = useState("");
  const [intakeTargetAudienceDraft, setIntakeTargetAudienceDraft] = useState("");
  const [intakePrimaryGoalDraft, setIntakePrimaryGoalDraft] = useState("");
  const [intakeSecondaryGoalDraft, setIntakeSecondaryGoalDraft] = useState("");
  const [intakeTimelineGoalDraft, setIntakeTimelineGoalDraft] = useState("");
  const [intakeSuccessMetricsDraft, setIntakeSuccessMetricsDraft] = useState("");
  const [intakeCmsPlatformDraft, setIntakeCmsPlatformDraft] = useState("");
  const [intakeNotesDraft, setIntakeNotesDraft] = useState("");
  const [intakeServiceNeedsDraft, setIntakeServiceNeedsDraft] = useState<ClientServiceNeed[]>([]);
  const [isSavingClientIntake, setIsSavingClientIntake] = useState(false);
  const [accessItemDrafts, setAccessItemDrafts] = useState<Record<string, AccessItemDraft>>({});
  const [accessFieldVisibilityById, setAccessFieldVisibilityById] = useState<
    Record<string, AccessItemVisibilityState>
  >({});
  const [savingAccessItemById, setSavingAccessItemById] = useState<Record<string, boolean>>({});
  const [isGeneratingAccessChecklist, setIsGeneratingAccessChecklist] = useState(false);
  const [accessStatusFilter, setAccessStatusFilter] = useState<"all" | AccessItemStatus>("all");
  const [isClientIntakeOpen, setIsClientIntakeOpen] = useState(false);
  const [isAccessChecklistOpen, setIsAccessChecklistOpen] = useState(false);
  const [expandedAccessItemIds, setExpandedAccessItemIds] = useState<Record<string, boolean>>({});
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<PortalWorkspaceTabId>("manager_controls");
  const [paypalAmountDraft, setPaypalAmountDraft] = useState("");
  const [isStartingPaypalCheckout, setIsStartingPaypalCheckout] = useState(false);
  const [isCapturingPaypalCheckout, setIsCapturingPaypalCheckout] = useState(false);
  const [paypalStatusMessage, setPaypalStatusMessage] = useState("");
  const handledPaypalOrdersRef = useRef<Record<string, true>>({});

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const selectedProjectBalance =
    selectedProject && selectedProject.quoted_amount !== null
      ? selectedProject.quoted_amount - (selectedProject.amount_paid ?? 0)
      : null;
  const manualPaymentsEnabled = paymentFeatureFlags.manual_payments_enabled;
  const recurringPaymentsEnabled = paymentFeatureFlags.recurring_payments_enabled;
  const effectiveRole: MemberRole | null = isBootstrapManager ? "manager" : currentRole;
  const isProjectAdmin = isBootstrapManager || currentRole === "manager" || currentRole === "owner";
  const canManagePaymentModeControls = isProjectAdmin;
  const hasSelectedProject = Boolean(selectedProject);
  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "completed" && project.status !== "archived"),
    [projects]
  );
  const canSubmitClientProjectRequest = !isProjectAdmin && activeProjects.length === 0;
  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "completed"),
    [projects]
  );
  const billingProfileByProjectId = useMemo(() => {
    const map: Record<string, ProjectBillingProfile> = {};
    for (const profile of projectBillingProfiles) {
      map[profile.project_id] = profile;
    }
    return map;
  }, [projectBillingProfiles]);
  const paymentsByProjectId = useMemo(() => {
    const map: Record<string, ProjectPayment[]> = {};
    for (const payment of projectPayments) {
      if (!map[payment.project_id]) {
        map[payment.project_id] = [];
      }
      map[payment.project_id].push(payment);
    }
    return map;
  }, [projectPayments]);
  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const project of projects) {
      map[project.id] = project.name;
    }
    return map;
  }, [projects]);
  const managerBillingRows = useMemo<ManagerBillingProjectRow[]>(() => {
    return projects.map((project) => {
      const projectPaymentsRows = paymentsByProjectId[project.id] || [];
      const capturedPayments = projectPaymentsRows.filter((payment) => payment.status === "captured");
      const capturedPaymentTotal = capturedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance =
        project.quoted_amount !== null ? Number((project.quoted_amount - (project.amount_paid ?? 0)).toFixed(2)) : null;
      const recurringProfile = billingProfileByProjectId[project.id] || null;

      return {
        project,
        balance,
        capturedPaymentTotal,
        capturedPaymentCount: capturedPayments.length,
        lastPaymentAt: projectPaymentsRows[0]?.created_at || null,
        recurringProfile
      };
    });
  }, [billingProfileByProjectId, paymentsByProjectId, projects]);
  const totalOutstandingBalance = useMemo(() => {
    return managerBillingRows.reduce((sum, row) => {
      if (row.balance === null || row.balance <= 0) {
        return sum;
      }
      return sum + row.balance;
    }, 0);
  }, [managerBillingRows]);
  const paidInFullProjectsCount = useMemo(() => {
    return managerBillingRows.filter((row) => row.balance !== null && row.balance <= 0).length;
  }, [managerBillingRows]);
  const totalCapturedPayments = useMemo(() => {
    return projectPayments.reduce((sum, payment) => {
      if (payment.status !== "captured") {
        return sum;
      }
      return sum + payment.amount;
    }, 0);
  }, [projectPayments]);
  const nextRecurringPayments = useMemo(() => {
    return managerBillingRows
      .filter((row) => row.recurringProfile?.recurring_enabled && row.recurringProfile.next_payment_due_at)
      .sort((a, b) => {
        const firstDueAt = a.recurringProfile?.next_payment_due_at || "";
        const secondDueAt = b.recurringProfile?.next_payment_due_at || "";
        return firstDueAt.localeCompare(secondDueAt);
      });
  }, [managerBillingRows]);
  const recentProjectPayments = useMemo(() => {
    return projectPayments.slice(0, 40);
  }, [projectPayments]);
  const selectedCreateClientSuggestion = useMemo(() => {
    const normalizedEmail = newProjectClientEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    return (
      newProjectEmailSuggestions.find(
        (entry) => entry.email.trim().toLowerCase() === normalizedEmail
      ) || null
    );
  }, [newProjectClientEmail, newProjectEmailSuggestions]);
  const sidebarProjects = isProjectAdmin ? activeProjects : projects;
  const messagesByQuestionId = useMemo(() => {
    const map: Record<string, QuestionMessage[]> = {};

    for (const message of questionMessages) {
      if (!map[message.question_id]) {
        map[message.question_id] = [];
      }
      map[message.question_id].push(message);
    }

    return map;
  }, [questionMessages]);
  const normalizedProjectSearch = projectSearchDraft.trim().toLowerCase();
  const filteredSidebarProjects = useMemo(() => {
    return sidebarProjects.filter((project) => {
      const matchesSearch =
        !normalizedProjectSearch || project.name.toLowerCase().includes(normalizedProjectSearch);
      const matchesStatus = projectStatusFilter === "all" || project.status === projectStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedProjectSearch, projectStatusFilter, sidebarProjects]);
  const normalizedContentSearch = contentSearchDraft.trim().toLowerCase();
  const filteredProjectMilestones = useMemo(() => {
    return projectMilestones.filter((milestone) => {
      const haystack = `${milestone.title} ${milestone.details ?? ""}`.toLowerCase();
      const matchesSearch = !normalizedContentSearch || haystack.includes(normalizedContentSearch);
      const matchesStatus =
        milestoneFilterStatus === "all" || milestone.status === milestoneFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [milestoneFilterStatus, normalizedContentSearch, projectMilestones]);
  const filteredProjectApprovalTasks = useMemo(() => {
    return projectApprovalTasks.filter((task) => {
      const haystack = `${task.title} ${task.details ?? ""} ${task.client_note ?? ""}`.toLowerCase();
      const matchesSearch = !normalizedContentSearch || haystack.includes(normalizedContentSearch);
      const matchesStatus = approvalFilterStatus === "all" || task.status === approvalFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [approvalFilterStatus, normalizedContentSearch, projectApprovalTasks]);
  const filteredProjectUpdates = useMemo(() => {
    return projectUpdates.filter((update) => {
      const haystack = `${update.title} ${update.body}`.toLowerCase();
      return !normalizedContentSearch || haystack.includes(normalizedContentSearch);
    });
  }, [normalizedContentSearch, projectUpdates]);
  const filteredProjectQuestions = useMemo(() => {
    if (!normalizedContentSearch) {
      return projectQuestions;
    }

    return projectQuestions.filter((question) => {
      const threadMessages = messagesByQuestionId[question.id] || [];
      const haystack = `${question.question} ${threadMessages.map((item) => item.message).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedContentSearch);
    });
  }, [messagesByQuestionId, normalizedContentSearch, projectQuestions]);
  const filteredProjectFiles = useMemo(() => {
    return projectFiles.filter((file) => {
      const haystack = `${file.file_name} ${file.mime_type ?? ""}`.toLowerCase();
      return !normalizedContentSearch || haystack.includes(normalizedContentSearch);
    });
  }, [normalizedContentSearch, projectFiles]);
  const filteredProjectAccessItems = useMemo(() => {
    return projectAccessItems.filter((item) => {
      const haystack =
        `${item.title} ${item.description ?? ""} ${item.service_area ?? ""} ${item.account_email ?? ""} ${item.login_url ?? ""}`
          .toLowerCase();
      const matchesSearch = !normalizedContentSearch || haystack.includes(normalizedContentSearch);
      const matchesStatus = accessStatusFilter === "all" || item.status === accessStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accessStatusFilter, normalizedContentSearch, projectAccessItems]);
  const normalizedOnboardingSearch = onboardingSearchDraft.trim().toLowerCase();
  const onboardingPipelineLeads = useMemo(
    () => onboardingLeads.filter((lead) => !lead.converted_project_id),
    [onboardingLeads]
  );
  const filteredOnboardingLeads = useMemo(() => {
    return onboardingPipelineLeads.filter((lead) => {
      const haystack =
        `${lead.full_name} ${lead.email} ${lead.company_name ?? ""} ${lead.goals ?? ""} ${lead.manager_notes ?? ""}`
          .toLowerCase();
      const matchesSearch = !normalizedOnboardingSearch || haystack.includes(normalizedOnboardingSearch);
      const matchesStatus = onboardingStatusFilter === "all" || lead.status === onboardingStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedOnboardingSearch, onboardingPipelineLeads, onboardingStatusFilter]);
  const onboardingStatusCounts = useMemo(() => {
    return onboardingPipelineLeads.reduce<Record<OnboardingStatus, number>>(
      (counts, lead) => {
        counts[lead.status] += 1;
        return counts;
      },
      {
        call_scheduled: 0,
        qualified: 0,
        deposited: 0,
        project_started: 0
      }
    );
  }, [onboardingPipelineLeads]);
  const availableWorkspaceTabs = useMemo(() => {
    return portalWorkspaceTabs.filter((tab) => {
      if (tab.bootstrapOnly && !isBootstrapManager) {
        return false;
      }
      if (tab.adminOnly && !isProjectAdmin) {
        return false;
      }
      if (tab.requiresProject && !hasSelectedProject) {
        return false;
      }
      return true;
    });
  }, [hasSelectedProject, isBootstrapManager, isProjectAdmin]);
  const projectTabLatestActivityMs = useMemo<Partial<Record<PortalWorkspaceTabId, number>>>(() => {
    const latestMilestoneMs = projectMilestones.reduce(
      (latest, milestone) => Math.max(latest, parseTimestampMs(milestone.created_at)),
      0
    );
    const latestApprovalMs = projectApprovalTasks.reduce((latest, task) => {
      return Math.max(
        latest,
        parseTimestampMs(task.created_at),
        parseTimestampMs(task.decided_at)
      );
    }, 0);
    const latestProgressUpdateMs = projectUpdates.reduce(
      (latest, update) => Math.max(latest, parseTimestampMs(update.created_at)),
      0
    );
    const latestThreadMs = Math.max(
      projectQuestions.reduce((latest, question) => Math.max(latest, parseTimestampMs(question.created_at)), 0),
      questionMessages.reduce((latest, message) => Math.max(latest, parseTimestampMs(message.created_at)), 0)
    );
    const latestFileMs = projectFiles.reduce((latest, file) => Math.max(latest, parseTimestampMs(file.created_at)), 0);
    const latestAccessChecklistMs = projectAccessItems.reduce(
      (latest, item) => Math.max(latest, parseTimestampMs(item.updated_at)),
      0
    );
    const latestAccessMs = Math.max(
      latestAccessChecklistMs,
      parseTimestampMs(projectClientIntake?.updated_at || null)
    );

    return {
      active_project: parseTimestampMs(selectedProject?.updated_at || null),
      access_credentials: latestAccessMs,
      timeline_milestones: latestMilestoneMs,
      task_approvals: latestApprovalMs,
      progress_updates: latestProgressUpdateMs,
      questions_threads: latestThreadMs,
      files_documents: latestFileMs,
      admin_workspace: Math.max(latestProgressUpdateMs, latestThreadMs, latestApprovalMs),
      manager_controls: 0,
      client_billing: 0,
      payment_mode_controls: 0,
      search_filters: 0
    };
  }, [
    projectAccessItems,
    projectApprovalTasks,
    projectClientIntake?.updated_at,
    projectFiles,
    projectMilestones,
    projectQuestions,
    projectUpdates,
    questionMessages,
    selectedProject?.updated_at
  ]);
  const tabNewCountById = useMemo<Partial<Record<PortalWorkspaceTabId, number>>>(() => {
    const counts: Partial<Record<PortalWorkspaceTabId, number>> = {};

    const activeProjectSeenMs = parseTimestampMs(tabLastSeenById.active_project);
    counts.active_project =
      selectedProject && parseTimestampMs(selectedProject.updated_at) > activeProjectSeenMs ? 1 : 0;

    const accessSeenMs = parseTimestampMs(tabLastSeenById.access_credentials);
    const accessChecklistNewCount = projectAccessItems.filter(
      (item) => parseTimestampMs(item.updated_at) > accessSeenMs
    ).length;
    const hasNewIntakeUpdate =
      Boolean(projectClientIntake) && parseTimestampMs(projectClientIntake?.updated_at) > accessSeenMs;
    counts.access_credentials = accessChecklistNewCount + (hasNewIntakeUpdate ? 1 : 0);

    const milestoneSeenMs = parseTimestampMs(tabLastSeenById.timeline_milestones);
    counts.timeline_milestones = projectMilestones.filter(
      (milestone) => parseTimestampMs(milestone.created_at) > milestoneSeenMs
    ).length;

    const approvalSeenMs = parseTimestampMs(tabLastSeenById.task_approvals);
    counts.task_approvals = projectApprovalTasks.filter((task) => {
      return (
        parseTimestampMs(task.created_at) > approvalSeenMs ||
        parseTimestampMs(task.decided_at) > approvalSeenMs
      );
    }).length;

    const progressSeenMs = parseTimestampMs(tabLastSeenById.progress_updates);
    counts.progress_updates = projectUpdates.filter(
      (update) => parseTimestampMs(update.created_at) > progressSeenMs
    ).length;

    const threadsSeenMs = parseTimestampMs(tabLastSeenById.questions_threads);
    counts.questions_threads = questionMessages.filter(
      (message) => parseTimestampMs(message.created_at) > threadsSeenMs
    ).length;

    const filesSeenMs = parseTimestampMs(tabLastSeenById.files_documents);
    counts.files_documents = projectFiles.filter(
      (file) => parseTimestampMs(file.created_at) > filesSeenMs
    ).length;

    if (isProjectAdmin) {
      const adminSeenMs = parseTimestampMs(tabLastSeenById.admin_workspace);
      const adminNewCount =
        projectUpdates.filter((update) => parseTimestampMs(update.created_at) > adminSeenMs).length +
        questionMessages.filter((message) => parseTimestampMs(message.created_at) > adminSeenMs).length +
        projectApprovalTasks.filter(
          (task) =>
            parseTimestampMs(task.created_at) > adminSeenMs ||
            parseTimestampMs(task.decided_at) > adminSeenMs
        ).length;
      counts.admin_workspace = adminNewCount;
    }

    return counts;
  }, [
    isProjectAdmin,
    projectAccessItems,
    projectApprovalTasks,
    projectClientIntake,
    projectFiles,
    projectMilestones,
    projectUpdates,
    questionMessages,
    selectedProject,
    tabLastSeenById
  ]);
  const accessStatusCounts = useMemo(() => {
    return projectAccessItems.reduce<Record<AccessItemStatus, number>>(
      (counts, item) => {
        counts[item.status] += 1;
        return counts;
      },
      {
        missing: 0,
        submitted: 0,
        verified: 0,
        not_needed: 0
      }
    );
  }, [projectAccessItems]);

  useEffect(() => {
    if (availableWorkspaceTabs.length === 0) {
      return;
    }

    if (!availableWorkspaceTabs.some((tab) => tab.id === activeWorkspaceTab)) {
      setActiveWorkspaceTab(availableWorkspaceTabs[0].id);
    }
  }, [activeWorkspaceTab, availableWorkspaceTabs]);

  useEffect(() => {
    if (typeof window === "undefined" || !session || !selectedProjectId) {
      setTabLastSeenById({});
      return;
    }

    const storageKey = getTabLastSeenStorageKey(session.user.id, selectedProjectId);
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      setTabLastSeenById({});
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as Record<string, unknown>;
      const next: TabLastSeenById = {};
      for (const tab of portalWorkspaceTabs) {
        const value = parsed[tab.id];
        if (typeof value === "string" && value.trim()) {
          next[tab.id] = value;
        }
      }
      setTabLastSeenById(next);
    } catch {
      setTabLastSeenById({});
    }
  }, [selectedProjectId, session]);

  useEffect(() => {
    if (typeof window === "undefined" || !session || !selectedProjectId) {
      return;
    }

    const storageKey = getTabLastSeenStorageKey(session.user.id, selectedProjectId);
    window.localStorage.setItem(storageKey, JSON.stringify(tabLastSeenById));
  }, [selectedProjectId, session, tabLastSeenById]);

  useEffect(() => {
    if (!session || !selectedProjectId) {
      return;
    }

    if (!availableWorkspaceTabs.some((tab) => tab.id === activeWorkspaceTab)) {
      return;
    }

    const latestTabActivityMs = projectTabLatestActivityMs[activeWorkspaceTab] || 0;
    if (!latestTabActivityMs) {
      return;
    }

    const seenMs = parseTimestampMs(tabLastSeenById[activeWorkspaceTab]);
    if (seenMs >= latestTabActivityMs) {
      return;
    }

    setTabLastSeenById((current) => ({
      ...current,
      [activeWorkspaceTab]: new Date(latestTabActivityMs).toISOString()
    }));
  }, [
    activeWorkspaceTab,
    availableWorkspaceTabs,
    projectTabLatestActivityMs,
    selectedProjectId,
    session,
    tabLastSeenById
  ]);

  useEffect(() => {
    setAuthMessage("");
  }, [authMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const typeFromUrl = hashParams.get("type") || searchParams.get("type");

    if (typeFromUrl === "recovery") {
      setIsRecoveryMode(true);
      setAuthMessage("Set a new password to continue.");
    }
  }, []);

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
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setAuthMessage("Set a new password to continue.");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!portalError) {
      return;
    }

    const alertMessage = portalError.includes("active_project_exists")
      ? formatClientProjectSubmissionError(portalError)
      : portalError;

    setAlertModal({
      tone: "error",
      title: "Action Failed",
      message: alertMessage
    });
  }, [portalError]);

  const loadProjects = useCallback(async () => {
    if (!supabase || !session) {
      return;
    }

    setIsLoadingProjects(true);
    setPortalError("");

    const { data, error } = await supabase
      .from("projects")
      .select("id,name,status,progress,quoted_amount,amount_paid,start_date,due_date,summary,updated_at")
      .order("updated_at", { ascending: false });

    setIsLoadingProjects(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    const rows = (data ?? []) as PortalProject[];
    const selectedProjectFromUrl =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("project");

    setProjects(rows);
    setSelectedProjectId((current) => {
      if (selectedProjectFromUrl && rows.some((row) => row.id === selectedProjectFromUrl)) {
        return selectedProjectFromUrl;
      }

      if (isProjectAdmin) {
        return null;
      }

      if (current && rows.some((row) => row.id === current)) {
        return current;
      }

      return rows[0]?.id ?? null;
    });
  }, [isProjectAdmin, session, supabase]);

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveWorkspaceTab("active_project");

    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("project", projectId);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const loadProjectData = useCallback(
    async (projectId: string) => {
      if (!supabase || !session) {
        return;
      }

      setIsLoadingProjectData(true);
      setPortalError("");
      setProjectContacts([]);
      setSelectedProjectPayments([]);

      const [
        updatesResult,
        questionsResult,
        questionMessagesResult,
        filesResult,
        milestonesResult,
        approvalsResult,
        intakeResult,
        accessItemsResult,
        projectPaymentsResult,
        membershipResult,
        memberRolesResult
      ] = await Promise.all([
        supabase
          .from("project_updates")
          .select("id,title,body,progress,created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_questions")
          .select("id,project_id,author_id,question,created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_question_messages")
          .select(
            "id,question_id,project_id,author_id,message,attachment_url,attachment_file_name,attachment_file_path,attachment_mime_type,created_at"
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: true }),
        supabase
          .from("project_files")
          .select("id,file_name,file_path,mime_type,size_bytes,created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_milestones")
          .select("id,project_id,title,details,due_date,status,sort_order,created_at")
          .eq("project_id", projectId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("project_approval_tasks")
          .select(
            "id,project_id,title,details,status,requested_by,decided_by,decided_at,client_note,created_at"
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_client_intake")
          .select(
            "project_id,company_name,website_url,target_audience,primary_goal,secondary_goal,timeline_goal,success_metrics,service_needs,cms_platform,notes,updated_at"
          )
          .eq("project_id", projectId)
          .maybeSingle(),
        supabase
          .from("project_access_items")
          .select(
            "id,project_id,access_key,title,description,service_area,status,login_url,account_email,username,secret_value,secure_link,notes,updated_at,created_at"
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: true }),
        supabase
          .from("project_payments")
          .select(
            "id,project_id,provider,provider_order_id,provider_capture_id,status,amount,currency_code,payer_user_id,payer_email,created_at"
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_members")
          .select("role")
          .eq("project_id", projectId)
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("project_members")
          .select("user_id,role")
          .eq("project_id", projectId)
      ]);

      setIsLoadingProjectData(false);

      if (
        updatesResult.error ||
        questionsResult.error ||
        questionMessagesResult.error ||
        filesResult.error ||
        milestonesResult.error ||
        approvalsResult.error ||
        intakeResult.error ||
        accessItemsResult.error ||
        projectPaymentsResult.error ||
        membershipResult.error ||
        memberRolesResult.error
      ) {
        setPortalError(
          updatesResult.error?.message ||
            questionsResult.error?.message ||
            questionMessagesResult.error?.message ||
            filesResult.error?.message ||
            milestonesResult.error?.message ||
            approvalsResult.error?.message ||
            intakeResult.error?.message ||
            accessItemsResult.error?.message ||
            projectPaymentsResult.error?.message ||
            membershipResult.error?.message ||
            memberRolesResult.error?.message ||
            "Unable to load project data."
        );
        return;
      }

      setProjectUpdates((updatesResult.data ?? []) as ProjectUpdate[]);
      setProjectQuestions((questionsResult.data ?? []) as ProjectQuestion[]);
      setQuestionMessages((questionMessagesResult.data ?? []) as QuestionMessage[]);
      setProjectFiles((filesResult.data ?? []) as ProjectFile[]);
      setProjectMilestones((milestonesResult.data ?? []) as ProjectMilestone[]);
      setProjectApprovalTasks((approvalsResult.data ?? []) as ProjectApprovalTask[]);
      setProjectClientIntake((intakeResult.data ?? null) as ClientIntakeProfile | null);
      setProjectAccessItems((accessItemsResult.data ?? []) as ProjectAccessItem[]);
      setSelectedProjectPayments((projectPaymentsResult.data ?? []) as ProjectPayment[]);
      const memberRoleMap: Record<string, MemberRole> = {};
      for (const row of memberRolesResult.data ?? []) {
        memberRoleMap[row.user_id] = row.role as MemberRole;
      }
      setMemberRolesByUserId(memberRoleMap);
      setCurrentRole((membershipResult.data?.role as MemberRole | undefined) ?? null);

      const { data: contactRows, error: contactsError } = await supabase.rpc("get_project_contacts", {
        project_uuid: projectId
      });

      if (contactsError) {
        setProjectContacts([]);
        return;
      }

      const contacts = ((contactRows ?? []) as Array<{
        email?: string | null;
        full_name?: string | null;
        role?: string | null;
      }>)
        .map((row) => {
          const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
          if (!email) {
            return null;
          }

          const role = row.role === "owner" || row.role === "manager" || row.role === "client" ? row.role : "client";
          const fullName =
            typeof row.full_name === "string" && row.full_name.trim().length > 0
              ? row.full_name.trim()
              : deriveNameFromEmail(email);

          return {
            email,
            full_name: fullName,
            role
          };
        })
        .filter((entry) => entry !== null) as ProjectContact[];

      setProjectContacts(contacts);
    },
    [session, supabase]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !session) {
      return;
    }

    const url = new URL(window.location.href);
    const paypalStatus = url.searchParams.get("paypal");
    const orderId = url.searchParams.get("token");
    const projectIdFromUrl = url.searchParams.get("project");

    if (paypalStatus === "cancel") {
      setPaypalStatusMessage("PayPal checkout was canceled.");
      url.searchParams.delete("paypal");
      url.searchParams.delete("token");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }

    if (paypalStatus !== "success" || !orderId || !projectIdFromUrl) {
      return;
    }

    if (handledPaypalOrdersRef.current[orderId]) {
      return;
    }

    handledPaypalOrdersRef.current[orderId] = true;

    void (async () => {
      setIsCapturingPaypalCheckout(true);
      setPortalError("");

      try {
        const response = await fetch("/api/portal/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            projectId: projectIdFromUrl,
            orderId
          })
        });

        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          setPortalError(payload.error || "Unable to confirm PayPal payment.");
          return;
        }

        setPaypalStatusMessage("Payment received. Billing summary has been updated.");
        setSelectedProjectId(projectIdFromUrl);
        await loadProjects();
        await loadProjectData(projectIdFromUrl);
      } catch (error) {
        setPortalError(error instanceof Error ? error.message : "Unable to confirm PayPal payment.");
      } finally {
        setIsCapturingPaypalCheckout(false);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("paypal");
        cleanUrl.searchParams.delete("token");
        window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
      }
    })();
  }, [loadProjectData, loadProjects, session]);

  const loadOnboardingLeads = useCallback(async () => {
    if (!supabase || !session || !isBootstrapManager) {
      setOnboardingLeads([]);
      setOnboardingLeadDrafts({});
      setSavingOnboardingLeadById({});
      setConvertingOnboardingLeadById({});
      return;
    }

    setIsLoadingOnboardingLeads(true);
    setPortalError("");

    const { data, error } = await supabase
      .from("onboarding_leads")
      .select(
        "id,full_name,email,company_name,phone,services_needed,budget_range,timeline_goal,preferred_call_at,goals,notes,status,manager_notes,proposed_project_name,quoted_amount,deposit_amount,payment_reference,converted_project_id,converted_at,created_by,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    setIsLoadingOnboardingLeads(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    const rows = (data ?? []) as OnboardingLead[];
    setOnboardingLeads(rows);

    const nextDrafts: Record<string, OnboardingLeadDraft> = {};
    for (const lead of rows) {
      nextDrafts[lead.id] = {
        status: lead.status,
        manager_notes: lead.manager_notes || "",
        proposed_project_name: lead.proposed_project_name || "",
        quoted_amount: lead.quoted_amount !== null ? String(lead.quoted_amount) : "",
        deposit_amount: lead.deposit_amount !== null ? String(lead.deposit_amount) : "",
        payment_reference: lead.payment_reference || ""
      };
    }

    setOnboardingLeadDrafts(nextDrafts);
    setSavingOnboardingLeadById({});
    setConvertingOnboardingLeadById({});
  }, [isBootstrapManager, session, supabase]);

  const loadPaymentFeatureFlags = useCallback(async () => {
    if (!supabase || !session) {
      setPaymentFeatureFlags({
        manual_payments_enabled: true,
        recurring_payments_enabled: true
      });
      setPaymentFeatureSettingsDraft({
        manual_payments_enabled: true,
        recurring_payments_enabled: true
      });
      setIsLoadingPaymentFeatureSettings(false);
      setPaymentFeatureSettingsMessage("");
      return;
    }

    setIsLoadingPaymentFeatureSettings(true);

    const { data, error } = await supabase.rpc("get_payment_feature_flags");

    setIsLoadingPaymentFeatureSettings(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    const row = (Array.isArray(data) ? data[0] : null) as
      | {
          manual_payments_enabled?: boolean | null;
          recurring_payments_enabled?: boolean | null;
        }
      | null;

    const nextFlags: PaymentFeatureFlags = {
      manual_payments_enabled: row?.manual_payments_enabled !== false,
      recurring_payments_enabled: row?.recurring_payments_enabled !== false
    };

    setPaymentFeatureFlags(nextFlags);
    setPaymentFeatureSettingsDraft(nextFlags);
  }, [session, supabase]);

  const loadManagerBillingData = useCallback(async () => {
    if (!supabase || !session || !isBootstrapManager) {
      setProjectPayments([]);
      setProjectBillingProfiles([]);
      setBillingProfileDrafts({});
      setIsSavingBillingProfileByProjectId({});
      setIsLoadingManagerBilling(false);
      setManagerBillingMessage("");
      return;
    }

    setIsLoadingManagerBilling(true);
    setPortalError("");

    const [paymentsResult, billingProfilesResult] = await Promise.all([
      supabase
        .from("project_payments")
        .select(
          "id,project_id,provider,provider_order_id,provider_capture_id,status,amount,currency_code,payer_user_id,payer_email,created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("project_billing_profiles")
        .select(
          "project_id,recurring_enabled,recurring_amount,recurring_interval,next_payment_due_at,autopay_provider,notes,updated_at"
        )
        .order("updated_at", { ascending: false })
    ]);

    setIsLoadingManagerBilling(false);

    if (paymentsResult.error || billingProfilesResult.error) {
      setPortalError(
        paymentsResult.error?.message || billingProfilesResult.error?.message || "Unable to load manager billing data."
      );
      return;
    }

    const payments = (paymentsResult.data ?? []) as ProjectPayment[];
    const billingProfiles = (billingProfilesResult.data ?? []) as ProjectBillingProfile[];

    setProjectPayments(payments);
    setProjectBillingProfiles(billingProfiles);
  }, [isBootstrapManager, session, supabase]);

  useEffect(() => {
    if (!session) {
      setProjects([]);
      setSelectedProjectId(null);
      setProjectUpdates([]);
      setProjectQuestions([]);
      setQuestionMessages([]);
      setProjectFiles([]);
      setProjectMilestones([]);
      setProjectApprovalTasks([]);
      setProjectClientIntake(null);
      setProjectAccessItems([]);
      setSelectedProjectPayments([]);
      setProjectPayments([]);
      setTabLastSeenById({});
      setProjectBillingProfiles([]);
      setBillingProfileDrafts({});
      setIsLoadingManagerBilling(false);
      setIsSavingBillingProfileByProjectId({});
      setManagerBillingMessage("");
      setPaymentFeatureFlags({
        manual_payments_enabled: true,
        recurring_payments_enabled: true
      });
      setPaymentFeatureSettingsDraft({
        manual_payments_enabled: true,
        recurring_payments_enabled: true
      });
      setIsLoadingPaymentFeatureSettings(false);
      setIsSavingPaymentFeatureSettings(false);
      setPaymentFeatureSettingsMessage("");
      setProjectContacts([]);
      setQuestionMessageAttachmentUrls({});
      setMemberRolesByUserId({});
      setCurrentRole(null);
      setIsBootstrapManager(false);
      setOnboardingLeads([]);
      setOnboardingLeadDrafts({});
      setSavingOnboardingLeadById({});
      setConvertingOnboardingLeadById({});
      setOnboardingSearchDraft("");
      setOnboardingStatusFilter("all");
      setScheduleCallMessage("");
      setScheduleCallError("");
      setIsSubmittingScheduleCall(false);
      setIsClientProjectRequestOpen(false);
      setClientProjectRequestName("");
      setClientProjectRequestSummary("");
      setClientProjectRequestStartDate("");
      setClientProjectRequestDueDate("");
      setIsSubmittingClientProjectRequest(false);
      setClientProjectRequestMessage("");
      setClientProjectRequestError("");
      setReplyDrafts({});
      setReplyUrlDrafts({});
      setReplyFileDrafts({});
      setReplyFilePreviewUrls({});
      setReplySubmittingByQuestionId({});
      setApprovalResponseDrafts({});
      setApprovalSubmittingById({});
      setAccessItemDrafts({});
      setAccessFieldVisibilityById({});
      setSavingAccessItemById({});
      setExpandedAccessItemIds({});
      setNewProjectEmailSuggestions([]);
      setIsLoadingNewProjectEmailSuggestions(false);
      setIntakeCompanyNameDraft("");
      setIntakeWebsiteUrlDraft("");
      setIntakeTargetAudienceDraft("");
      setIntakePrimaryGoalDraft("");
      setIntakeSecondaryGoalDraft("");
      setIntakeTimelineGoalDraft("");
      setIntakeSuccessMetricsDraft("");
      setIntakeCmsPlatformDraft("");
      setIntakeNotesDraft("");
      setIntakeServiceNeedsDraft([]);
      setIsSavingClientIntake(false);
      setIsGeneratingAccessChecklist(false);
      setIsArchivingProject(false);
      setIsDeletingProject(false);
      setIsClientIntakeOpen(false);
      setIsAccessChecklistOpen(false);
      setIsProjectSnapshotModalOpen(false);
      setAssignmentMessage("");
      setIsManagerProjectsDrawerOpen(true);
      setIsManagerControlsOpen(false);
      setPaypalAmountDraft("");
      setIsStartingPaypalCheckout(false);
      setIsCapturingPaypalCheckout(false);
      setPaypalStatusMessage("");
      handledPaypalOrdersRef.current = {};
      return;
    }

    void (async () => {
      if (supabase) {
        await supabase.rpc("claim_pending_project_memberships");
      }
      await loadProjects();
    })();
  }, [loadProjects, session, supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      setIsBootstrapManager(false);
      return;
    }

    let cancelled = false;

    supabase.rpc("is_bootstrap_manager").then(({ data, error }) => {
      if (cancelled) {
        return;
      }

      if (error) {
        setPortalError(error.message);
        return;
      }

      setIsBootstrapManager(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [session, supabase]);

  useEffect(() => {
    void loadManagerBillingData();
  }, [loadManagerBillingData]);

  useEffect(() => {
    void loadPaymentFeatureFlags();
  }, [loadPaymentFeatureFlags]);

  useEffect(() => {
    if (!isBootstrapManager) {
      setBillingProfileDrafts({});
      return;
    }

    const nextDrafts: Record<string, ProjectBillingProfileDraft> = {};
    for (const project of projects) {
      nextDrafts[project.id] = createBillingProfileDraft(billingProfileByProjectId[project.id]);
    }
    setBillingProfileDrafts(nextDrafts);
  }, [billingProfileByProjectId, isBootstrapManager, projects]);

  useEffect(() => {
    if (!session || !selectedProjectId) {
      setProjectUpdates([]);
      setProjectQuestions([]);
      setQuestionMessages([]);
      setProjectFiles([]);
      setProjectMilestones([]);
      setProjectApprovalTasks([]);
      setProjectClientIntake(null);
      setProjectAccessItems([]);
      setSelectedProjectPayments([]);
      setProjectContacts([]);
      setQuestionMessageAttachmentUrls({});
      setMemberRolesByUserId({});
      setCurrentRole(null);
      setReplyDrafts({});
      setReplyUrlDrafts({});
      setReplyFileDrafts({});
      setReplyFilePreviewUrls({});
      setReplySubmittingByQuestionId({});
      setApprovalResponseDrafts({});
      setApprovalSubmittingById({});
      setAccessItemDrafts({});
      setAccessFieldVisibilityById({});
      setSavingAccessItemById({});
      setExpandedAccessItemIds({});
      setIntakeCompanyNameDraft("");
      setIntakeWebsiteUrlDraft("");
      setIntakeTargetAudienceDraft("");
      setIntakePrimaryGoalDraft("");
      setIntakeSecondaryGoalDraft("");
      setIntakeTimelineGoalDraft("");
      setIntakeSuccessMetricsDraft("");
      setIntakeCmsPlatformDraft("");
      setIntakeNotesDraft("");
      setIntakeServiceNeedsDraft([]);
      setIsArchivingProject(false);
      setIsDeletingProject(false);
      setIsClientIntakeOpen(false);
      setIsAccessChecklistOpen(false);
      setIsProjectSnapshotModalOpen(false);
      return;
    }

    void loadProjectData(selectedProjectId);
  }, [loadProjectData, selectedProjectId, session]);

  useEffect(() => {
    if (!supabase || !session || !isBootstrapManager) {
      setNewProjectEmailSuggestions([]);
      setIsLoadingNewProjectEmailSuggestions(false);
      return;
    }

    const query = newProjectClientEmail.trim().toLowerCase();
    if (query.length < 2) {
      setNewProjectEmailSuggestions([]);
      setIsLoadingNewProjectEmailSuggestions(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsLoadingNewProjectEmailSuggestions(true);

      const { data, error } = await supabase.rpc("search_project_user_emails", {
        project_uuid: null,
        search_query: query,
        result_limit: 8
      });

      if (cancelled) {
        return;
      }

      setIsLoadingNewProjectEmailSuggestions(false);

      if (error) {
        setNewProjectEmailSuggestions([]);
        return;
      }

      const suggestions = ((data ?? []) as Array<{ email?: string | null; full_name?: string | null }>)
        .map((row) => {
          const emailValue = typeof row.email === "string" ? row.email.trim() : "";
          const fullNameValue =
            typeof row.full_name === "string" && row.full_name.trim().length > 0
              ? row.full_name.trim()
              : null;

          if (!emailValue) {
            return null;
          }

          return {
            email: emailValue,
            full_name: fullNameValue
          };
        })
        .filter((entry): entry is ClientDirectorySuggestion => entry !== null);

      const dedupedSuggestions = Array.from(
        new Map(suggestions.map((entry) => [entry.email.toLowerCase(), entry])).values()
      );

      setNewProjectEmailSuggestions(dedupedSuggestions);
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isBootstrapManager, newProjectClientEmail, session, supabase]);

  useEffect(() => {
    if (!selectedProject) {
      setProjectStatusDraft("planning");
      setProjectProgressDraft("0");
      setProjectStartDateDraft("");
      setProjectDueDateDraft("");
      setProjectSummaryDraft("");
      setProjectQuotedAmountDraft("");
      setProjectAmountPaidDraft("");
      setIsProjectSnapshotModalOpen(false);
      setPaypalStatusMessage("");
      return;
    }

    setProjectStatusDraft((selectedProject.status as ProjectStatus) || "planning");
    setProjectProgressDraft(String(selectedProject.progress));
    setProjectStartDateDraft(selectedProject.start_date || "");
    setProjectDueDateDraft(selectedProject.due_date || "");
    setProjectSummaryDraft(selectedProject.summary || "");
    setProjectQuotedAmountDraft(
      selectedProject.quoted_amount !== null ? String(selectedProject.quoted_amount) : ""
    );
    setProjectAmountPaidDraft(selectedProject.amount_paid !== null ? String(selectedProject.amount_paid) : "");
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProjectBalance !== null && selectedProjectBalance > 0) {
      setPaypalAmountDraft(selectedProjectBalance.toFixed(2));
      return;
    }

    setPaypalAmountDraft("");
  }, [selectedProject?.id, selectedProjectBalance]);

  useEffect(() => {
    if (!isProjectSnapshotModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProjectSnapshotModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isProjectSnapshotModalOpen]);

  useEffect(() => {
    if (!projectClientIntake) {
      setIntakeCompanyNameDraft("");
      setIntakeWebsiteUrlDraft("");
      setIntakeTargetAudienceDraft("");
      setIntakePrimaryGoalDraft("");
      setIntakeSecondaryGoalDraft("");
      setIntakeTimelineGoalDraft("");
      setIntakeSuccessMetricsDraft("");
      setIntakeCmsPlatformDraft("");
      setIntakeNotesDraft("");
      setIntakeServiceNeedsDraft([]);
      return;
    }

    setIntakeCompanyNameDraft(projectClientIntake.company_name || "");
    setIntakeWebsiteUrlDraft(projectClientIntake.website_url || "");
    setIntakeTargetAudienceDraft(projectClientIntake.target_audience || "");
    setIntakePrimaryGoalDraft(projectClientIntake.primary_goal || "");
    setIntakeSecondaryGoalDraft(projectClientIntake.secondary_goal || "");
    setIntakeTimelineGoalDraft(projectClientIntake.timeline_goal || "");
    setIntakeSuccessMetricsDraft(projectClientIntake.success_metrics || "");
    setIntakeCmsPlatformDraft(projectClientIntake.cms_platform || "");
    setIntakeNotesDraft(projectClientIntake.notes || "");
    setIntakeServiceNeedsDraft(projectClientIntake.service_needs || []);
  }, [projectClientIntake]);

  useEffect(() => {
    const nextDrafts: Record<string, AccessItemDraft> = {};
    for (const item of projectAccessItems) {
      nextDrafts[item.id] = {
        status: item.status,
        login_url: item.login_url || "",
        account_email: item.account_email || "",
        username: item.username || "",
        secret_value: item.secret_value || "",
        secure_link: item.secure_link || "",
        notes: item.notes || ""
      };
    }
    setAccessItemDrafts(nextDrafts);
    setSavingAccessItemById({});
  }, [projectAccessItems]);

  useEffect(() => {
    setExpandedAccessItemIds((current) => {
      const next: Record<string, boolean> = {};
      for (const item of projectAccessItems) {
        next[item.id] = current[item.id] ?? false;
      }
      return next;
    });
  }, [projectAccessItems]);

  useEffect(() => {
    setAccessFieldVisibilityById((current) => {
      const next: Record<string, AccessItemVisibilityState> = {};
      for (const item of projectAccessItems) {
        next[item.id] = current[item.id] ?? { ...defaultAccessItemVisibility };
      }
      return next;
    });
  }, [projectAccessItems]);

  useEffect(() => {
    if (questionFilePreviewUrl) {
      return () => URL.revokeObjectURL(questionFilePreviewUrl);
    }
  }, [questionFilePreviewUrl]);

  useEffect(() => {
    const urls = Object.values(replyFilePreviewUrls);
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [replyFilePreviewUrls]);

  useEffect(() => {
    if (!supabase || questionMessages.length === 0) {
      setQuestionMessageAttachmentUrls({});
      return;
    }

    const withAttachments = questionMessages.filter((message) => message.attachment_file_path);
    if (withAttachments.length === 0) {
      setQuestionMessageAttachmentUrls({});
      return;
    }

    let cancelled = false;

    void (async () => {
      const entries = await Promise.all(
        withAttachments.map(async (question) => {
          const { data } = await supabase.storage
            .from("project-files")
            .createSignedUrl(question.attachment_file_path as string, 3600);
          return [question.id, data?.signedUrl || ""] as const;
        })
      );

      if (cancelled) {
        return;
      }

      const nextMap: Record<string, string> = {};
      for (const [id, url] of entries) {
        if (url) {
          nextMap[id] = url;
        }
      }
      setQuestionMessageAttachmentUrls(nextMap);
    })();

    return () => {
      cancelled = true;
    };
  }, [questionMessages, supabase]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    const nextEmail = email.trim();
    if (!nextEmail) {
      setAuthMessage("Enter your email to continue.");
      return;
    }

    if (!password) {
      setAuthMessage("Enter your password.");
      return;
    }

    if (authMode === "register") {
      if (!fullName.trim()) {
        setAuthMessage("Full name is required.");
        return;
      }

      if (password.length < 8) {
        setAuthMessage("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setAuthMessage("Passwords do not match.");
        return;
      }
    }

    setIsSubmittingAuth(true);
    setAuthMessage("");

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: nextEmail,
        password
      });

      setIsSubmittingAuth(false);

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setAuthMessage("Signed in.");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    const normalizedFullName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/portal` : undefined,
        data: {
          registered_full_name: normalizedFullName || null,
          full_name: normalizedFullName || null,
          name: normalizedFullName || null
        }
      }
    });

    setIsSubmittingAuth(false);
    if (error) {
      setAuthMessage(error.message);
      return;
    }

    if (data.session) {
      setAuthMessage("Account created and signed in.");
    } else {
      setAuthMessage("Registration successful. Check your email to confirm your account.");
    }

    setPassword("");
    setConfirmPassword("");
    setFullName("");
  }

  async function handleForgotPassword() {
    if (!supabase) {
      return;
    }

    const nextEmail = email.trim();
    if (!nextEmail) {
      setAuthMessage("Enter your email first, then click forgot password.");
      return;
    }

    setIsSendingResetEmail(true);
    setAuthMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(nextEmail, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/portal` : undefined
    });

    setIsSendingResetEmail(false);

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setAuthMessage("Password reset email sent. Open the link and set your new password.");
  }

  async function handleCompletePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session) {
      return;
    }

    if (recoveryPassword.length < 8) {
      setAuthMessage("New password must be at least 8 characters.");
      return;
    }

    if (recoveryPassword !== recoveryConfirmPassword) {
      setAuthMessage("New passwords do not match.");
      return;
    }

    setIsUpdatingRecoveryPassword(true);
    setAuthMessage("");

    const { error } = await supabase.auth.updateUser({ password: recoveryPassword });

    setIsUpdatingRecoveryPassword(false);

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setRecoveryPassword("");
    setRecoveryConfirmPassword("");
    setIsRecoveryMode(false);
    setAuthMessage("Password updated. You can continue to your portal.");

    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    for (const url of Object.values(replyFilePreviewUrls)) {
      URL.revokeObjectURL(url);
    }

    await supabase.auth.signOut();
    setAuthMessage("");
    setPassword("");
    setConfirmPassword("");
    setRecoveryPassword("");
    setRecoveryConfirmPassword("");
    setQuestionFileDraft(null);
    setQuestionFilePreviewUrl(null);
    setReplyDrafts({});
    setReplyUrlDrafts({});
    setReplyFileDrafts({});
    setReplyFilePreviewUrls({});
    setReplySubmittingByQuestionId({});
    setIsRecoveryMode(false);
    setScheduleCallMessage("");
    setScheduleCallError("");
    setPortalError("");
    setPaypalAmountDraft("");
    setIsStartingPaypalCheckout(false);
    setIsCapturingPaypalCheckout(false);
    setPaypalStatusMessage("");
    handledPaypalOrdersRef.current = {};
  }

  function handleAlertModalClose() {
    setAlertModal(null);
    setPortalError("");
  }

  function handleQuestionFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    setQuestionFileDraft(file);

    if (!file) {
      setQuestionFilePreviewUrl(null);
      return;
    }

    if (file.type.startsWith("image/")) {
      setQuestionFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setQuestionFilePreviewUrl(null);
    }
  }

  async function uploadThreadAttachment({
    file,
    projectId,
    userId,
    questionId
  }: {
    file: File;
    projectId: string;
    userId: string;
    questionId: string;
  }): Promise<UploadThreadAttachmentResult> {
    if (!supabase) {
      return { ok: false, error: "Supabase client is not ready." };
    }

    const safeFileName = toSafeFileName(file.name);
    const storagePath = `${projectId}/questions/${questionId}/${userId}/${Date.now()}-${safeFileName}`;

    const uploadResult = await supabase.storage
      .from("project-files")
      .upload(storagePath, file, { upsert: false });

    if (uploadResult.error) {
      return { ok: false, error: uploadResult.error.message };
    }

    return {
      ok: true,
      attachment_file_name: file.name,
      attachment_file_path: storagePath,
      attachment_mime_type: file.type || null
    };
  }

  async function handleSubmitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const question = questionDraft.trim();
    if (!question) {
      return;
    }

    const attachmentUrl = normalizeExternalUrl(questionUrlDraft);
    if (questionUrlDraft.trim() && !attachmentUrl) {
      setPortalError("Please enter a valid URL.");
      return;
    }

    setIsSubmittingQuestion(true);
    setPortalError("");

    const { data: questionRow, error: questionError } = await supabase
      .from("project_questions")
      .insert({
        project_id: selectedProjectId,
        author_id: session.user.id,
        question: clipThreadTitle(question)
      })
      .select("id")
      .single();

    if (questionError || !questionRow?.id) {
      setIsSubmittingQuestion(false);
      setPortalError(questionError?.message || "Unable to create question thread.");
      return;
    }

    let attachmentPayload: {
      attachment_file_name: string | null;
      attachment_file_path: string | null;
      attachment_mime_type: string | null;
    } = {
      attachment_file_name: null,
      attachment_file_path: null,
      attachment_mime_type: null
    };

    if (questionFileDraft) {
      const upload = await uploadThreadAttachment({
        file: questionFileDraft,
        projectId: selectedProjectId,
        userId: session.user.id,
        questionId: questionRow.id
      });

      if (!upload.ok) {
        setIsSubmittingQuestion(false);
        setPortalError(upload.error);
        return;
      }

      attachmentPayload = {
        attachment_file_name: upload.attachment_file_name,
        attachment_file_path: upload.attachment_file_path,
        attachment_mime_type: upload.attachment_mime_type
      };
    }

    const { error } = await supabase.from("project_question_messages").insert({
      question_id: questionRow.id,
      project_id: selectedProjectId,
      author_id: session.user.id,
      message: question,
      attachment_url: attachmentUrl,
      attachment_file_name: attachmentPayload.attachment_file_name,
      attachment_file_path: attachmentPayload.attachment_file_path,
      attachment_mime_type: attachmentPayload.attachment_mime_type
    });

    setIsSubmittingQuestion(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setQuestionDraft("");
    setQuestionUrlDraft("");
    setQuestionFileDraft(null);
    setQuestionFilePreviewUrl(null);
    await loadProjectData(selectedProjectId);
  }

  function handleThreadReplyFileChange(questionId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    setReplyFileDrafts((current) => ({ ...current, [questionId]: file }));

    setReplyFilePreviewUrls((current) => {
      const next = { ...current };

      if (next[questionId]) {
        URL.revokeObjectURL(next[questionId]);
        delete next[questionId];
      }

      if (file && file.type.startsWith("image/")) {
        next[questionId] = URL.createObjectURL(file);
      }

      return next;
    });
  }

  async function handleSubmitThreadReply(questionId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const replyText = (replyDrafts[questionId] || "").trim();
    const replyUrlRaw = replyUrlDrafts[questionId] || "";
    const replyUrl = normalizeExternalUrl(replyUrlRaw);
    const replyFile = replyFileDrafts[questionId] || null;

    if (!replyText) {
      setPortalError("Reply message cannot be empty.");
      return;
    }

    if (replyUrlRaw.trim() && !replyUrl) {
      setPortalError("Please enter a valid URL.");
      return;
    }

    setReplySubmittingByQuestionId((current) => ({ ...current, [questionId]: true }));
    setPortalError("");

    let attachmentPayload: {
      attachment_file_name: string | null;
      attachment_file_path: string | null;
      attachment_mime_type: string | null;
    } = {
      attachment_file_name: null,
      attachment_file_path: null,
      attachment_mime_type: null
    };

    if (replyFile) {
      const upload = await uploadThreadAttachment({
        file: replyFile,
        projectId: selectedProjectId,
        userId: session.user.id,
        questionId
      });

      if (!upload.ok) {
        setReplySubmittingByQuestionId((current) => ({ ...current, [questionId]: false }));
        setPortalError(upload.error);
        return;
      }

      attachmentPayload = {
        attachment_file_name: upload.attachment_file_name,
        attachment_file_path: upload.attachment_file_path,
        attachment_mime_type: upload.attachment_mime_type
      };
    }

    const { error } = await supabase.from("project_question_messages").insert({
      question_id: questionId,
      project_id: selectedProjectId,
      author_id: session.user.id,
      message: replyText,
      attachment_url: replyUrl,
      attachment_file_name: attachmentPayload.attachment_file_name,
      attachment_file_path: attachmentPayload.attachment_file_path,
      attachment_mime_type: attachmentPayload.attachment_mime_type
    });

    setReplySubmittingByQuestionId((current) => ({ ...current, [questionId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    setReplyDrafts((current) => ({ ...current, [questionId]: "" }));
    setReplyUrlDrafts((current) => ({ ...current, [questionId]: "" }));
    setReplyFileDrafts((current) => ({ ...current, [questionId]: null }));
    setReplyFilePreviewUrls((current) => {
      if (!current[questionId]) {
        return current;
      }

      URL.revokeObjectURL(current[questionId]);
      const next = { ...current };
      delete next[questionId];
      return next;
    });

    await loadProjectData(selectedProjectId);
  }

  async function handleUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !supabase || !session || !selectedProjectId) {
      return;
    }

    setIsUploadingFile(true);
    setPortalError("");

    const safeFileName = toSafeFileName(file.name);
    const storagePath = `${selectedProjectId}/${session.user.id}/${Date.now()}-${safeFileName}`;

    const uploadResult = await supabase.storage
      .from("project-files")
      .upload(storagePath, file, { upsert: false });

    if (uploadResult.error) {
      setIsUploadingFile(false);
      setPortalError(uploadResult.error.message);
      return;
    }

    const { error } = await supabase.from("project_files").insert({
      project_id: selectedProjectId,
      uploaded_by: session.user.id,
      file_name: file.name,
      file_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size
    });

    setIsUploadingFile(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    await loadProjectData(selectedProjectId);
  }

  async function handleDownloadFile(filePath: string) {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase.storage
      .from("project-files")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      setPortalError(error?.message || "Unable to generate download link.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function handleStartPayPalCheckout() {
    if (!session || !selectedProjectId || selectedProjectBalance === null) {
      return;
    }

    if (!manualPaymentsEnabled) {
      setPortalError("Manual payments are currently disabled by your manager.");
      return;
    }

    if (selectedProjectBalance <= 0) {
      setPortalError("This project has no balance due.");
      return;
    }

    const amount = parseUsdAmount(paypalAmountDraft);
    if (amount === null) {
      setPortalError("Enter a valid payment amount.");
      return;
    }

    if (amount > selectedProjectBalance + 0.009) {
      setPortalError("Payment amount cannot exceed the remaining balance.");
      return;
    }

    setIsStartingPaypalCheckout(true);
    setPortalError("");
    setPaypalStatusMessage("");

    try {
      const response = await fetch("/api/portal/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          amount
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        approveUrl?: string;
      };

      if (!response.ok || !payload.approveUrl) {
        setPortalError(payload.error || "Unable to start PayPal checkout.");
        return;
      }

      window.location.assign(payload.approveUrl);
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Unable to start PayPal checkout.");
    } finally {
      setIsStartingPaypalCheckout(false);
    }
  }

  function handlePaymentFeatureDraftChange(field: keyof PaymentFeatureSettingsDraft, value: boolean) {
    setPaymentFeatureSettingsDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSavePaymentFeatureSettings() {
    if (!supabase || !session || !canManagePaymentModeControls) {
      return;
    }

    setIsSavingPaymentFeatureSettings(true);
    setPortalError("");
    setPaymentFeatureSettingsMessage("");

    const { error } = await supabase.from("payment_feature_settings").upsert(
      {
        id: true,
        manual_payments_enabled: paymentFeatureSettingsDraft.manual_payments_enabled,
        recurring_payments_enabled: paymentFeatureSettingsDraft.recurring_payments_enabled,
        updated_by: session.user.id
      },
      { onConflict: "id" }
    );

    setIsSavingPaymentFeatureSettings(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setPaymentFeatureSettingsMessage("Payment settings updated.");
    await loadPaymentFeatureFlags();
    await loadManagerBillingData();
  }

  function handleBillingDraftChange(
    projectId: string,
    field: keyof ProjectBillingProfileDraft,
    value: string | boolean
  ) {
    setBillingProfileDrafts((current) => {
      const existing = current[projectId] || createBillingProfileDraft(null);
      const nextDraft: ProjectBillingProfileDraft = {
        ...existing,
        [field]: value
      } as ProjectBillingProfileDraft;

      if (field === "recurring_enabled" && value === false) {
        nextDraft.recurring_amount = "";
        nextDraft.next_payment_due_at = "";
      }

      return {
        ...current,
        [projectId]: nextDraft
      };
    });
  }

  async function handleSaveBillingProfile(projectId: string) {
    if (!supabase || !session || !isBootstrapManager) {
      return;
    }

    const draft = billingProfileDrafts[projectId];
    if (!draft) {
      return;
    }

    let recurringAmount: number | null = null;
    let nextPaymentDueAt: string | null = null;

    if (draft.recurring_enabled) {
      if (!recurringPaymentsEnabled) {
        setPortalError("Automatic/recurring payments are currently disabled in manager settings.");
        return;
      }

      recurringAmount = parseUsdAmount(draft.recurring_amount);
      if (recurringAmount === null) {
        setPortalError("Recurring amount must be a valid value greater than 0.");
        return;
      }

      nextPaymentDueAt = draft.next_payment_due_at.trim();
      if (!nextPaymentDueAt) {
        setPortalError("Select the next recurring payment date.");
        return;
      }
    }

    setIsSavingBillingProfileByProjectId((current) => ({ ...current, [projectId]: true }));
    setPortalError("");
    setManagerBillingMessage("");

    const { error } = await supabase.from("project_billing_profiles").upsert(
      {
        project_id: projectId,
        recurring_enabled: draft.recurring_enabled,
        recurring_amount: recurringAmount,
        recurring_interval: draft.recurring_enabled ? draft.recurring_interval : "monthly",
        next_payment_due_at: draft.recurring_enabled ? nextPaymentDueAt : null,
        autopay_provider: draft.recurring_enabled ? "paypal" : null,
        notes: draft.notes.trim() || null,
        updated_by: session.user.id
      },
      { onConflict: "project_id" }
    );

    setIsSavingBillingProfileByProjectId((current) => ({ ...current, [projectId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    setManagerBillingMessage("Recurring billing profile saved.");
    await loadManagerBillingData();
    await loadProjects();
  }

  async function handleCreateProjectAndAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !isBootstrapManager) {
      return;
    }

    const projectName = newProjectName.trim();
    const clientEmail = newProjectClientEmail.trim();
    const progress = parseProgress(newProjectProgress);
    const nextProjectSummary = newProjectSummary.trim();

    if (!projectName) {
      setPortalError("Project name is required.");
      return;
    }

    if (!clientEmail) {
      setPortalError("Client email is required.");
      return;
    }

    if (progress === null) {
      setPortalError("Project progress must be a number between 0 and 100.");
      return;
    }

    setIsCreatingProject(true);
    setPortalError("");
    setAssignmentMessage("");

    const { data: projectRow, error: createProjectError } = await supabase
      .from("projects")
      .insert({
        name: projectName,
        status: newProjectStatus,
        progress,
        summary: nextProjectSummary || null,
        start_date: newProjectStartDate || null,
        due_date: newProjectDueDate || null
      })
      .select("id")
      .single();

    if (createProjectError || !projectRow?.id) {
      setIsCreatingProject(false);
      setPortalError(createProjectError?.message || "Unable to create project.");
      return;
    }

    const { data: assignedUserId, error: assignError } = await supabase.rpc("assign_client_to_project", {
      project_uuid: projectRow.id,
      client_email: clientEmail,
      client_role: "client"
    });

    setIsCreatingProject(false);

    if (assignError) {
      setPortalError(
        `Project created, but client assignment failed: ${formatAssignmentError(assignError.message)}`
      );
      await loadProjects();
      handleSelectProject(projectRow.id);
      return;
    }

    setNewProjectName("");
    setNewProjectSummary("");
    setNewProjectStatus("planning");
    setNewProjectProgress("0");
    setNewProjectStartDate("");
    setNewProjectDueDate("");
    setNewProjectClientEmail("");
    setNewProjectEmailSuggestions([]);
    const matchedClient = newProjectEmailSuggestions.find(
      (entry) => entry.email.trim().toLowerCase() === clientEmail.toLowerCase()
    );
    const assignedClientLabel =
      matchedClient?.full_name ? `${matchedClient.full_name} (${clientEmail})` : clientEmail;
    setAssignmentMessage(
      assignedUserId
        ? `Project created and assigned to ${assignedClientLabel}.`
        : `Project created. ${assignedClientLabel} will be auto-assigned when they sign in with this email.`
    );
    setIsManagerControlsOpen(false);

    await loadProjects();
    handleSelectProject(projectRow.id);
    await loadProjectData(projectRow.id);
  }

  async function handleSubmitScheduleCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    const fullName = scheduleCallFullName.trim();
    const clientEmail = scheduleCallEmail.trim().toLowerCase();

    if (!fullName || !clientEmail) {
      setScheduleCallError("Name and email are required to schedule a call.");
      return;
    }

    const services = mapScheduleCallServiceSelection(scheduleCallServicesNeeded);

    setIsSubmittingScheduleCall(true);
    setScheduleCallError("");
    setScheduleCallMessage("");

    const { error } = await supabase.from("onboarding_leads").insert({
      full_name: fullName,
      email: clientEmail,
      company_name: scheduleCallCompanyName.trim() || null,
      phone: scheduleCallPhone.trim() || null,
      services_needed: services,
      budget_range: scheduleCallBudgetRange.trim() || null,
      timeline_goal: scheduleCallTimelineGoal.trim() || null,
      preferred_call_at: scheduleCallPreferredAt ? new Date(scheduleCallPreferredAt).toISOString() : null,
      goals: scheduleCallGoals.trim() || null,
      notes: scheduleCallNotes.trim() || null,
      status: "call_scheduled",
      created_by: session?.user.id || null
    });

    setIsSubmittingScheduleCall(false);

    if (error) {
      setScheduleCallError(error.message);
      return;
    }

    setScheduleCallFullName("");
    setScheduleCallEmail("");
    setScheduleCallCompanyName("");
    setScheduleCallPhone("");
    setScheduleCallServicesNeeded("");
    setScheduleCallBudgetRange("");
    setScheduleCallTimelineGoal("");
    setScheduleCallPreferredAt("");
    setScheduleCallGoals("");
    setScheduleCallNotes("");
    setScheduleCallMessage("Call request submitted. We will contact you to confirm the schedule.");
  }

  async function handleSubmitClientProjectRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session) {
      return;
    }

    const projectName = clientProjectRequestName.trim();
    const summaryText = clientProjectRequestSummary.trim();

    if (!projectName) {
      setClientProjectRequestError("Project name is required.");
      return;
    }

    if (
      clientProjectRequestStartDate &&
      clientProjectRequestDueDate &&
      clientProjectRequestDueDate < clientProjectRequestStartDate
    ) {
      setClientProjectRequestError("Due date cannot be earlier than start date.");
      return;
    }

    setIsSubmittingClientProjectRequest(true);
    setClientProjectRequestError("");
    setClientProjectRequestMessage("");

    const { error } = await supabase.rpc("submit_client_project", {
      project_name: projectName,
      summary_text: summaryText || null,
      requested_start_date: clientProjectRequestStartDate || null,
      requested_due_date: clientProjectRequestDueDate || null
    });

    setIsSubmittingClientProjectRequest(false);

    if (error) {
      setClientProjectRequestError(formatClientProjectSubmissionError(error.message));
      return;
    }

    setClientProjectRequestName("");
    setClientProjectRequestSummary("");
    setClientProjectRequestStartDate("");
    setClientProjectRequestDueDate("");
    setIsClientProjectRequestOpen(false);
    setClientProjectRequestMessage(
      "Project request submitted. Your manager has been notified in the onboarding pipeline."
    );

    await loadProjects();
  }

  function handleOnboardingDraftChange(
    leadId: string,
    field: keyof OnboardingLeadDraft,
    value: string | OnboardingStatus
  ) {
    setOnboardingLeadDrafts((current) => {
      const existing = current[leadId];
      if (!existing) {
        return current;
      }

      return {
        ...current,
        [leadId]: {
          ...existing,
          [field]: value
        }
      };
    });
  }

  async function handleSaveOnboardingLead(leadId: string) {
    if (!supabase || !session || !isBootstrapManager) {
      return;
    }

    const draft = onboardingLeadDrafts[leadId];
    if (!draft) {
      return;
    }

    const depositedRequirementError = getDepositedLeadRequirementsError(draft);
    if (depositedRequirementError) {
      setPortalError(depositedRequirementError);
      return;
    }

    const quoted = draft.quoted_amount.trim();
    const deposit = draft.deposit_amount.trim();
    const quotedValue = quoted ? Number.parseFloat(quoted) : null;
    const depositValue = deposit ? Number.parseFloat(deposit) : null;

    if ((quoted && Number.isNaN(quotedValue as number)) || (deposit && Number.isNaN(depositValue as number))) {
      setPortalError("Quoted and deposit amounts must be valid numbers.");
      return;
    }

    setSavingOnboardingLeadById((current) => ({ ...current, [leadId]: true }));
    setPortalError("");

    const { error } = await supabase
      .from("onboarding_leads")
      .update({
        status: draft.status,
        manager_notes: draft.manager_notes.trim() || null,
        proposed_project_name: draft.proposed_project_name.trim() || null,
        quoted_amount: quotedValue,
        deposit_amount: depositValue,
        payment_reference: draft.payment_reference.trim() || null
      })
      .eq("id", leadId);

    setSavingOnboardingLeadById((current) => ({ ...current, [leadId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    await loadOnboardingLeads();
  }

  async function handleConvertOnboardingLeadToProject(leadId: string) {
    if (!supabase || !session || !isBootstrapManager) {
      return;
    }

    const lead = onboardingLeads.find((entry) => entry.id === leadId);
    const draft = onboardingLeadDrafts[leadId];
    if (!lead || !draft) {
      return;
    }

    if (draft.status !== "deposited") {
      setPortalError("Set onboarding status to deposited before converting.");
      return;
    }

    const depositedRequirementError = getDepositedLeadRequirementsError(draft);
    if (depositedRequirementError) {
      setPortalError(depositedRequirementError);
      return;
    }

    const quotedValue = Number.parseFloat(draft.quoted_amount.trim());
    const depositValue = Number.parseFloat(draft.deposit_amount.trim());
    if (Number.isNaN(quotedValue) || Number.isNaN(depositValue)) {
      setPortalError("Quoted and deposit amounts must be valid numbers.");
      return;
    }

    if (lead.converted_project_id) {
      setPortalError("This onboarding lead is already converted to a project.");
      return;
    }

    const projectName = draft.proposed_project_name.trim() || `${lead.company_name || lead.full_name} Project`;

    setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: true }));
    setPortalError("");

    const { data: projectRow, error: createProjectError } = await supabase
      .from("projects")
      .insert({
        name: projectName,
        status: "planning",
        progress: 0,
        quoted_amount: quotedValue,
        amount_paid: depositValue,
        summary: lead.goals || null
      })
      .select("id")
      .single();

    if (createProjectError || !projectRow?.id) {
      setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: false }));
      setPortalError(createProjectError?.message || "Unable to create project from onboarding.");
      return;
    }

    const { error: assignError } = await supabase.rpc("assign_client_to_project", {
      project_uuid: projectRow.id,
      client_email: lead.email,
      client_role: "client"
    });

    if (assignError) {
      setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: false }));
      setPortalError(
        `Project created, but client assignment failed: ${formatAssignmentError(assignError.message)}`
      );
      await loadProjects();
      return;
    }

    const { error: updateLeadError } = await supabase
      .from("onboarding_leads")
      .update({
        status: "project_started",
        manager_notes: draft.manager_notes.trim() || null,
        proposed_project_name: projectName,
        quoted_amount: quotedValue,
        deposit_amount: depositValue,
        payment_reference: draft.payment_reference.trim() || null,
        converted_project_id: projectRow.id,
        converted_at: new Date().toISOString()
      })
      .eq("id", leadId);

    setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: false }));

    if (updateLeadError) {
      setPortalError(updateLeadError.message);
      return;
    }

    await loadOnboardingLeads();
    await loadProjects();
    handleSelectProject(projectRow.id);
    await loadProjectData(projectRow.id);
  }

  async function handleSaveProjectSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const nextSummary = projectSummaryDraft.trim();

    setIsSavingProject(true);
    setPortalError("");

    let error: { message: string } | null = null;

    if (isProjectAdmin) {
      const nextProgress = parseProgress(projectProgressDraft);
      if (nextProgress === null) {
        setIsSavingProject(false);
        setPortalError("Progress must be a number between 0 and 100.");
        return;
      }

      const quotedDraft = projectQuotedAmountDraft.trim();
      const amountPaidDraft = projectAmountPaidDraft.trim();
      const nextQuotedAmount = quotedDraft ? Number.parseFloat(quotedDraft) : null;
      const nextAmountPaid = amountPaidDraft ? Number.parseFloat(amountPaidDraft) : null;

      if (
        (quotedDraft && Number.isNaN(nextQuotedAmount as number)) ||
        (amountPaidDraft && Number.isNaN(nextAmountPaid as number))
      ) {
        setIsSavingProject(false);
        setPortalError("Quoted amount and amount paid must be valid numbers.");
        return;
      }

      if ((nextQuotedAmount !== null && nextQuotedAmount < 0) || (nextAmountPaid !== null && nextAmountPaid < 0)) {
        setIsSavingProject(false);
        setPortalError("Quoted amount and amount paid cannot be negative.");
        return;
      }

      const updateResult = await supabase
        .from("projects")
        .update({
          status: projectStatusDraft,
          progress: nextProgress,
          quoted_amount: nextQuotedAmount,
          amount_paid: nextAmountPaid,
          start_date: projectStartDateDraft || null,
          due_date: projectDueDateDraft || null,
          summary: nextSummary || null
        })
        .eq("id", selectedProjectId);

      error = updateResult.error;
    } else {
      const summaryUpdateResult = await supabase.rpc("update_project_summary", {
        project_uuid: selectedProjectId,
        summary_text: nextSummary
      });

      error = summaryUpdateResult.error;
    }

    setIsSavingProject(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setIsProjectSnapshotModalOpen(false);
    await loadProjects();
    await loadProjectData(selectedProjectId);
  }

  async function handleArchiveProject() {
    if (!supabase || !session || !selectedProjectId || !isProjectAdmin || isArchivingProject) {
      return;
    }

    if (selectedProject?.status === "archived") {
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm("Archive this project? It will be removed from active and completed lists.")
    ) {
      return;
    }

    setIsArchivingProject(true);
    setPortalError("");

    const { error } = await supabase
      .from("projects")
      .update({ status: "archived" })
      .eq("id", selectedProjectId);

    setIsArchivingProject(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setIsProjectSnapshotModalOpen(false);
    setSelectedProjectId(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    await loadProjects();
  }

  async function removeProjectStorageFiles(projectId: string): Promise<string | null> {
    if (!supabase) {
      return "Supabase is not configured.";
    }

    const [projectFilesResult, questionMessageFilesResult] = await Promise.all([
      supabase.from("project_files").select("file_path").eq("project_id", projectId),
      supabase
        .from("project_question_messages")
        .select("attachment_file_path")
        .eq("project_id", projectId)
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
    if (!supabase || !session || !selectedProjectId || !isProjectAdmin || isDeletingProject) {
      return;
    }

    const projectName = selectedProject?.name?.trim() || "this project";
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Permanently delete "${projectName}"? This removes all updates, files, messages, milestones, approvals, and project data. This cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingProject(true);
    setPortalError("");

    const storageError = await removeProjectStorageFiles(selectedProjectId);
    if (storageError) {
      setIsDeletingProject(false);
      setPortalError(storageError);
      return;
    }

    const { error } = await supabase.rpc("delete_project_permanently", {
      project_uuid: selectedProjectId
    });

    setIsDeletingProject(false);

    if (error) {
      setPortalError(formatDeleteProjectError(error.message));
      return;
    }

    setIsProjectSnapshotModalOpen(false);
    setSelectedProjectId(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    await loadProjects();
  }

  async function handlePostProgressUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId || !isProjectAdmin) {
      return;
    }

    const title = updateTitleDraft.trim();
    const body = updateBodyDraft.trim();
    const progressValue = updateProgressDraft.trim();
    const nextProgress = progressValue ? parseProgress(progressValue) : null;

    if (!title || !body) {
      setPortalError("Update title and details are required.");
      return;
    }

    if (progressValue && nextProgress === null) {
      setPortalError("Update progress must be a number between 0 and 100.");
      return;
    }

    setIsPostingUpdate(true);
    setPortalError("");

    const insertResult = await supabase.from("project_updates").insert({
      project_id: selectedProjectId,
      title,
      body,
      progress: nextProgress,
      created_by: session.user.id
    });

    if (insertResult.error) {
      setIsPostingUpdate(false);
      setPortalError(insertResult.error.message);
      return;
    }

    if (nextProgress !== null) {
      const updateProjectResult = await supabase
        .from("projects")
        .update({ progress: nextProgress })
        .eq("id", selectedProjectId);

      if (updateProjectResult.error) {
        setIsPostingUpdate(false);
        setPortalError(updateProjectResult.error.message);
        return;
      }
    }

    setIsPostingUpdate(false);
    setUpdateTitleDraft("");
    setUpdateBodyDraft("");
    setUpdateProgressDraft("");
    await loadProjects();
    await loadProjectData(selectedProjectId);
  }

  function handleToggleServiceNeed(serviceNeed: ClientServiceNeed) {
    setIntakeServiceNeedsDraft((current) =>
      current.includes(serviceNeed)
        ? current.filter((value) => value !== serviceNeed)
        : [...current, serviceNeed]
    );
  }

  async function createMissingAccessItems(projectId: string): Promise<void> {
    if (!supabase || !session) {
      return;
    }

    const templates = buildSuggestedAccessTemplates(intakeServiceNeedsDraft, intakeCmsPlatformDraft);
    if (templates.length === 0) {
      return;
    }

    const payload = templates.map((template) => ({
      project_id: projectId,
      access_key: template.key,
      title: template.title,
      description: template.description,
      service_area: template.serviceArea,
      status: "missing" as AccessItemStatus,
      created_by: session.user.id,
      updated_by: session.user.id
    }));

    const { error } = await supabase
      .from("project_access_items")
      .upsert(payload, { onConflict: "project_id,access_key", ignoreDuplicates: true });

    if (error) {
      setPortalError(error.message);
    }
  }

  async function handleSaveClientIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const websiteValue = intakeWebsiteUrlDraft.trim();
    let normalizedWebsiteValue: string | null = null;
    if (websiteValue) {
      const normalized = normalizeExternalUrl(websiteValue);
      if (!normalized) {
        setPortalError("Please enter a valid website URL.");
        return;
      }
      normalizedWebsiteValue = normalized;
    }

    setIsSavingClientIntake(true);
    setPortalError("");

    const { error } = await supabase.from("project_client_intake").upsert(
      {
        project_id: selectedProjectId,
        company_name: intakeCompanyNameDraft.trim() || null,
        website_url: normalizedWebsiteValue,
        target_audience: intakeTargetAudienceDraft.trim() || null,
        primary_goal: intakePrimaryGoalDraft.trim() || null,
        secondary_goal: intakeSecondaryGoalDraft.trim() || null,
        timeline_goal: intakeTimelineGoalDraft.trim() || null,
        success_metrics: intakeSuccessMetricsDraft.trim() || null,
        service_needs: intakeServiceNeedsDraft,
        cms_platform: intakeCmsPlatformDraft.trim() || null,
        notes: intakeNotesDraft.trim() || null,
        updated_by: session.user.id
      },
      { onConflict: "project_id" }
    );

    if (error) {
      setIsSavingClientIntake(false);
      setPortalError(error.message);
      return;
    }

    await createMissingAccessItems(selectedProjectId);
    setIsSavingClientIntake(false);
    await loadProjectData(selectedProjectId);
  }

  async function handleGenerateAccessChecklist() {
    if (!selectedProjectId) {
      return;
    }

    setIsAccessChecklistOpen(true);
    setIsGeneratingAccessChecklist(true);
    setPortalError("");

    await createMissingAccessItems(selectedProjectId);

    setIsGeneratingAccessChecklist(false);
    await loadProjectData(selectedProjectId);
  }

  function handleToggleAccessItem(itemId: string) {
    setExpandedAccessItemIds((current) => ({
      ...current,
      [itemId]: !current[itemId]
    }));
  }

  function handleToggleAccessFieldVisibility(itemId: string, field: AccessItemVisibilityField) {
    setAccessFieldVisibilityById((current) => {
      const existing = current[itemId] ?? { ...defaultAccessItemVisibility };
      return {
        ...current,
        [itemId]: {
          ...existing,
          [field]: !existing[field]
        }
      };
    });
  }

  function handleAccessDraftChange(
    itemId: string,
    field: keyof AccessItemDraft,
    value: string | AccessItemStatus
  ) {
    setAccessItemDrafts((current) => {
      const existing = current[itemId];
      if (!existing) {
        return current;
      }

      return {
        ...current,
        [itemId]: {
          ...existing,
          [field]: value
        }
      };
    });
  }

  async function handleSaveAccessItem(itemId: string) {
    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const draft = accessItemDrafts[itemId];
    if (!draft) {
      return;
    }

    setSavingAccessItemById((current) => ({ ...current, [itemId]: true }));
    setPortalError("");

    const { error } = await supabase
      .from("project_access_items")
      .update({
        status: draft.status,
        login_url: draft.login_url.trim() || null,
        account_email: draft.account_email.trim() || null,
        username: draft.username.trim() || null,
        secret_value: draft.secret_value.trim() || null,
        secure_link: draft.secure_link.trim() || null,
        notes: draft.notes.trim() || null,
        updated_by: session.user.id
      })
      .eq("id", itemId)
      .eq("project_id", selectedProjectId);

    setSavingAccessItemById((current) => ({ ...current, [itemId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    await loadProjectData(selectedProjectId);
  }

  async function handleCreateMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId || !isProjectAdmin) {
      return;
    }

    const title = milestoneTitleDraft.trim();
    if (!title) {
      setPortalError("Milestone title is required.");
      return;
    }

    setIsCreatingMilestone(true);
    setPortalError("");

    const nextOrder =
      projectMilestones.length > 0
        ? Math.max(...projectMilestones.map((item) => item.sort_order || 0)) + 1
        : 1;

    const { error } = await supabase.from("project_milestones").insert({
      project_id: selectedProjectId,
      title,
      details: milestoneDetailsDraft.trim() || null,
      due_date: milestoneDueDateDraft || null,
      status: "planned",
      sort_order: nextOrder,
      created_by: session.user.id
    });

    setIsCreatingMilestone(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setMilestoneTitleDraft("");
    setMilestoneDetailsDraft("");
    setMilestoneDueDateDraft("");
    await loadProjectData(selectedProjectId);
  }

  async function handleUpdateMilestoneStatus(milestoneId: string, nextStatus: MilestoneStatus) {
    if (!supabase || !selectedProjectId || !isProjectAdmin) {
      return;
    }

    setPortalError("");

    const { error } = await supabase
      .from("project_milestones")
      .update({
        status: nextStatus
      })
      .eq("id", milestoneId)
      .eq("project_id", selectedProjectId);

    if (error) {
      setPortalError(error.message);
      return;
    }

    await loadProjectData(selectedProjectId);
  }

  async function handleCreateApprovalTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session || !selectedProjectId || !isProjectAdmin) {
      return;
    }

    const title = approvalTitleDraft.trim();
    if (!title) {
      setPortalError("Approval task title is required.");
      return;
    }

    setIsCreatingApprovalTask(true);
    setPortalError("");

    const { error } = await supabase.from("project_approval_tasks").insert({
      project_id: selectedProjectId,
      title,
      details: approvalDetailsDraft.trim() || null,
      status: "pending",
      requested_by: session.user.id
    });

    setIsCreatingApprovalTask(false);

    if (error) {
      setPortalError(error.message);
      return;
    }

    setApprovalTitleDraft("");
    setApprovalDetailsDraft("");
    await loadProjectData(selectedProjectId);
  }

  async function handleRespondApprovalTask(taskId: string, nextStatus: "approved" | "changes_requested") {
    if (!supabase || !session || !selectedProjectId) {
      return;
    }

    const note = (approvalResponseDrafts[taskId] || "").trim();

    setApprovalSubmittingById((current) => ({ ...current, [taskId]: true }));
    setPortalError("");

    const { error } = await supabase
      .from("project_approval_tasks")
      .update({
        status: nextStatus,
        client_note: note || null,
        decided_by: session.user.id,
        decided_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .eq("project_id", selectedProjectId);

    setApprovalSubmittingById((current) => ({ ...current, [taskId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    setApprovalResponseDrafts((current) => ({ ...current, [taskId]: "" }));
    await loadProjectData(selectedProjectId);
  }

  async function handleReopenApprovalTask(taskId: string) {
    if (!supabase || !selectedProjectId || !isProjectAdmin) {
      return;
    }

    setApprovalSubmittingById((current) => ({ ...current, [taskId]: true }));
    setPortalError("");

    const { error } = await supabase
      .from("project_approval_tasks")
      .update({
        status: "pending",
        client_note: null,
        decided_by: null,
        decided_at: null
      })
      .eq("id", taskId)
      .eq("project_id", selectedProjectId);

    setApprovalSubmittingById((current) => ({ ...current, [taskId]: false }));

    if (error) {
      setPortalError(error.message);
      return;
    }

    await loadProjectData(selectedProjectId);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="portal-workspace mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Client Portal</h1>
          <p className="mt-4 text-sm text-ink/85">
            Add your Supabase public keys to enable the portal.
          </p>
          <div className="mt-5 rounded-lg border border-ink/20 bg-white p-4 text-sm text-ink/80">
            <p>
              Required env vars: <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (isLoadingSession) {
    return (
      <main className="portal-workspace mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Loading portal session...</p>
        </section>
      </main>
    );
  }

  if (session && isRecoveryMode) {
    return (
      <main className="portal-workspace mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Reset Password</h1>
          <p className="mt-3 text-sm text-ink/85">
            Set a new password for <span className="font-semibold">{session.user.email}</span>.
          </p>

          <form onSubmit={handleCompletePasswordReset} className="mt-5 space-y-3">
            <label
              htmlFor="portal-recovery-password"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
            >
              New Password
            </label>
            <input
              id="portal-recovery-password"
              type="password"
              value={recoveryPassword}
              onChange={(event) => setRecoveryPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
              minLength={8}
              required
            />
            <label
              htmlFor="portal-recovery-confirm-password"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
            >
              Confirm New Password
            </label>
            <input
              id="portal-recovery-confirm-password"
              type="password"
              value={recoveryConfirmPassword}
              onChange={(event) => setRecoveryConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
              minLength={8}
              required
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isUpdatingRecoveryPassword}
                className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdatingRecoveryPassword ? "Saving..." : "Save New Password"}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </form>

          {authMessage ? (
            <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/80">
              {authMessage}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard sm:p-8">
            <h1 className="font-display text-3xl uppercase leading-none text-ink">Client Portal</h1>
            <p className="mt-3 text-sm text-ink/85">
              Clients can register and log in to track project progress, ask questions, and upload
              files.
            </p>

            <div className="mt-6 inline-flex rounded-full border border-ink/25 bg-white p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                  authMode === "login" ? "bg-ink text-mist" : "text-ink/75"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                  authMode === "register" ? "bg-ink text-mist" : "text-ink/75"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
              {authMode === "register" ? (
                <>
                  <label
                    htmlFor="portal-full-name"
                    className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
                  >
                    Full Name
                  </label>
                  <input
                    id="portal-full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                    required
                  />
                </>
              ) : null}
              <label
                htmlFor="portal-email"
                className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
              >
                Work Email
              </label>
              <input
                id="portal-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                required
              />
              <label
                htmlFor="portal-password"
                className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
              >
                Password
              </label>
              <input
                id="portal-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                minLength={8}
                required
              />
              {authMode === "login" ? (
                <button
                  type="button"
                  onClick={() => void handleForgotPassword()}
                  disabled={isSendingResetEmail}
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/70 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingResetEmail ? "Sending reset..." : "Forgot Password?"}
                </button>
              ) : null}
              {authMode === "register" ? (
                <>
                  <label
                    htmlFor="portal-confirm-password"
                    className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="portal-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                    minLength={8}
                    required
                  />
                </>
              ) : null}
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingAuth
                  ? "Processing..."
                  : authMode === "register"
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

            {authMessage ? (
              <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/80">
                {authMessage}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard sm:p-8">
            <h2 className="font-display text-2xl uppercase leading-none text-ink">Schedule a Call</h2>
            <p className="mt-3 text-sm text-ink/80">
              Start onboarding now. Your request goes to the manager pipeline until proposal, contract,
              invoice, and deposit are complete.
            </p>

            <form onSubmit={handleSubmitScheduleCall} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Full Name
                </label>
                <input
                  type="text"
                  value={scheduleCallFullName}
                  onChange={(event) => setScheduleCallFullName(event.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Email
                </label>
                <input
                  type="email"
                  value={scheduleCallEmail}
                  onChange={(event) => setScheduleCallEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Company
                </label>
                <input
                  type="text"
                  value={scheduleCallCompanyName}
                  onChange={(event) => setScheduleCallCompanyName(event.target.value)}
                  placeholder="Company name"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Phone
                </label>
                <input
                  type="text"
                  value={scheduleCallPhone}
                  onChange={(event) => setScheduleCallPhone(event.target.value)}
                  placeholder="+1 555 000 0000"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Service Needed (Web Design / Web Development / SEO / Combination)
                </label>
                <select
                  value={scheduleCallServicesNeeded}
                  onChange={(event) => setScheduleCallServicesNeeded(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                  required
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  <option value="Web Design">Web Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="SEO">SEO</option>
                  <option value="Web Design + SEO">Web Design + SEO</option>
                  <option value="Web Design + Web Development">Web Design + Web Development</option>
                  <option value="SEO + Web Development">SEO + Web Development</option>
                  <option value="All Three">All Three</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Budget
                </label>
                <input
                  type="text"
                  value={scheduleCallBudgetRange}
                  onChange={(event) => setScheduleCallBudgetRange(event.target.value)}
                  placeholder="$2,000 - $5,000"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Timeline Goal
                </label>
                <input
                  type="text"
                  value={scheduleCallTimelineGoal}
                  onChange={(event) => setScheduleCallTimelineGoal(event.target.value)}
                  placeholder="Launch in 6 weeks"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Preferred Call Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleCallPreferredAt}
                  onChange={(event) => setScheduleCallPreferredAt(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Project Goals
                </label>
                <textarea
                  rows={3}
                  value={scheduleCallGoals}
                  onChange={(event) => setScheduleCallGoals(event.target.value)}
                  placeholder="What do you want this project to achieve?"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={scheduleCallNotes}
                  onChange={(event) => setScheduleCallNotes(event.target.value)}
                  placeholder="Anything else the manager should know before the call?"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmittingScheduleCall}
                  className="inline-flex items-center rounded-full border-2 border-[#9a5300] bg-[#cc6d00] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#b85f00] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingScheduleCall ? "Submitting..." : "Submit Call Request"}
                </button>
              </div>
            </form>

            {scheduleCallError ? (
              <p className="mt-4 rounded-lg border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
                {scheduleCallError}
              </p>
            ) : null}
            {scheduleCallMessage ? (
              <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
                {scheduleCallMessage}
              </p>
            ) : null}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="portal-workspace mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">Client Portal</h1>
            <p className="mt-2 text-sm text-ink/80">
              Signed in as <span className="font-semibold">{session.user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isBootstrapManager ? (
              <>
                <Link
                  href="/portal/blog"
                  className="inline-flex items-center rounded-full border-2 border-[#5b3db8] bg-[#6f4dd9] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#5f3ec8]"
                >
                  Blog Manager
                </Link>
                <Link
                  href="/portal/onboarding"
                  className="inline-flex items-center rounded-full border-2 border-[#0f7663] bg-[#16a085] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#0f8d74]"
                >
                  Onboarding Pipeline
                </Link>
                <Link
                  href="/portal/leads"
                  className="inline-flex items-center rounded-full border-2 border-[#1d4ea5] bg-[#2967d8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#2059bf]"
                >
                  Lead Magnets
                </Link>
              </>
            ) : null}
            <PortalNotificationCenter session={session} onProjectSelect={handleSelectProject} />
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl uppercase text-ink">
              {isProjectAdmin ? "Manager Projects" : "Your Projects"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void loadProjects();
                  if (isBootstrapManager) {
                    void loadManagerBillingData();
                  }
                  void loadPaymentFeatureFlags();
                }}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 hover:underline"
              >
                Refresh
              </button>
              {isProjectAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsManagerProjectsDrawerOpen((current) => !current)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white text-lg font-semibold leading-none text-ink transition hover:-translate-y-0.5"
                  aria-label={isManagerProjectsDrawerOpen ? "Hide manager projects" : "Show manager projects"}
                >
                  {isManagerProjectsDrawerOpen ? "−" : "+"}
                </button>
              ) : null}
            </div>
          </div>

          {!isProjectAdmin || isManagerProjectsDrawerOpen ? (
            <>
              {isLoadingProjects ? <p className="text-sm text-ink/75">Loading projects...</p> : null}

              <div className="mt-3 grid gap-2">
                <input
                  type="text"
                  value={projectSearchDraft}
                  onChange={(event) => setProjectSearchDraft(event.target.value)}
                  placeholder="Search projects..."
                  className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                />
                <select
                  value={projectStatusFilter}
                  onChange={(event) => setProjectStatusFilter(event.target.value as "all" | ProjectStatus)}
                  className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                >
                  <option value="all">All statuses</option>
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {!isLoadingProjects && filteredSidebarProjects.length === 0 ? (
                <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                  {sidebarProjects.length === 0
                    ? isProjectAdmin
                      ? "No active projects right now."
                      : "No projects are assigned to this account yet."
                    : "No projects match your current search/filter."}
                </p>
              ) : null}

              <div className="mt-3 space-y-3">
                {filteredSidebarProjects.map((project) => {
                  const isSelected = project.id === selectedProjectId;
                  const paymentBadge = getProjectPaymentBadge(project.quoted_amount, project.amount_paid);

                  return (
                    <button
                      type="button"
                      key={project.id}
                      onClick={() => handleSelectProject(project.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-[#a87700] bg-[#ffe8a3] shadow-[4px_4px_0_#a87700]"
                          : "border-ink/20 bg-white/75 hover:border-ink/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-ink">{project.name}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
                              statusStyles[project.status] || "bg-fog text-ink/70"
                            }`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${paymentBadge.className}`}
                          >
                            {paymentBadge.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-ink/70">{project.progress}%</span>
                      </div>
                      {paymentBadge.balance !== null && paymentBadge.balance > 0 ? (
                        <p className="mt-1 text-[0.68rem] font-medium text-[#8a5a00]">
                          Due {formatUsd(paymentBadge.balance)}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {isProjectAdmin ? (
                <div className="mt-5 border-t border-ink/20 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Completed Projects
                    </h3>
                    <span className="text-xs font-semibold text-ink/65">{completedProjects.length}</span>
                  </div>

                  {completedProjects.length === 0 ? (
                    <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-xs text-ink/70">
                      No completed projects yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedProjects.map((project) => {
                        const paymentBadge = getProjectPaymentBadge(project.quoted_amount, project.amount_paid);

                        return (
                          <Link
                            key={project.id}
                            href={`/portal/completed/${project.id}`}
                            className="block rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm transition hover:border-ink/45"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-ink">{project.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`rounded-full border px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${paymentBadge.className}`}
                                >
                                  {paymentBadge.label}
                                </span>
                                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#0b6a40]">
                                  Open
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-ink/65">View completed project details</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/70">
              Manager projects drawer is collapsed.
            </p>
          )}
        </aside>

        <div className="space-y-6">
          {canSubmitClientProjectRequest ? (
            <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl uppercase text-ink">Need A New Project?</h2>
                  <p className="mt-2 text-sm text-ink/75">
                    Submit a request and your manager will receive it in the onboarding pipeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClientProjectRequestOpen((current) => !current)}
                  className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3]"
                >
                  {isClientProjectRequestOpen ? "Close" : "Add Project"}
                </button>
              </div>

              {clientProjectRequestMessage ? (
                <p className="mt-4 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
                  {clientProjectRequestMessage}
                </p>
              ) : null}

              {clientProjectRequestError ? (
                <p className="mt-4 rounded-lg border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
                  {clientProjectRequestError}
                </p>
              ) : null}

              {isClientProjectRequestOpen ? (
                <form onSubmit={handleSubmitClientProjectRequest} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={clientProjectRequestName}
                      onChange={(event) => setClientProjectRequestName(event.target.value)}
                      placeholder="Website redesign, SEO growth, landing page build..."
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Project Goals / Summary
                    </label>
                    <textarea
                      rows={4}
                      value={clientProjectRequestSummary}
                      onChange={(event) => setClientProjectRequestSummary(event.target.value)}
                      placeholder="Describe what you want to build and your business goals."
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Requested Start Date
                    </label>
                    <input
                      type="date"
                      value={clientProjectRequestStartDate}
                      onChange={(event) => setClientProjectRequestStartDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Requested Due Date
                    </label>
                    <input
                      type="date"
                      value={clientProjectRequestDueDate}
                      onChange={(event) => setClientProjectRequestDueDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmittingClientProjectRequest}
                      className="inline-flex items-center rounded-full border-2 border-[#9a5300] bg-[#cc6d00] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#b85f00] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmittingClientProjectRequest ? "Submitting..." : "Submit Project Request"}
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          ) : null}

          {availableWorkspaceTabs.length > 0 ? (
            <section className="rounded-2xl border border-ink/60 bg-mist p-3 shadow-hard sm:p-4">
              <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/70">
                Dashboard Tabs
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableWorkspaceTabs.map((tab) => {
                  const isActive = tab.id === activeWorkspaceTab;
                  const tabNewCount = tabNewCountById[tab.id] || 0;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveWorkspaceTab(tab.id)}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] transition-all duration-150 ${
                        isActive
                          ? "border-[#a87700] bg-[#ffe8a3] text-[#5b3a00] shadow-[2px_2px_0_#a87700]"
                          : "border-ink/25 bg-white text-ink hover:border-ink/50 hover:-translate-y-0.5"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {tabNewCount > 0 ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-[#d92d20]" />
                        ) : null}
                        {tab.label}
                      </span>
                      {tabNewCount > 0 ? (
                        <span
                          className={`inline-flex min-w-5 items-center justify-center rounded-full border px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none ${
                            isActive
                              ? "border-[#8a6200] bg-[#fff3cc] text-[#5b3a00]"
                              : "border-[#8a1f1f] bg-[#ffdede] text-[#8a1f1f]"
                          }`}
                        >
                          {tabNewCount > 99 ? "99+" : tabNewCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {isBootstrapManager && activeWorkspaceTab === "manager_controls" ? (
            <ManagerControls
              isManagerControlsOpen={isManagerControlsOpen}
              newProjectName={newProjectName}
              newProjectClientEmail={newProjectClientEmail}
              newProjectStatus={newProjectStatus}
              newProjectProgress={newProjectProgress}
              newProjectStartDate={newProjectStartDate}
              newProjectDueDate={newProjectDueDate}
              newProjectSummary={newProjectSummary}
              isCreatingProject={isCreatingProject}
              assignmentMessage={assignmentMessage}
              selectedCreateClientSuggestion={selectedCreateClientSuggestion}
              isLoadingNewProjectEmailSuggestions={isLoadingNewProjectEmailSuggestions}
              newProjectEmailSuggestions={newProjectEmailSuggestions}
              onSetNewProjectName={setNewProjectName}
              onSetNewProjectClientEmail={setNewProjectClientEmail}
              onSetNewProjectStatus={setNewProjectStatus}
              onSetNewProjectProgress={setNewProjectProgress}
              onSetNewProjectStartDate={setNewProjectStartDate}
              onSetNewProjectDueDate={setNewProjectDueDate}
              onSetNewProjectSummary={setNewProjectSummary}
              onSubmitCreateProject={handleCreateProjectAndAssign}
              onToggleOpen={() => setIsManagerControlsOpen((current) => !current)}
              onSwitchTab={setActiveWorkspaceTab}
            />
          ) : null}

          {isBootstrapManager && activeWorkspaceTab === "client_billing" ? (
            <ClientBilling
              managerBillingMessage={managerBillingMessage}
              isLoadingManagerBilling={isLoadingManagerBilling}
              recurringPaymentsEnabled={recurringPaymentsEnabled}
              totalOutstandingBalance={totalOutstandingBalance}
              totalCapturedPayments={totalCapturedPayments}
              paidInFullProjectsCount={paidInFullProjectsCount}
              nextRecurringPayments={nextRecurringPayments}
              managerBillingRows={managerBillingRows}
              billingProfileDrafts={billingProfileDrafts}
              isSavingBillingProfileByProjectId={isSavingBillingProfileByProjectId}
              recentProjectPayments={recentProjectPayments}
              projectNameById={projectNameById}
              onRefreshBilling={loadManagerBillingData}
              onBillingDraftChange={handleBillingDraftChange}
              onSaveBillingProfile={handleSaveBillingProfile}
            />
          ) : null}

          {canManagePaymentModeControls && activeWorkspaceTab === "payment_mode_controls" ? (
            <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl uppercase text-ink">Payment Mode Controls</h2>
                  <p className="mt-1 text-sm text-ink/75">
                    Toggle manual checkout and recurring billing setup globally for the client portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSavePaymentFeatureSettings()}
                  disabled={isSavingPaymentFeatureSettings}
                  className="inline-flex items-center rounded-full border border-[#1f56c2] bg-[#2d6cdf] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingPaymentFeatureSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded border border-ink/20 bg-white px-3 py-2 text-xs text-ink/80">
                  <input
                    type="checkbox"
                    checked={paymentFeatureSettingsDraft.manual_payments_enabled}
                    onChange={(event) =>
                      handlePaymentFeatureDraftChange("manual_payments_enabled", event.target.checked)
                    }
                    disabled={isLoadingPaymentFeatureSettings || isSavingPaymentFeatureSettings}
                  />
                  Manual Payments (PayPal checkout)
                </label>
                <label className="flex items-center gap-2 rounded border border-ink/20 bg-white px-3 py-2 text-xs text-ink/80">
                  <input
                    type="checkbox"
                    checked={paymentFeatureSettingsDraft.recurring_payments_enabled}
                    onChange={(event) =>
                      handlePaymentFeatureDraftChange("recurring_payments_enabled", event.target.checked)
                    }
                    disabled={isLoadingPaymentFeatureSettings || isSavingPaymentFeatureSettings}
                  />
                  Automatic Payments (recurring setup)
                </label>
              </div>
              {paymentFeatureSettingsMessage ? (
                <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-xs text-[#1f5c28]">
                  {paymentFeatureSettingsMessage}
                </p>
              ) : null}
              <div className="mt-2 text-[0.7rem] text-ink/65">
                <p>
                  Live status: Manual{" "}
                  <span className="font-semibold">{manualPaymentsEnabled ? "enabled" : "disabled"}</span> ·
                  Automatic{" "}
                  <span className="font-semibold">{recurringPaymentsEnabled ? "enabled" : "disabled"}</span>
                </p>
              </div>
            </section>
          ) : null}

          {!selectedProject ? (
            activeWorkspaceTab === "manager_controls" ||
            activeWorkspaceTab === "client_billing" ||
            activeWorkspaceTab === "payment_mode_controls" ? null : (
              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard">
                <p className="text-sm text-ink/80">Select a project to view details.</p>
                {isProjectAdmin ? (
                  <p className="mt-2 text-xs text-ink/65">
                    Archive and permanent delete actions appear in Project Snapshot after selecting a project.
                  </p>
                ) : null}
              </section>
            )
          ) : (
            <>
              {activeWorkspaceTab === "active_project" ? (
                <ActiveProject
                  selectedProject={selectedProject}
                  effectiveRole={effectiveRole}
                  isProjectAdmin={isProjectAdmin}
                  projectContacts={projectContacts}
                  selectedProjectBalance={selectedProjectBalance}
                  paypalStatusMessage={paypalStatusMessage}
                  isCapturingPaypalCheckout={isCapturingPaypalCheckout}
                  manualPaymentsEnabled={manualPaymentsEnabled}
                  paypalAmountDraft={paypalAmountDraft}
                  isStartingPaypalCheckout={isStartingPaypalCheckout}
                  selectedProjectPayments={selectedProjectPayments}
                  isArchivingProject={isArchivingProject}
                  isDeletingProject={isDeletingProject}
                  onOpenSnapshotModal={() => setIsProjectSnapshotModalOpen(true)}
                  onArchiveProject={handleArchiveProject}
                  onDeleteProjectPermanently={handleDeleteProjectPermanently}
                  onSetPaypalAmountDraft={setPaypalAmountDraft}
                  onStartPayPalCheckout={handleStartPayPalCheckout}
                />
              ) : null}

              {isProjectSnapshotModalOpen ? (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-snapshot-modal-title"
                >
                  <div className="w-full max-w-2xl rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 id="project-snapshot-modal-title" className="font-display text-xl uppercase text-ink">
                        {isProjectAdmin ? "Edit Project Snapshot" : "Edit Project Summary"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsProjectSnapshotModalOpen(false)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/35 bg-white text-lg font-semibold text-ink"
                        aria-label="Close snapshot editor"
                      >
                        x
                      </button>
                    </div>

                    <form onSubmit={handleSaveProjectSnapshot} className="mt-4 space-y-3">
                      {isProjectAdmin ? (
                        <>
                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Status
                          </label>
                          <select
                            value={projectStatusDraft}
                            onChange={(event) => setProjectStatusDraft(event.target.value as ProjectStatus)}
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          >
                            {projectStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>

                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Progress (0-100)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={projectProgressDraft}
                            onChange={(event) => setProjectProgressDraft(event.target.value)}
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                            required
                          />

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                              Start Date
                              <input
                                type="date"
                                value={projectStartDateDraft}
                                onChange={(event) => setProjectStartDateDraft(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                              />
                            </label>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                              Due Date
                              <input
                                type="date"
                                value={projectDueDateDraft}
                                onChange={(event) => setProjectDueDateDraft(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                              />
                            </label>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                              Quoted Amount
                              <input
                                type="text"
                                value={projectQuotedAmountDraft}
                                onChange={(event) => setProjectQuotedAmountDraft(event.target.value)}
                                placeholder="5000"
                                className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                              />
                            </label>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                              Amount Paid
                              <input
                                type="text"
                                value={projectAmountPaidDraft}
                                onChange={(event) => setProjectAmountPaidDraft(event.target.value)}
                                placeholder="2500"
                                className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                              />
                            </label>
                          </div>
                        </>
                      ) : null}

                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                        Summary (HTML / Markdown)
                      </label>
                      <textarea
                        rows={5}
                        value={projectSummaryDraft}
                        onChange={(event) => setProjectSummaryDraft(event.target.value)}
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        placeholder="Use HTML or Markdown, e.g. ## What changed"
                      />

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsProjectSnapshotModalOpen(false)}
                          className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProject}
                          className="inline-flex items-center rounded-full border-2 border-[#475569] bg-[#64748b] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#55657c] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSavingProject ? "Saving..." : isProjectAdmin ? "Save Snapshot" : "Save Summary"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : null}

              {activeWorkspaceTab === "search_filters" ? (
                <SearchFilters
                  contentSearchDraft={contentSearchDraft}
                  milestoneFilterStatus={milestoneFilterStatus}
                  approvalFilterStatus={approvalFilterStatus}
                  accessStatusFilter={accessStatusFilter}
                  onSetContentSearchDraft={setContentSearchDraft}
                  onSetMilestoneFilterStatus={setMilestoneFilterStatus}
                  onSetApprovalFilterStatus={setApprovalFilterStatus}
                  onSetAccessStatusFilter={setAccessStatusFilter}
                />
              ) : null}

              {activeWorkspaceTab === "access_credentials" ? (
                <AccessCredentials
                  isProjectAdmin={isProjectAdmin}
                  projectClientIntake={projectClientIntake}
                  isClientIntakeOpen={isClientIntakeOpen}
                  intakeCompanyNameDraft={intakeCompanyNameDraft}
                  intakeWebsiteUrlDraft={intakeWebsiteUrlDraft}
                  intakeTargetAudienceDraft={intakeTargetAudienceDraft}
                  intakePrimaryGoalDraft={intakePrimaryGoalDraft}
                  intakeSecondaryGoalDraft={intakeSecondaryGoalDraft}
                  intakeTimelineGoalDraft={intakeTimelineGoalDraft}
                  intakeSuccessMetricsDraft={intakeSuccessMetricsDraft}
                  intakeCmsPlatformDraft={intakeCmsPlatformDraft}
                  intakeNotesDraft={intakeNotesDraft}
                  intakeServiceNeedsDraft={intakeServiceNeedsDraft}
                  isSavingClientIntake={isSavingClientIntake}
                  isGeneratingAccessChecklist={isGeneratingAccessChecklist}
                  isAccessChecklistOpen={isAccessChecklistOpen}
                  accessStatusCounts={accessStatusCounts}
                  filteredProjectAccessItems={filteredProjectAccessItems}
                  projectAccessItems={projectAccessItems}
                  accessItemDrafts={accessItemDrafts}
                  expandedAccessItemIds={expandedAccessItemIds}
                  accessFieldVisibilityById={accessFieldVisibilityById}
                  savingAccessItemById={savingAccessItemById}
                  onSetIsClientIntakeOpen={setIsClientIntakeOpen}
                  onSetIntakeCompanyNameDraft={setIntakeCompanyNameDraft}
                  onSetIntakeWebsiteUrlDraft={setIntakeWebsiteUrlDraft}
                  onSetIntakeTargetAudienceDraft={setIntakeTargetAudienceDraft}
                  onSetIntakePrimaryGoalDraft={setIntakePrimaryGoalDraft}
                  onSetIntakeSecondaryGoalDraft={setIntakeSecondaryGoalDraft}
                  onSetIntakeTimelineGoalDraft={setIntakeTimelineGoalDraft}
                  onSetIntakeSuccessMetricsDraft={setIntakeSuccessMetricsDraft}
                  onSetIntakeCmsPlatformDraft={setIntakeCmsPlatformDraft}
                  onSetIntakeNotesDraft={setIntakeNotesDraft}
                  onHandleToggleServiceNeed={handleToggleServiceNeed}
                  onSaveClientIntake={handleSaveClientIntake}
                  onGenerateAccessChecklist={handleGenerateAccessChecklist}
                  onSetIsAccessChecklistOpen={setIsAccessChecklistOpen}
                  onToggleAccessItem={handleToggleAccessItem}
                  onAccessDraftChange={handleAccessDraftChange}
                  onToggleAccessFieldVisibility={handleToggleAccessFieldVisibility}
                  onSaveAccessItem={handleSaveAccessItem}
                />
              ) : null}

              {isProjectAdmin && activeWorkspaceTab === "admin_workspace" ? (
                <AdminWorkspace
                  updateTitleDraft={updateTitleDraft}
                  updateBodyDraft={updateBodyDraft}
                  updateProgressDraft={updateProgressDraft}
                  isPostingUpdate={isPostingUpdate}
                  onSetUpdateTitleDraft={setUpdateTitleDraft}
                  onSetUpdateBodyDraft={setUpdateBodyDraft}
                  onSetUpdateProgressDraft={setUpdateProgressDraft}
                  onPostProgressUpdate={handlePostProgressUpdate}
                />
              ) : null}

              {activeWorkspaceTab === "timeline_milestones" ? (
                <TimelineMilestones
                  projectMilestones={projectMilestones}
                  filteredProjectMilestones={filteredProjectMilestones}
                  isProjectAdmin={isProjectAdmin}
                  milestoneTitleDraft={milestoneTitleDraft}
                  milestoneDetailsDraft={milestoneDetailsDraft}
                  milestoneDueDateDraft={milestoneDueDateDraft}
                  isCreatingMilestone={isCreatingMilestone}
                  onSetMilestoneTitleDraft={setMilestoneTitleDraft}
                  onSetMilestoneDetailsDraft={setMilestoneDetailsDraft}
                  onSetMilestoneDueDateDraft={setMilestoneDueDateDraft}
                  onCreateMilestone={handleCreateMilestone}
                  onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
                />
              ) : null}

              {activeWorkspaceTab === "task_approvals" ? (
                <TaskApprovals
                  projectApprovalTasks={projectApprovalTasks}
                  filteredProjectApprovalTasks={filteredProjectApprovalTasks}
                  isProjectAdmin={isProjectAdmin}
                  approvalTitleDraft={approvalTitleDraft}
                  approvalDetailsDraft={approvalDetailsDraft}
                  isCreatingApprovalTask={isCreatingApprovalTask}
                  approvalResponseDrafts={approvalResponseDrafts}
                  approvalSubmittingById={approvalSubmittingById}
                  onSetApprovalTitleDraft={setApprovalTitleDraft}
                  onSetApprovalDetailsDraft={setApprovalDetailsDraft}
                  onCreateApprovalTask={handleCreateApprovalTask}
                  onSetApprovalResponseDrafts={setApprovalResponseDrafts}
                  onRespondApprovalTask={handleRespondApprovalTask}
                  onReopenApprovalTask={handleReopenApprovalTask}
                />
              ) : null}

              {activeWorkspaceTab === "progress_updates" ? (
                <ProgressUpdates
                  isLoadingProjectData={isLoadingProjectData}
                  filteredProjectUpdates={filteredProjectUpdates}
                  projectUpdates={projectUpdates}
                />
              ) : null}

              {activeWorkspaceTab === "questions_threads" ? (
                <QuestionsThreads
                  questionDraft={questionDraft}
                  questionUrlDraft={questionUrlDraft}
                  questionFileDraft={questionFileDraft}
                  questionFilePreviewUrl={questionFilePreviewUrl}
                  isSubmittingQuestion={isSubmittingQuestion}
                  filteredProjectQuestions={filteredProjectQuestions}
                  projectQuestions={projectQuestions}
                  messagesByQuestionId={messagesByQuestionId}
                  replyDrafts={replyDrafts}
                  replyUrlDrafts={replyUrlDrafts}
                  replyFileDrafts={replyFileDrafts}
                  replyFilePreviewUrls={replyFilePreviewUrls}
                  replySubmittingByQuestionId={replySubmittingByQuestionId}
                  questionMessageAttachmentUrls={questionMessageAttachmentUrls}
                  currentUserId={session.user.id}
                  isBootstrapManager={isBootstrapManager}
                  memberRolesByUserId={memberRolesByUserId}
                  onSubmitQuestion={handleSubmitQuestion}
                  onSetQuestionDraft={setQuestionDraft}
                  onSetQuestionUrlDraft={setQuestionUrlDraft}
                  onQuestionFileChange={handleQuestionFileChange}
                  onSubmitThreadReply={handleSubmitThreadReply}
                  onSetReplyDrafts={setReplyDrafts}
                  onSetReplyUrlDrafts={setReplyUrlDrafts}
                  onThreadReplyFileChange={handleThreadReplyFileChange}
                />
              ) : null}

              {activeWorkspaceTab === "files_documents" ? (
                <FilesDocuments
                  filteredProjectFiles={filteredProjectFiles}
                  projectFiles={projectFiles}
                  isUploadingFile={isUploadingFile}
                  onUploadFile={handleUploadFile}
                  onDownloadFile={handleDownloadFile}
                />
              ) : null}
            </>
          )}
        </div>
      </section>
      <PortalAlertModal
        open={Boolean(alertModal)}
        tone={alertModal?.tone ?? "info"}
        title={alertModal?.title ?? "Portal Alert"}
        message={alertModal?.message ?? ""}
        onClose={handleAlertModalClose}
      />
    </main>
  );
}
