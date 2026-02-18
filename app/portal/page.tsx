"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";
import { PortalNotificationCenter } from "@/components/portal-notification-center";

type PortalProject = {
  id: string;
  name: string;
  status: string;
  progress: number;
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

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [projectApprovalTasks, setProjectApprovalTasks] = useState<ProjectApprovalTask[]>([]);
  const [projectClientIntake, setProjectClientIntake] = useState<ClientIntakeProfile | null>(null);
  const [projectAccessItems, setProjectAccessItems] = useState<ProjectAccessItem[]>([]);
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
  const [isManagerControlsOpen, setIsManagerControlsOpen] = useState(false);
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

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const effectiveRole: MemberRole | null = isBootstrapManager ? "manager" : currentRole;
  const isProjectAdmin = isBootstrapManager || currentRole === "manager" || currentRole === "owner";
  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "completed" && project.status !== "archived"),
    [projects]
  );
  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "completed"),
    [projects]
  );
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

  const loadProjects = useCallback(async () => {
    if (!supabase || !session) {
      return;
    }

    setIsLoadingProjects(true);
    setPortalError("");

    const { data, error } = await supabase
      .from("projects")
      .select("id,name,status,progress,start_date,due_date,summary,updated_at")
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

      const [
        updatesResult,
        questionsResult,
        questionMessagesResult,
        filesResult,
        milestonesResult,
        approvalsResult,
        intakeResult,
        accessItemsResult,
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
      const memberRoleMap: Record<string, MemberRole> = {};
      for (const row of memberRolesResult.data ?? []) {
        memberRoleMap[row.user_id] = row.role as MemberRole;
      }
      setMemberRolesByUserId(memberRoleMap);
      setCurrentRole((membershipResult.data?.role as MemberRole | undefined) ?? null);
    },
    [session, supabase]
  );

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
    if (!session || !selectedProjectId) {
      setProjectUpdates([]);
      setProjectQuestions([]);
      setQuestionMessages([]);
      setProjectFiles([]);
      setProjectMilestones([]);
      setProjectApprovalTasks([]);
      setProjectClientIntake(null);
      setProjectAccessItems([]);
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
      setIsProjectSnapshotModalOpen(false);
      return;
    }

    setProjectStatusDraft((selectedProject.status as ProjectStatus) || "planning");
    setProjectProgressDraft(String(selectedProject.progress));
    setProjectStartDateDraft(selectedProject.start_date || "");
    setProjectDueDateDraft(selectedProject.due_date || "");
    setProjectSummaryDraft(selectedProject.summary || "");
  }, [selectedProject]);

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

    const services = scheduleCallServicesNeeded
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

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

      const updateResult = await supabase
        .from("projects")
        .update({
          status: projectStatusDraft,
          progress: nextProgress,
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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Loading portal session...</p>
        </section>
      </main>
    );
  }

  if (session && isRecoveryMode) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
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
                  Services Needed
                </label>
                <input
                  type="text"
                  value={scheduleCallServicesNeeded}
                  onChange={(event) => setScheduleCallServicesNeeded(event.target.value)}
                  placeholder="seo, web_design, web_development"
                  className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/60"
                />
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
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
        {portalError ? (
          <p className="mt-4 rounded-lg border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
            {portalError}
          </p>
        ) : null}
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
                onClick={() => void loadProjects()}
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
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
                            statusStyles[project.status] || "bg-fog text-ink/70"
                          }`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                        <span className="text-xs font-semibold text-ink/70">{project.progress}%</span>
                      </div>
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
                      {completedProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/portal/completed/${project.id}`}
                          className="block rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm transition hover:border-ink/45"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-ink">{project.name}</span>
                            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#0b6a40]">
                              Open
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-ink/65">View completed project details</p>
                        </Link>
                      ))}
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
          {isBootstrapManager ? (
            <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl uppercase text-ink">Manager Controls</h2>
                <button
                  type="button"
                  onClick={() => setIsManagerControlsOpen((current) => !current)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-xl font-semibold leading-none text-ink transition hover:-translate-y-0.5"
                  aria-label={isManagerControlsOpen ? "Hide manager controls" : "Show manager controls"}
                >
                  {isManagerControlsOpen ? "−" : "+"}
                </button>
              </div>

              {isManagerControlsOpen ? (
                <>
                  <p className="mt-3 text-sm text-ink/75">
                    You are the bootstrap manager. Create projects and assign clients by email.
                  </p>

                  {assignmentMessage ? (
                    <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
                      {assignmentMessage}
                    </p>
                  ) : null}

                  <div className="mt-4">
                  <form
                    onSubmit={handleCreateProjectAndAssign}
                    className="rounded-lg border border-ink/20 bg-white p-3.5"
                  >
                    <h3 className="text-sm font-semibold text-ink">Create Project + Assign Client</h3>
                    <div className="mt-3 space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(event) => setNewProjectName(event.target.value)}
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        placeholder="Client website revamp"
                        required
                      />
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={newProjectClientEmail}
                        onChange={(event) => setNewProjectClientEmail(event.target.value)}
                        autoComplete="email"
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        placeholder="client@company.com"
                        required
                      />
                      {selectedCreateClientSuggestion?.full_name ? (
                        <p className="text-xs text-ink/70">
                          Client name:{" "}
                          <span className="font-semibold">{selectedCreateClientSuggestion.full_name}</span>
                        </p>
                      ) : null}
                      {isLoadingNewProjectEmailSuggestions ? (
                        <p className="text-xs text-ink/60">Finding matching emails...</p>
                      ) : null}
                      {!isLoadingNewProjectEmailSuggestions &&
                      newProjectClientEmail.trim().length >= 2 &&
                      newProjectEmailSuggestions.length > 0 ? (
                        <div className="max-h-44 overflow-y-auto rounded-lg border border-ink/20 bg-white">
                          {newProjectEmailSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.email}
                              type="button"
                              onClick={() => setNewProjectClientEmail(suggestion.email)}
                              className="block w-full border-b border-ink/10 px-3 py-2 text-left last:border-b-0 hover:bg-mist"
                            >
                              <p className="text-xs font-semibold text-ink">
                                {suggestion.full_name || "Client account"}
                              </p>
                              <p className="text-xs text-ink/65">{suggestion.email}</p>
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Status
                          </label>
                          <select
                            value={newProjectStatus}
                            onChange={(event) =>
                              setNewProjectStatus(event.target.value as ProjectStatus)
                            }
                            className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          >
                            {projectStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Progress
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={newProjectProgress}
                            onChange={(event) => setNewProjectProgress(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={newProjectStartDate}
                            onChange={(event) => setNewProjectStartDate(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={newProjectDueDate}
                            onChange={(event) => setNewProjectDueDate(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                        </div>
                      </div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                        Project Summary (HTML / Markdown)
                      </label>
                      <textarea
                        rows={3}
                        value={newProjectSummary}
                        onChange={(event) => setNewProjectSummary(event.target.value)}
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        placeholder="Use HTML or Markdown, e.g. ## Launch prep or <p>Launch prep</p>"
                      />
                      <button
                        type="submit"
                        disabled={isCreatingProject}
                        className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isCreatingProject ? "Creating..." : "Create & Assign"}
                      </button>
                    </div>
                  </form>
                  </div>
                </>
              ) : (
                <p className="mt-3 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/70">
                  Manager controls drawer is collapsed.
                </p>
              )}

            </section>
          ) : null}

          {!selectedProject ? (
            <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard">
              <p className="text-sm text-ink/80">Select a project to view details.</p>
              {isProjectAdmin ? (
                <p className="mt-2 text-xs text-ink/65">
                  Archive and permanent delete actions appear in Project Snapshot after selecting a project.
                </p>
              ) : null}
            </section>
          ) : (
            <>
              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl uppercase leading-none text-ink">
                      {selectedProject.name}
                    </h2>
                    <p className="mt-2 text-sm text-ink/75">
                      Start {formatDate(selectedProject.start_date)} · Due{" "}
                      {formatDate(selectedProject.due_date)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink/60">
                      Your Access: {formatRole(effectiveRole)}
                    </p>
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                      statusStyles[selectedProject.status] || "bg-fog text-ink/70"
                    }`}
                  >
                    {selectedProject.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-ink/20 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                      Project Snapshot
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsProjectSnapshotModalOpen(true)}
                        className="inline-flex items-center rounded-full border border-[#475569] bg-[#64748b] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#55657c]"
                      >
                        {isProjectAdmin ? "Edit Snapshot" : "Edit Summary"}
                      </button>
                      {isProjectAdmin && selectedProject.status !== "archived" ? (
                        <button
                          type="button"
                          onClick={() => void handleArchiveProject()}
                          disabled={isArchivingProject || isDeletingProject}
                          className="inline-flex items-center rounded-full border border-[#9b1c1c] bg-[#d44444] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#bb3636] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isArchivingProject ? "Archiving..." : "Archive Project"}
                        </button>
                      ) : null}
                      {isProjectAdmin ? (
                        <button
                          type="button"
                          onClick={() => void handleDeleteProjectPermanently()}
                          disabled={isArchivingProject || isDeletingProject}
                          className="inline-flex items-center rounded-full border border-[#7f1010] bg-[#a51616] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#8d1414] disabled:cursor-not-allowed disabled:opacity-70"
                        >
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
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">
                        Project Progress
                      </p>
                      <p className="text-sm font-semibold text-ink">{selectedProject.progress}%</p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-ink/20 bg-fog">
                      <div
                        className="h-full bg-[#4a83ff] transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, selectedProject.progress))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 border-t border-ink/15 pt-3">
                    {selectedProject.summary ? (
                      <div
                        className="text-sm text-ink/80 [&_a]:text-[#2d5bd1] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold"
                        dangerouslySetInnerHTML={{
                          __html: renderProjectSummaryContent(selectedProject.summary)
                        }}
                      />
                    ) : (
                      <p className="text-sm text-ink/65">No summary added yet.</p>
                    )}
                  </div>
                </div>
              </section>

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

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <h3 className="font-display text-xl uppercase text-ink">Search & Filters</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  <input
                    type="text"
                    value={contentSearchDraft}
                    onChange={(event) => setContentSearchDraft(event.target.value)}
                    placeholder="Search updates, milestones, approvals, access, threads, files..."
                    className="md:col-span-4 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                  />
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Milestone Status
                    <select
                      value={milestoneFilterStatus}
                      onChange={(event) =>
                        setMilestoneFilterStatus(event.target.value as "all" | MilestoneStatus)
                      }
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    >
                      <option value="all">All</option>
                      {milestoneStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Approval Status
                    <select
                      value={approvalFilterStatus}
                      onChange={(event) =>
                        setApprovalFilterStatus(event.target.value as "all" | ApprovalStatus)
                      }
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    >
                      <option value="all">All</option>
                      {approvalStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Access Status
                    <select
                      value={accessStatusFilter}
                      onChange={(event) =>
                        setAccessStatusFilter(event.target.value as "all" | AccessItemStatus)
                      }
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    >
                      <option value="all">All</option>
                      {accessItemStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

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
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                          Business Goals & Scope
                        </p>
                        <p className="mt-1 text-[0.72rem] text-ink/65">
                          {projectClientIntake
                            ? `Last updated ${formatDateTime(projectClientIntake.updated_at)}`
                            : "No intake saved yet"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsClientIntakeOpen((current) => !current)}
                        className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink"
                      >
                        {isClientIntakeOpen ? "Hide Intake" : "Edit Intake"}
                      </button>
                    </div>

                    {!isClientIntakeOpen ? (
                      <div className="mt-3 space-y-2 text-sm text-ink/80">
                        <p>
                          <span className="font-semibold text-ink">Company:</span>{" "}
                          {intakeCompanyNameDraft.trim() || "Not set"}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Website:</span>{" "}
                          {intakeWebsiteUrlDraft.trim() ? (
                            <a
                              href={intakeWebsiteUrlDraft}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {intakeWebsiteUrlDraft}
                            </a>
                          ) : (
                            "Not set"
                          )}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Services:</span>{" "}
                          {intakeServiceNeedsDraft.length > 0
                            ? intakeServiceNeedsDraft.map((value) => value.replace("_", " ")).join(", ")
                            : "None selected"}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveClientIntake} className="mt-3 space-y-3">
                        <div className="grid gap-2 md:grid-cols-2">
                          <input
                            type="text"
                            value={intakeCompanyNameDraft}
                            onChange={(event) => setIntakeCompanyNameDraft(event.target.value)}
                            placeholder="Business name"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <input
                            type="text"
                            value={intakeWebsiteUrlDraft}
                            onChange={(event) => setIntakeWebsiteUrlDraft(event.target.value)}
                            placeholder="Website URL"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <textarea
                            rows={2}
                            value={intakeTargetAudienceDraft}
                            onChange={(event) => setIntakeTargetAudienceDraft(event.target.value)}
                            placeholder="Target audience"
                            className="md:col-span-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <textarea
                            rows={2}
                            value={intakePrimaryGoalDraft}
                            onChange={(event) => setIntakePrimaryGoalDraft(event.target.value)}
                            placeholder="Primary goal"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <textarea
                            rows={2}
                            value={intakeSecondaryGoalDraft}
                            onChange={(event) => setIntakeSecondaryGoalDraft(event.target.value)}
                            placeholder="Secondary goal"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <input
                            type="text"
                            value={intakeTimelineGoalDraft}
                            onChange={(event) => setIntakeTimelineGoalDraft(event.target.value)}
                            placeholder="Timeline goal"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <input
                            type="text"
                            value={intakeSuccessMetricsDraft}
                            onChange={(event) => setIntakeSuccessMetricsDraft(event.target.value)}
                            placeholder="Success metrics"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <input
                            type="text"
                            value={intakeCmsPlatformDraft}
                            onChange={(event) => setIntakeCmsPlatformDraft(event.target.value)}
                            placeholder="CMS platform"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                          <textarea
                            rows={2}
                            value={intakeNotesDraft}
                            onChange={(event) => setIntakeNotesDraft(event.target.value)}
                            placeholder="Additional notes"
                            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Services Needed
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {clientServiceNeedOptions.map((option) => {
                              const isActive = intakeServiceNeedsDraft.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleToggleServiceNeed(option.value)}
                                  className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition ${
                                    isActive
                                      ? "border-ink/70 bg-ink text-mist"
                                      : "border-ink/30 bg-white text-ink hover:border-ink/60"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="submit"
                            disabled={isSavingClientIntake}
                            className="inline-flex items-center rounded-full border border-[#0f7663] bg-[#16a085] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#0f8d74] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSavingClientIntake ? "Saving..." : "Save Intake"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsClientIntakeOpen(false)}
                            className="inline-flex items-center rounded-full border border-ink/30 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink"
                          >
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
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                          Access & Credentials Checklist
                        </p>
                        <p className="mt-1 text-[0.72rem] text-ink/65">
                          Sensitive fields are visible only to project members.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleGenerateAccessChecklist()}
                          disabled={isGeneratingAccessChecklist || intakeServiceNeedsDraft.length === 0}
                          className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isGeneratingAccessChecklist ? "Generating..." : "Generate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAccessChecklistOpen((current) => !current)}
                          className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink"
                        >
                          {isAccessChecklistOpen ? "Hide List" : "Open List"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#ffe2e2] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#892727]">
                        Missing {accessStatusCounts.missing}
                      </span>
                      <span className="rounded-full bg-[#fff5cf] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#8a5a00]">
                        Submitted {accessStatusCounts.submitted}
                      </span>
                      <span className="rounded-full bg-[#d5f4e2] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#0b6a40]">
                        Verified {accessStatusCounts.verified}
                      </span>
                      <span className="rounded-full bg-[#e7ecff] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#254084]">
                        Not needed {accessStatusCounts.not_needed}
                      </span>
                    </div>

                    {isAccessChecklistOpen ? (
                      <div className="mt-3 space-y-2">
                        {filteredProjectAccessItems.length === 0 ? (
                          <p className="rounded-lg border border-ink/20 bg-mist px-3 py-2 text-sm text-ink/75">
                            {projectAccessItems.length === 0
                              ? "No access checklist items yet. Save intake and generate checklist."
                              : "No access items match your current filters."}
                          </p>
                        ) : null}

                        {filteredProjectAccessItems.map((item) => {
                          const draft = accessItemDrafts[item.id];
                          const isItemOpen = Boolean(expandedAccessItemIds[item.id]);
                          const accessFieldVisibility =
                            accessFieldVisibilityById[item.id] ?? defaultAccessItemVisibility;
                          const savedFields = [
                            draft?.login_url.trim() ? "URL" : null,
                            draft?.account_email.trim() ? "Email" : null,
                            draft?.username.trim() ? "Username" : null,
                            draft?.secret_value.trim() ? "Password/token" : null,
                            draft?.secure_link.trim() ? "Secure link" : null
                          ].filter((value): value is string => Boolean(value));
                          if (!draft) {
                            return null;
                          }

                          return (
                            <article key={item.id} className="rounded-lg border border-ink/20 bg-mist px-3 py-2">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                                  <p className="mt-0.5 text-[0.72rem] text-ink/60">
                                    {item.service_area || "general"} · Updated {formatDateTime(item.updated_at)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                                      accessStatusStyles[draft.status]
                                    }`}
                                  >
                                    {draft.status.replace("_", " ")}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAccessItem(item.id)}
                                    className="inline-flex items-center rounded-full border border-ink/30 bg-white px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-ink"
                                  >
                                    {isItemOpen ? "Hide" : "Open"}
                                  </button>
                                </div>
                              </div>

                              {item.description ? (
                                <p className="mt-1 text-xs text-ink/75">{item.description}</p>
                              ) : null}

                              {!isItemOpen ? (
                                <p className="mt-1 text-xs text-ink/65">
                                  {savedFields.length > 0
                                    ? `Saved fields: ${savedFields.join(", ")}`
                                    : "No credentials saved yet."}
                                </p>
                              ) : (
                                <>
                                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                                    <select
                                      value={draft.status}
                                      onChange={(event) =>
                                        handleAccessDraftChange(
                                          item.id,
                                          "status",
                                          event.target.value as AccessItemStatus
                                        )
                                      }
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                                    >
                                      {accessItemStatuses.map((status) => (
                                        <option key={status} value={status}>
                                          {status.replace("_", " ")}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type={accessFieldVisibility.login_url ? "text" : "password"}
                                      value={draft.login_url}
                                      onChange={(event) =>
                                        handleAccessDraftChange(item.id, "login_url", event.target.value)
                                      }
                                      placeholder="Login URL"
                                      autoComplete="new-password"
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAccessFieldVisibility(item.id, "login_url")
                                      }
                                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75"
                                      aria-label={
                                        accessFieldVisibility.login_url ? "Hide login URL" : "Show login URL"
                                      }
                                      title={accessFieldVisibility.login_url ? "Hide" : "Show"}
                                    >
                                      {accessFieldVisibility.login_url ? (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M3 3l18 18" />
                                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" />
                                          <path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type={accessFieldVisibility.account_email ? "text" : "password"}
                                      value={draft.account_email}
                                      onChange={(event) =>
                                        handleAccessDraftChange(item.id, "account_email", event.target.value)
                                      }
                                      placeholder="Account email"
                                      autoComplete="new-password"
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAccessFieldVisibility(item.id, "account_email")
                                      }
                                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75"
                                      aria-label={
                                        accessFieldVisibility.account_email
                                          ? "Hide account email"
                                          : "Show account email"
                                      }
                                      title={accessFieldVisibility.account_email ? "Hide" : "Show"}
                                    >
                                      {accessFieldVisibility.account_email ? (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M3 3l18 18" />
                                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" />
                                          <path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type={accessFieldVisibility.username ? "text" : "password"}
                                      value={draft.username}
                                      onChange={(event) =>
                                        handleAccessDraftChange(item.id, "username", event.target.value)
                                      }
                                      placeholder="Username"
                                      autoComplete="new-password"
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAccessFieldVisibility(item.id, "username")
                                      }
                                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75"
                                      aria-label={accessFieldVisibility.username ? "Hide username" : "Show username"}
                                      title={accessFieldVisibility.username ? "Hide" : "Show"}
                                    >
                                      {accessFieldVisibility.username ? (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M3 3l18 18" />
                                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" />
                                          <path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type={accessFieldVisibility.secret_value ? "text" : "password"}
                                      value={draft.secret_value}
                                      onChange={(event) =>
                                        handleAccessDraftChange(item.id, "secret_value", event.target.value)
                                      }
                                      placeholder="Password / token"
                                      autoComplete="new-password"
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAccessFieldVisibility(item.id, "secret_value")
                                      }
                                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75"
                                      aria-label={
                                        accessFieldVisibility.secret_value
                                          ? "Hide password or token"
                                          : "Show password or token"
                                      }
                                      title={accessFieldVisibility.secret_value ? "Hide" : "Show"}
                                    >
                                      {accessFieldVisibility.secret_value ? (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M3 3l18 18" />
                                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" />
                                          <path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type={accessFieldVisibility.secure_link ? "text" : "password"}
                                      value={draft.secure_link}
                                      onChange={(event) =>
                                        handleAccessDraftChange(item.id, "secure_link", event.target.value)
                                      }
                                      placeholder="Secure share link"
                                      autoComplete="new-password"
                                      className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 pr-10 text-sm text-ink outline-none focus:border-ink/60"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleAccessFieldVisibility(item.id, "secure_link")
                                      }
                                      className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded border border-ink/20 bg-white px-1.5 py-1 text-[0.62rem] text-ink/75"
                                      aria-label={
                                        accessFieldVisibility.secure_link
                                          ? "Hide secure share link"
                                          : "Show secure share link"
                                      }
                                      title={accessFieldVisibility.secure_link ? "Hide" : "Show"}
                                    >
                                      {accessFieldVisibility.secure_link ? (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M3 3l18 18" />
                                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c4.5 0 8.3 2.9 9.5 7a11 11 0 01-4.2 5.4" />
                                          <path d="M6.6 6.6A11.1 11.1 0 002.5 12 11.1 11.1 0 007.6 18" />
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                          <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7S2.5 12 2.5 12z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={draft.notes}
                                    onChange={(event) =>
                                      handleAccessDraftChange(item.id, "notes", event.target.value)
                                    }
                                    placeholder="Notes (permissions, 2FA, owner, backup code location)"
                                    className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                                  />
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => void handleSaveAccessItem(item.id)}
                                      disabled={Boolean(savingAccessItemById[item.id])}
                                      className="inline-flex items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                      {savingAccessItemById[item.id] ? "Saving..." : "Save Access Item"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAccessItem(item.id)}
                                      className="inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink"
                                    >
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

              {isProjectAdmin ? (
                <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                  <h3 className="font-display text-xl uppercase text-ink">Admin Workspace</h3>
                  <p className="mt-2 text-sm text-ink/75">
                    Manager tools for timeline communication and replying to client questions.
                  </p>

                  <div className="mt-4">
                    <form
                      onSubmit={handlePostProgressUpdate}
                      className="rounded-lg border border-ink/20 bg-white p-3.5"
                    >
                      <h4 className="text-sm font-semibold text-ink">Post Progress Update</h4>
                      <div className="mt-3 space-y-3">
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                          Update Title
                        </label>
                        <input
                          type="text"
                          value={updateTitleDraft}
                          onChange={(event) => setUpdateTitleDraft(event.target.value)}
                          className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          placeholder="Milestone completed"
                          required
                        />
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                          Details
                        </label>
                        <textarea
                          rows={4}
                          value={updateBodyDraft}
                          onChange={(event) => setUpdateBodyDraft(event.target.value)}
                          className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          placeholder="What changed, what is next, and what the client should know."
                          required
                        />
                        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                          Progress Override (optional)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={updateProgressDraft}
                          onChange={(event) => setUpdateProgressDraft(event.target.value)}
                          className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          placeholder="Leave empty to keep current progress"
                        />
                        <button
                          type="submit"
                          disabled={isPostingUpdate}
                          className="inline-flex items-center rounded-full border-2 border-[#b45309] bg-[#f59e0b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a2b00] transition hover:-translate-y-0.5 hover:bg-[#e89505] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isPostingUpdate ? "Posting..." : "Publish Update"}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl uppercase text-ink">Project Timeline & Milestones</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    {filteredProjectMilestones.length} shown
                  </span>
                </div>

                {isProjectAdmin ? (
                  <form onSubmit={handleCreateMilestone} className="mt-3 rounded-lg border border-ink/20 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                      Add Milestone
                    </p>
                    <div className="mt-2 grid gap-2 md:grid-cols-[1.2fr_1fr_auto]">
                      <input
                        type="text"
                        value={milestoneTitleDraft}
                        onChange={(event) => setMilestoneTitleDraft(event.target.value)}
                        placeholder="Milestone title"
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        required
                      />
                      <input
                        type="date"
                        value={milestoneDueDateDraft}
                        onChange={(event) => setMilestoneDueDateDraft(event.target.value)}
                        className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                      />
                      <button
                        type="submit"
                        disabled={isCreatingMilestone}
                        className="inline-flex items-center justify-center rounded-full border border-[#0f7663] bg-[#d1fae5] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#065f46] transition hover:bg-[#bbf7d0] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isCreatingMilestone ? "Adding..." : "Add"}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={milestoneDetailsDraft}
                      onChange={(event) => setMilestoneDetailsDraft(event.target.value)}
                      placeholder="Optional details"
                      className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                    />
                  </form>
                ) : null}

                <div className="mt-4 space-y-2">
                  {filteredProjectMilestones.length === 0 ? (
                    <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                      {projectMilestones.length === 0
                        ? "No milestones added yet."
                        : "No milestones match your current filters."}
                    </p>
                  ) : null}
                  {filteredProjectMilestones.map((milestone) => (
                    <article key={milestone.id} className="rounded-lg border border-ink/20 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{milestone.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                            milestoneStatusStyles[milestone.status]
                          }`}
                        >
                          {milestone.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink/60">
                        Due {formatDate(milestone.due_date)} · Added {formatDateTime(milestone.created_at)}
                      </p>
                      {milestone.details ? (
                        <p className="mt-2 text-sm text-ink/80">{milestone.details}</p>
                      ) : null}
                      {isProjectAdmin ? (
                        <div className="mt-2">
                          <label className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink/65">
                            Status
                          </label>
                          <select
                            value={milestone.status}
                            onChange={(event) =>
                              void handleUpdateMilestoneStatus(
                                milestone.id,
                                event.target.value as MilestoneStatus
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60 sm:max-w-[220px]"
                          >
                            {milestoneStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl uppercase text-ink">Task Approvals</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    {filteredProjectApprovalTasks.length} shown
                  </span>
                </div>

                {isProjectAdmin ? (
                  <form
                    onSubmit={handleCreateApprovalTask}
                    className="mt-3 rounded-lg border border-ink/20 bg-white p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                      Request Approval
                    </p>
                    <input
                      type="text"
                      value={approvalTitleDraft}
                      onChange={(event) => setApprovalTitleDraft(event.target.value)}
                      placeholder="Deliverable / task title"
                      className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                      required
                    />
                    <textarea
                      rows={2}
                      value={approvalDetailsDraft}
                      onChange={(event) => setApprovalDetailsDraft(event.target.value)}
                      placeholder="What should the client approve?"
                      className="mt-2 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingApprovalTask}
                      className="mt-2 inline-flex items-center rounded-full border border-[#b45309] bg-[#fde68a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#7c2d12] transition hover:bg-[#fcd34d] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isCreatingApprovalTask ? "Sending..." : "Send For Approval"}
                    </button>
                  </form>
                ) : null}

                <div className="mt-4 space-y-2">
                  {filteredProjectApprovalTasks.length === 0 ? (
                    <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                      {projectApprovalTasks.length === 0
                        ? "No approval tasks yet."
                        : "No approval tasks match your current filters."}
                    </p>
                  ) : null}
                  {filteredProjectApprovalTasks.map((task) => {
                    const canRespond = !isProjectAdmin && task.status === "pending";

                    return (
                      <article key={task.id} className="rounded-lg border border-ink/20 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{task.title}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                              approvalStatusStyles[task.status]
                            }`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink/60">Requested {formatDateTime(task.created_at)}</p>
                        {task.details ? <p className="mt-2 text-sm text-ink/80">{task.details}</p> : null}
                        {task.client_note ? (
                          <p className="mt-2 rounded bg-mist px-2 py-1 text-sm text-ink/80">
                            Client note: {task.client_note}
                          </p>
                        ) : null}
                        {task.decided_at ? (
                          <p className="mt-1 text-xs text-ink/60">Decision: {formatDateTime(task.decided_at)}</p>
                        ) : null}

                        {canRespond ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={approvalResponseDrafts[task.id] || ""}
                              onChange={(event) =>
                                setApprovalResponseDrafts((current) => ({
                                  ...current,
                                  [task.id]: event.target.value
                                }))
                              }
                              placeholder="Optional note for your decision"
                              className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void handleRespondApprovalTask(task.id, "approved")}
                                disabled={Boolean(approvalSubmittingById[task.id])}
                                className="inline-flex items-center rounded-full border border-[#0b6a40] bg-[#d5f4e2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#0b6a40] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRespondApprovalTask(task.id, "changes_requested")}
                                disabled={Boolean(approvalSubmittingById[task.id])}
                                className="inline-flex items-center rounded-full border border-[#892727] bg-[#ffe2e2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#892727] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Request Changes
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {isProjectAdmin && task.status !== "pending" ? (
                          <button
                            type="button"
                            onClick={() => void handleReopenApprovalTask(task.id)}
                            disabled={Boolean(approvalSubmittingById[task.id])}
                            className="mt-2 inline-flex items-center rounded-full border border-ink/30 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Re-open Approval
                          </button>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <h3 className="font-display text-xl uppercase text-ink">Progress Updates</h3>
                {isLoadingProjectData ? <p className="mt-3 text-sm text-ink/75">Loading...</p> : null}
                {!isLoadingProjectData && filteredProjectUpdates.length === 0 ? (
                  <p className="mt-3 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                    {projectUpdates.length === 0
                      ? "No updates posted yet."
                      : "No updates match your current search/filter."}
                  </p>
                ) : null}
                <div className="mt-4 space-y-3">
                  {filteredProjectUpdates.map((update) => (
                    <article key={update.id} className="rounded-lg border border-ink/20 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-ink">{update.title}</h4>
                        <p className="text-xs text-ink/65">{formatDateTime(update.created_at)}</p>
                      </div>
                      {update.progress !== null ? (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2d5bd1]">
                          Progress: {update.progress}%
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-ink/80">{update.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <h3 className="font-display text-xl uppercase text-ink">Questions & Threads</h3>
                <form onSubmit={handleSubmitQuestion} className="mt-3 space-y-3">
                  <textarea
                    value={questionDraft}
                    onChange={(event) => setQuestionDraft(event.target.value)}
                    placeholder="Ask a question about scope, status, timeline, or deliverables..."
                    rows={4}
                    className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                    required
                  />
                  <input
                    type="text"
                    value={questionUrlDraft}
                    onChange={(event) => setQuestionUrlDraft(event.target.value)}
                    placeholder="Optional reference URL (https://...)"
                    className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                  />
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:-translate-y-0.5">
                    <input
                      type="file"
                      onChange={handleQuestionFileChange}
                      className="sr-only"
                      disabled={isSubmittingQuestion}
                    />
                    Add Attachment
                  </label>
                  {questionFileDraft ? (
                    <p className="text-xs text-ink/65">Selected file: {questionFileDraft.name}</p>
                  ) : null}
                  {questionFilePreviewUrl ? (
                    <a
                      href={questionFilePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[240px]"
                    >
                      <img
                        src={questionFilePreviewUrl}
                        alt="Question attachment preview"
                        className="w-full rounded-lg border border-ink/20 object-cover"
                      />
                    </a>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmittingQuestion}
                    className="inline-flex items-center rounded-full border-2 border-[#0c6fbe] bg-[#1d9bf0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#1488d7] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingQuestion ? "Sending..." : "Start Thread"}
                  </button>
                </form>

                <div className="mt-4 space-y-3">
                  {filteredProjectQuestions.length === 0 ? (
                    <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                      {projectQuestions.length === 0
                        ? "No questions yet."
                        : "No threads match your current search/filter."}
                    </p>
                  ) : null}
                  {filteredProjectQuestions.map((question, threadIndex) => {
                    const threadMessages = messagesByQuestionId[question.id] || [];
                    const hasThreadAttachment = threadMessages.some(
                      (message) => Boolean(message.attachment_file_path || message.attachment_url)
                    );

                    return (
                    <article key={question.id} className="rounded-lg border border-ink/20 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              hasThreadAttachment
                                ? "border-[#9cc9f3] bg-[#d8ecff] text-[#134d7a]"
                                : "border-[#d2ab19] bg-[#fff1a8] text-[#6f4a00]"
                            }`}
                            title={hasThreadAttachment ? "Thread with attachment" : "Thread"}
                            aria-label={hasThreadAttachment ? "Thread with attachment" : "Thread"}
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                              <path d="M4.9 4.5h14.2c1.1 0 1.9.8 1.9 1.9v9.2c0 1.1-.8 1.9-1.9 1.9h-9.7l-4.5 3v-3H4.9c-1.1 0-1.9-.8-1.9-1.9V6.4c0-1.1.8-1.9 1.9-1.9zm.1 2v7.8h1.9v1.8l2.8-1.8h9.4V6.5z" />
                            </svg>
                          </span>
                          <p className="text-sm font-semibold text-ink">{question.question}</p>
                        </div>
                        <p className="text-xs text-ink/60">{formatDateTime(question.created_at)}</p>
                      </div>
                      <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/55">
                        Thread {threadIndex + 1}
                      </p>

                      <div className="mt-3 space-y-2">
                        {threadMessages.map((message) => {
                          const isCurrentUserMessage = message.author_id === session.user.id;
                          const roleLabel = isCurrentUserMessage
                            ? "you"
                            : isBootstrapManager
                              ? memberRolesByUserId[message.author_id] || "manager"
                              : memberRolesByUserId[message.author_id] || "client";

                          return (
                            <div
                              key={message.id}
                              className={`max-w-[88%] rounded-md border p-2 ${
                                isCurrentUserMessage
                                  ? "ml-auto border-[#d2ab19] bg-[#fff1a8]"
                                  : "mr-auto border-ink/20 bg-mist/70"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/65">
                                  {roleLabel}
                                </p>
                                <p className="text-[0.68rem] text-ink/55">
                                  {formatDateTime(message.created_at)}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-ink/85">{message.message}</p>
                              {message.attachment_url ? (
                                <p className="mt-1 text-xs">
                                  <a
                                    href={message.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-[#2d5bd1] underline underline-offset-2"
                                  >
                                    {message.attachment_url}
                                  </a>
                                </p>
                              ) : null}
                              {message.attachment_file_path ? (
                                <div className="mt-1">
                                  {questionMessageAttachmentUrls[message.id] ? (
                                    message.attachment_mime_type?.startsWith("image/") ? (
                                      <a
                                        href={questionMessageAttachmentUrls[message.id]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block max-w-[220px]"
                                      >
                                        <img
                                          src={questionMessageAttachmentUrls[message.id]}
                                          alt={message.attachment_file_name || "Attached image"}
                                          className="w-full rounded border border-ink/20 object-cover"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={questionMessageAttachmentUrls[message.id]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-[#2d5bd1] underline underline-offset-2"
                                      >
                                        {message.attachment_file_name || "View attachment"}
                                      </a>
                                    )
                                  ) : (
                                    <p className="text-xs text-ink/60">
                                      {message.attachment_file_name || "Attachment"}
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <form
                        onSubmit={(event) => void handleSubmitThreadReply(question.id, event)}
                        className="mt-3 space-y-2 rounded-md border border-ink/15 bg-white p-2"
                      >
                        <textarea
                          rows={2}
                          value={replyDrafts[question.id] || ""}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({
                              ...current,
                              [question.id]: event.target.value
                            }))
                          }
                          placeholder="Reply to this thread..."
                          className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                          required
                        />
                        <input
                          type="text"
                          value={replyUrlDrafts[question.id] || ""}
                          onChange={(event) =>
                            setReplyUrlDrafts((current) => ({
                              ...current,
                              [question.id]: event.target.value
                            }))
                          }
                          placeholder="Optional URL"
                          className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
                        />
                        <label className="inline-flex cursor-pointer items-center rounded-full border border-ink/35 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:-translate-y-0.5">
                          <input
                            type="file"
                            onChange={(event) => handleThreadReplyFileChange(question.id, event)}
                            className="sr-only"
                            disabled={Boolean(replySubmittingByQuestionId[question.id])}
                          />
                          Add Attachment
                        </label>
                        {replyFileDrafts[question.id] ? (
                          <p className="text-xs text-ink/65">
                            Selected file: {replyFileDrafts[question.id]?.name}
                          </p>
                        ) : null}
                        {replyFilePreviewUrls[question.id] ? (
                          <a
                            href={replyFilePreviewUrls[question.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-[220px]"
                          >
                            <img
                              src={replyFilePreviewUrls[question.id]}
                              alt="Reply attachment preview"
                              className="w-full rounded border border-ink/20 object-cover"
                            />
                          </a>
                        ) : null}
                        <button
                          type="submit"
                          disabled={Boolean(replySubmittingByQuestionId[question.id])}
                          className="inline-flex items-center rounded-full border border-[#15803d] bg-[#dcfce7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#166534] transition hover:-translate-y-0.5 hover:bg-[#bbf7d0] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {replySubmittingByQuestionId[question.id] ? "Sending..." : "Send Reply"}
                        </button>
                      </form>
                    </article>
                  );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-display text-xl uppercase text-ink">Files & Documents</h3>
                  <label className="inline-flex cursor-pointer items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5">
                    <input
                      type="file"
                      onChange={(event) => void handleUploadFile(event)}
                      className="sr-only"
                      disabled={isUploadingFile}
                    />
                    {isUploadingFile ? "Uploading..." : "Upload File"}
                  </label>
                </div>
                <p className="mt-2 text-xs text-ink/65">
                  Accepted: documents, images, and project assets. Uploaded files are private.
                </p>

                <div className="mt-4 space-y-2">
                  {filteredProjectFiles.length === 0 ? (
                    <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
                      {projectFiles.length === 0
                        ? "No files uploaded yet."
                        : "No files match your current search/filter."}
                    </p>
                  ) : null}
                  {filteredProjectFiles.map((file) => (
                    <article
                      key={file.id}
                      className="flex flex-col gap-2 rounded-lg border border-ink/20 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{file.file_name}</p>
                        <p className="mt-1 text-xs text-ink/65">
                          {file.mime_type || "Unknown type"} · {formatBytes(file.size_bytes)} ·{" "}
                          {formatDateTime(file.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDownloadFile(file.file_path)}
                        className="inline-flex items-center rounded-full border border-ink/25 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink hover:border-ink/50"
                      >
                        Download
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
