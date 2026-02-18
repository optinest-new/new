"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type ScheduleCallModalProps = {
  label?: string;
  className?: string;
  children?: ReactNode;
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

function mapServiceSelection(value: string): string[] {
  if (value === "Web Design") {
    return ["web_design"];
  }

  if (value === "SEO") {
    return ["seo"];
  }

  if (value === "Both") {
    return ["web_design", "seo"];
  }

  return [];
}

export function ScheduleCallModal({
  label = "Schedule a Call",
  className,
  children
}: ScheduleCallModalProps) {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

    if (!values.name || !values.email) {
      setSubmitError("Name and email are required.");
      return;
    }

    if (!supabase) {
      setSubmitError("Portal is not configured yet. Please try again later.");
      return;
    }

    let preferredCallAt: string | null = null;
    if (values.preferredCallTime) {
      const parsed = new Date(values.preferredCallTime);
      if (Number.isNaN(parsed.getTime())) {
        setSubmitError("Preferred call time is invalid.");
        return;
      }
      preferredCallAt = parsed.toISOString();
    }

    const noteParts: string[] = [];
    if (values.website) {
      noteParts.push(`Website: ${values.website}`);
    }
    if (values.additionalDetails) {
      noteParts.push(`Additional details: ${values.additionalDetails}`);
    }

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

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSubmitMessage("Call request submitted. We will contact you to confirm the schedule.");
    form.reset();
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {label}
        {children}
      </button>

      {isMounted && isOpen
        ? createPortal(
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close schedule call form"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Schedule a call form"
            className="relative z-10 my-3 max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-ink/85 bg-mist p-3 shadow-hard sm:my-0 sm:max-h-[90vh] sm:p-6"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink/20 pb-3">
              <div>
                <h2 className="font-display text-2xl uppercase leading-none text-ink sm:text-3xl">
                  Schedule a Call
                </h2>
                <p className="mt-2 text-sm text-ink/75">
                  Tell us about your project and we will prepare for the call.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-ink/40 bg-white px-2 py-1 text-sm font-bold text-ink hover:bg-fog"
              >
                ✕
              </button>
            </header>

            <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Name
                <input
                  name="name"
                  required
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Company
                <input
                  name="company"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Website
                <input
                  name="website"
                  type="url"
                  placeholder="https://"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                <span className="text-[0.78rem] leading-snug sm:text-sm">
                  Service Needed (Web Design / SEO / Both)
                </span>
                <select
                  name="serviceNeeded"
                  defaultValue=""
                  required
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  <option value="Web Design">Web Design</option>
                  <option value="SEO">SEO</option>
                  <option value="Both">Both</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Estimated Budget
                <input
                  name="estimatedBudget"
                  placeholder="$2,000 - $5,000"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Timeline
                <input
                  name="timeline"
                  placeholder="2-4 weeks"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
                Main Goals
                <textarea
                  name="mainGoals"
                  rows={3}
                  required
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
                Additional Details
                <textarea
                  name="additionalDetails"
                  rows={4}
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Best Contact Number
                <input
                  name="contactNumber"
                  type="tel"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-ink">
                Preferred Call Time
                <input
                  name="preferredCallTime"
                  type="datetime-local"
                  className="rounded-md border border-ink/35 bg-white px-3 py-2 text-base text-ink outline-none ring-0 focus:border-ink sm:text-sm"
                />
              </label>

              <div className="mt-2 flex flex-wrap items-center gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-ink/40 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-fog"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full border-2 border-ink bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-mist hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Call Request"}
                </button>
              </div>

              {submitError ? (
                <p className="sm:col-span-2 rounded-md border border-[#d88] bg-[#fff1f1] px-3 py-2 text-sm text-[#7a1f1f]">
                  {submitError}
                </p>
              ) : null}
              {submitMessage ? (
                <p className="sm:col-span-2 rounded-md border border-[#84b98d] bg-[#e9f9ec] px-3 py-2 text-sm text-[#1f5c28]">
                  {submitMessage}
                </p>
              ) : null}
            </form>
          </section>
        </div>
          ,
          document.body
        )
        : null}
    </>
  );
}
