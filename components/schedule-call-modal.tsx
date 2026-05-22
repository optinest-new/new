"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";
import { Modal, Input, Select, Textarea, Button, StatusMessage } from "@/components/ui";

type ScheduleCallModalProps = {
  label?: string;
  className?: string;
  children?: ReactNode;
  onOpen?: () => void;
};

type ScheduleFormValues = {
  name: string;
  email: string;
  company: string;
  website: string;
  serviceNeeded: string;
  estimatedBudget: string;
  timeline: string;
  mainGoals: string;
  additionalDetails: string;
  contactNumber: string;
  preferredCallTime: string;
};

const serviceOptions = [
  { value: "", label: "Select a service" },
  { value: "Web Design", label: "Web Design" },
  { value: "Web Development", label: "Web Development" },
  { value: "SEO", label: "SEO" },
  { value: "Web Design + SEO", label: "Web Design + SEO" },
  { value: "Web Design + Web Development", label: "Web Design + Web Development" },
  { value: "SEO + Web Development", label: "SEO + Web Development" },
  { value: "All Three", label: "All Three" }
];

function mapServiceSelection(value: string): string[] {
  const map: Record<string, string[]> = {
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

export function ScheduleCallModal({ label = "Schedule a Call", className, children, onOpen }: ScheduleCallModalProps) {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const values: ScheduleFormValues = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      company: String(data.get("company") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
      serviceNeeded: String(data.get("serviceNeeded") ?? "").trim(),
      estimatedBudget: String(data.get("estimatedBudget") ?? "").trim(),
      timeline: String(data.get("timeline") ?? "").trim(),
      mainGoals: String(data.get("mainGoals") ?? "").trim(),
      additionalDetails: String(data.get("additionalDetails") ?? "").trim(),
      contactNumber: String(data.get("contactNumber") ?? "").trim(),
      preferredCallTime: String(data.get("preferredCallTime") ?? "").trim()
    };

    if (!values.name || !values.email) { setSubmitError("Name and email are required."); return; }
    if (!supabase) { setSubmitError("Portal is not configured yet. Please try again later."); return; }

    let preferredCallAt: string | null = null;
    if (values.preferredCallTime) {
      const parsed = new Date(values.preferredCallTime);
      if (Number.isNaN(parsed.getTime())) { setSubmitError("Preferred call time is invalid."); return; }
      preferredCallAt = parsed.toISOString();
    }

    const noteParts: string[] = [];
    if (values.website) noteParts.push(`Website: ${values.website}`);
    if (values.additionalDetails) noteParts.push(`Additional details: ${values.additionalDetails}`);

    const { data: userResult } = await supabase.auth.getUser();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    const { error } = await supabase.from("onboarding_leads").insert({
      full_name: values.name,
      email: values.email,
      company_name: values.company || null,
      phone: values.contactNumber || null,
      services_needed: mapServiceSelection(values.serviceNeeded),
      budget_range: values.estimatedBudget || null,
      timeline_goal: values.timeline || null,
      preferred_call_at: preferredCallAt,
      goals: values.mainGoals || null,
      notes: noteParts.length > 0 ? noteParts.join("\n\n") : null,
      status: "call_scheduled",
      created_by: userResult.user?.id || null
    });

    setIsSubmitting(false);
    if (error) { setSubmitError(error.message); return; }
    setSubmitMessage("Call request submitted. We will contact you to confirm the schedule.");
    form.reset();
  };

  return (
    <>
      <button type="button" onClick={() => { setIsOpen(true); onOpen?.(); }} className={className}>
        {label}{children}
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule a Call"
        maxWidth="md"
        label="Schedule a call form"
      >
        <p className="text-sm text-ink/75">Tell us about your project and we will prepare for the call.</p>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input name="name" label="Name" required variant="schedule" />
          <Input name="email" label="Email" type="email" required variant="schedule" />
          <Input name="company" label="Company" variant="schedule" />
          <Input name="website" label="Website" type="url" placeholder="https://" variant="schedule" />
          <Select
            name="serviceNeeded"
            label="Service Needed"
            variant="schedule"
            placeholder="Select a service"
            options={serviceOptions.filter(o => o.value !== "")}
            required
          />
          <Input name="estimatedBudget" label="Estimated Budget" placeholder="$2,000 - $5,000" variant="schedule" />
          <Input name="timeline" label="Timeline" placeholder="2-4 weeks" variant="schedule" />

          <div className="sm:col-span-2">
            <Textarea name="mainGoals" label="Main Goals" rows={3} required variant="schedule" />
          </div>
          <div className="sm:col-span-2">
            <Textarea name="additionalDetails" label="Additional Details" rows={4} variant="schedule" />
          </div>
          <Input name="contactNumber" label="Best Contact Number" type="tel" variant="schedule" />
          <Input name="preferredCallTime" label="Preferred Call Time" type="datetime-local" variant="schedule" />

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Call Request"}
            </Button>
          </div>

          {submitError ? <StatusMessage tone="error" className="sm:col-span-2">{submitError}</StatusMessage> : null}
          {submitMessage ? <StatusMessage tone="success" className="sm:col-span-2">{submitMessage}</StatusMessage> : null}
        </form>
      </Modal>
    </>
  );
}
