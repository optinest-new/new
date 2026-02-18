"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type OnboardingStatus = "call_scheduled" | "qualified" | "deposited" | "project_started";

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

const onboardingStatuses: OnboardingStatus[] = [
  "call_scheduled",
  "qualified",
  "deposited",
  "project_started"
];

const onboardingStatusStyles: Record<OnboardingStatus, string> = {
  call_scheduled: "bg-[#d8ecff] text-[#134d7a]",
  qualified: "bg-[#d5f4e2] text-[#0b6a40]",
  deposited: "bg-[#d1fae5] text-[#065f46]",
  project_started: "bg-[#def7f7] text-[#0f6a70]"
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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

export default function OnboardingPipelinePage() {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingManagerStatus, setIsLoadingManagerStatus] = useState(false);
  const [isBootstrapManager, setIsBootstrapManager] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [pipelineMessage, setPipelineMessage] = useState("");
  const [onboardingLeads, setOnboardingLeads] = useState<OnboardingLead[]>([]);
  const [onboardingLeadDrafts, setOnboardingLeadDrafts] = useState<Record<string, OnboardingLeadDraft>>(
    {}
  );
  const [isLoadingOnboardingLeads, setIsLoadingOnboardingLeads] = useState(false);
  const [onboardingSearchDraft, setOnboardingSearchDraft] = useState("");
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState<"all" | OnboardingStatus>("all");
  const [savingOnboardingLeadById, setSavingOnboardingLeadById] = useState<Record<string, boolean>>({});
  const [convertingOnboardingLeadById, setConvertingOnboardingLeadById] = useState<
    Record<string, boolean>
  >({});
  const [expandedLeadIds, setExpandedLeadIds] = useState<Record<string, boolean>>({});

  const filteredOnboardingLeads = useMemo(() => {
    const normalizedSearch = onboardingSearchDraft.trim().toLowerCase();
    return onboardingLeads.filter((lead) => {
      const haystack =
        `${lead.full_name} ${lead.email} ${lead.company_name ?? ""} ${lead.goals ?? ""} ${lead.manager_notes ?? ""}`
          .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesStatus = onboardingStatusFilter === "all" || lead.status === onboardingStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [onboardingLeads, onboardingSearchDraft, onboardingStatusFilter]);

  const onboardingStatusCounts = useMemo(() => {
    return onboardingLeads.reduce<Record<OnboardingStatus, number>>(
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
  }, [onboardingLeads]);

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
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setPortalError("");
      setPipelineMessage("");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      setIsBootstrapManager(false);
      return;
    }

    let cancelled = false;
    setIsLoadingManagerStatus(true);

    supabase.rpc("is_bootstrap_manager").then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      setIsLoadingManagerStatus(false);
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

  const loadOnboardingLeads = useCallback(async () => {
    if (!supabase || !session || !isBootstrapManager) {
      setOnboardingLeads([]);
      setOnboardingLeadDrafts({});
      setSavingOnboardingLeadById({});
      setConvertingOnboardingLeadById({});
      setExpandedLeadIds({});
      return;
    }

    setIsLoadingOnboardingLeads(true);
    setPortalError("");

    const { data, error } = await supabase
      .from("onboarding_leads")
      .select(
        "id,full_name,email,company_name,phone,services_needed,budget_range,timeline_goal,preferred_call_at,goals,notes,status,manager_notes,proposed_project_name,quoted_amount,deposit_amount,payment_reference,converted_project_id,converted_at,created_at,updated_at"
      )
      .is("converted_project_id", null)
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
    setExpandedLeadIds((current) => {
      const next: Record<string, boolean> = {};
      for (const lead of rows) {
        next[lead.id] = current[lead.id] ?? false;
      }
      return next;
    });
  }, [isBootstrapManager, session, supabase]);

  useEffect(() => {
    if (!session || !isBootstrapManager) {
      setOnboardingLeads([]);
      setOnboardingLeadDrafts({});
      setSavingOnboardingLeadById({});
      setConvertingOnboardingLeadById({});
      setExpandedLeadIds({});
      return;
    }

    void loadOnboardingLeads();
  }, [isBootstrapManager, loadOnboardingLeads, session]);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setOnboardingLeads([]);
    setOnboardingLeadDrafts({});
    setExpandedLeadIds({});
    setPortalError("");
    setPipelineMessage("");
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
    setPipelineMessage("");

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

    setPipelineMessage("Lead updated.");
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

    const projectName = draft.proposed_project_name.trim() || `${lead.company_name || lead.full_name} Project`;

    setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: true }));
    setPortalError("");
    setPipelineMessage("");

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

    const { data: assignedUserId, error: assignError } = await supabase.rpc("assign_client_to_project", {
      project_uuid: projectRow.id,
      client_email: lead.email,
      client_role: "client"
    });

    if (assignError) {
      setConvertingOnboardingLeadById((current) => ({ ...current, [leadId]: false }));
      setPortalError(
        `Project created, but client assignment failed: ${formatAssignmentError(assignError.message)}`
      );
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

    setPipelineMessage(
      assignedUserId
        ? "Lead converted and client was assigned to the project."
        : "Lead converted. Client will be auto-assigned when they sign in with the onboarding email."
    );
    await loadOnboardingLeads();
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Onboarding Pipeline</h1>
          <p className="mt-4 text-sm text-ink/85">
            Add your Supabase public keys to enable this workspace.
          </p>
        </section>
      </main>
    );
  }

  if (isLoadingSession) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Loading session...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Onboarding Pipeline</h1>
          <p className="mt-4 text-sm text-ink/85">Sign in to the portal to continue.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
          >
            Go To Portal Login
          </Link>
        </section>
      </main>
    );
  }

  if (isLoadingManagerStatus) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <p className="text-sm text-ink/85">Checking manager access...</p>
        </section>
      </main>
    );
  }

  if (!isBootstrapManager) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-ink/80 bg-mist p-6 shadow-hard">
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Onboarding Pipeline</h1>
          <p className="mt-4 text-sm text-ink/85">Only the manager can access this page.</p>
          <Link
            href="/portal"
            className="mt-4 inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
          >
            Back To Portal
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">Onboarding Pipeline</h1>
            <p className="mt-2 text-sm text-ink/80">
              Signed in as <span className="font-semibold">{session.user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal"
              className="inline-flex items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
            >
              Back To Portal
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist transition hover:-translate-y-0.5"
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
        {pipelineMessage ? (
          <p className="mt-3 rounded-lg border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
            {pipelineMessage}
          </p>
        ) : null}
      </header>

      <section className="mt-6 rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/75">
            Stages: call scheduled, qualified, deposited, project started.
          </p>
          <button
            type="button"
            onClick={() => void loadOnboardingLeads()}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input
            type="text"
            value={onboardingSearchDraft}
            onChange={(event) => setOnboardingSearchDraft(event.target.value)}
            placeholder="Search by name, email, goals, notes..."
            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
          />
          <select
            value={onboardingStatusFilter}
            onChange={(event) => setOnboardingStatusFilter(event.target.value as "all" | OnboardingStatus)}
            className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60"
          >
            <option value="all">All statuses</option>
            {onboardingStatuses.map((status) => (
              <option key={status} value={status}>
                {formatKeyLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#d8ecff] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#134d7a]">
            Calls {onboardingStatusCounts.call_scheduled}
          </span>
          <span className="rounded-full bg-[#d5f4e2] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#0b6a40]">
            Qualified {onboardingStatusCounts.qualified}
          </span>
          <span className="rounded-full bg-[#d1fae5] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#065f46]">
            Deposited {onboardingStatusCounts.deposited}
          </span>
          <span className="rounded-full bg-[#def7f7] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#0f6a70]">
            Started {onboardingStatusCounts.project_started}
          </span>
        </div>

        {isLoadingOnboardingLeads ? (
          <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            Loading onboarding leads...
          </p>
        ) : null}

        {!isLoadingOnboardingLeads && filteredOnboardingLeads.length === 0 ? (
          <p className="mt-4 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {onboardingLeads.length === 0
              ? "No active onboarding leads."
              : "No onboarding leads match your search/filter."}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {filteredOnboardingLeads.map((lead) => {
            const draft = onboardingLeadDrafts[lead.id];
            const isSaving = Boolean(savingOnboardingLeadById[lead.id]);
            const isConverting = Boolean(convertingOnboardingLeadById[lead.id]);
            const serviceTags = lead.services_needed ?? [];
            const isExpanded = Boolean(expandedLeadIds[lead.id]);

            if (!draft) {
              return null;
            }

            return (
              <article key={lead.id} className="rounded-lg border border-ink/20 bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{lead.full_name}</h3>
                    <p className="mt-1 text-xs text-ink/70">
                      <a href={`mailto:${lead.email}`} className="underline">
                        {lead.email}
                      </a>
                      {lead.company_name ? ` · ${lead.company_name}` : ""}
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                      onboardingStatusStyles[draft.status]
                    }`}
                  >
                    {formatKeyLabel(draft.status)}
                  </span>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLeadIds((current) => ({ ...current, [lead.id]: !current[lead.id] }))
                    }
                    className="inline-flex items-center rounded-full border border-ink/30 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink"
                  >
                    {isExpanded ? "Collapse Details" : "Expand Details"}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceTags.length === 0 ? (
                    <span className="text-xs text-ink/60">No services selected</span>
                  ) : (
                    serviceTags.map((entry) => (
                      <span
                        key={`${lead.id}-${entry}`}
                        className="rounded-full border border-ink/20 bg-mist px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink/75"
                      >
                        {formatKeyLabel(entry)}
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-2 grid gap-2 text-xs text-ink/70 sm:grid-cols-2">
                  <p>Preferred call: {lead.preferred_call_at ? formatDateTime(lead.preferred_call_at) : "Not set"}</p>
                  <p>Created: {formatDateTime(lead.created_at)}</p>
                  <p>Quote: {lead.quoted_amount !== null ? formatUsd(lead.quoted_amount) : "Not set"}</p>
                  <p>Deposit: {lead.deposit_amount !== null ? formatUsd(lead.deposit_amount) : "Not set"}</p>
                </div>

                {lead.goals ? (
                  <p className="mt-2 rounded-md bg-mist px-2 py-1 text-sm text-ink/80">{lead.goals}</p>
                ) : null}
                {lead.notes ? (
                  <p className="mt-2 rounded-md bg-[#fff8e8] px-2 py-1 text-sm text-ink/80">{lead.notes}</p>
                ) : null}

                {isExpanded ? (
                  <form
                    className="mt-3 grid gap-3 sm:grid-cols-2"
                    onSubmit={(event: FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      void handleSaveOnboardingLead(lead.id);
                    }}
                  >
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Status
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "status", event.target.value as OnboardingStatus)
                      }
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    >
                      {onboardingStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatKeyLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Project Name
                    <input
                      type="text"
                      value={draft.proposed_project_name}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "proposed_project_name", event.target.value)
                      }
                      placeholder="Project name for conversion"
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Quoted Amount
                    <input
                      type="text"
                      value={draft.quoted_amount}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "quoted_amount", event.target.value)
                      }
                      placeholder="5000"
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">
                    Deposit Amount
                    <input
                      type="text"
                      value={draft.deposit_amount}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "deposit_amount", event.target.value)
                      }
                      placeholder="2500"
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65 sm:col-span-2">
                    Payment Reference
                    <input
                      type="text"
                      value={draft.payment_reference}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "payment_reference", event.target.value)
                      }
                      placeholder="Invoice number, payment link, transfer reference"
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/65 sm:col-span-2">
                    Manager Notes
                    <textarea
                      rows={2}
                      value={draft.manager_notes}
                      onChange={(event) =>
                        handleOnboardingDraftChange(lead.id, "manager_notes", event.target.value)
                      }
                      placeholder="Qualification notes, blockers, action items"
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-2 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink/60"
                    />
                  </label>

                  <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center rounded-full border-2 border-[#1f56c2] bg-[#2d6cdf] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#245cc3] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? "Saving..." : "Save Lead"}
                    </button>
                    {!lead.converted_project_id ? (
                      <button
                        type="button"
                        onClick={() => void handleConvertOnboardingLeadToProject(lead.id)}
                        disabled={isConverting}
                        className="inline-flex items-center rounded-full border-2 border-[#0f7663] bg-[#16a085] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#0f8d74] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isConverting ? "Converting..." : "Convert to Project"}
                      </button>
                    ) : null}
                  </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
