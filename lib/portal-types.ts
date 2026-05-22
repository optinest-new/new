export type PortalProject = {
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

export type ProjectUpdate = {
  id: string;
  title: string;
  body: string;
  progress: number | null;
  created_at: string;
};

export type ProjectQuestion = {
  id: string;
  project_id: string;
  author_id: string;
  question: string;
  created_at: string;
};

export type ProjectFile = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

export type ProjectPaymentStatus = "created" | "approved" | "captured" | "voided" | "failed";

export type ProjectPayment = {
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

export type RecurringInterval = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export type ProjectBillingProfile = {
  project_id: string;
  recurring_enabled: boolean;
  recurring_amount: number | null;
  recurring_interval: RecurringInterval;
  next_payment_due_at: string | null;
  autopay_provider: "paypal" | null;
  notes: string | null;
  updated_at: string;
};

export type PaymentFeatureFlags = {
  manual_payments_enabled: boolean;
  recurring_payments_enabled: boolean;
};

export type PaymentFeatureSettingsDraft = PaymentFeatureFlags;

export type ProjectBillingProfileDraft = {
  recurring_enabled: boolean;
  recurring_amount: string;
  recurring_interval: RecurringInterval;
  next_payment_due_at: string;
  notes: string;
};

export type ManagerBillingProjectRow = {
  project: PortalProject;
  balance: number | null;
  capturedPaymentTotal: number;
  capturedPaymentCount: number;
  lastPaymentAt: string | null;
  recurringProfile: ProjectBillingProfile | null;
};

export type ProjectMilestone = {
  id: string;
  project_id: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: "planned" | "in_progress" | "done";
  sort_order: number;
  created_at: string;
};

export type ProjectApprovalTask = {
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

export type ClientServiceNeed = "seo" | "web_design" | "web_development" | "content" | "analytics" | "maintenance";

export type ClientIntakeProfile = {
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

export type AccessItemStatus = "missing" | "submitted" | "verified" | "not_needed";

export type ProjectAccessItem = {
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

export type AccessItemDraft = {
  status: AccessItemStatus;
  login_url: string;
  account_email: string;
  username: string;
  secret_value: string;
  secure_link: string;
  notes: string;
};

export type AccessItemVisibilityField = "login_url" | "account_email" | "username" | "secret_value" | "secure_link";

export type AccessItemVisibilityState = Record<AccessItemVisibilityField, boolean>;

export type QuestionMessage = {
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

export type OnboardingStatus = "call_scheduled" | "qualified" | "deposited" | "project_started";

export type OnboardingLead = {
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

export type OnboardingLeadDraft = {
  status: OnboardingStatus;
  manager_notes: string;
  proposed_project_name: string;
  quoted_amount: string;
  deposit_amount: string;
  payment_reference: string;
};

export type ClientDirectorySuggestion = {
  email: string;
  full_name: string | null;
};

export type ProjectContact = {
  email: string;
  full_name: string | null;
  role: MemberRole;
};

export type MemberRole = "client" | "manager" | "owner";
export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "archived";
export type MilestoneStatus = "planned" | "in_progress" | "done";
export type ApprovalStatus = "pending" | "approved" | "changes_requested";

export type PortalWorkspaceTabId =
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

export type PortalWorkspaceTab = {
  id: PortalWorkspaceTabId;
  label: string;
  requiresProject?: boolean;
  adminOnly?: boolean;
  bootstrapOnly?: boolean;
};

export type TabLastSeenById = Partial<Record<PortalWorkspaceTabId, string>>;
