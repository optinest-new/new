"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ScheduleCallModalProps = {
  label?: string;
  className?: string;
  email?: string;
  children?: ReactNode;
};

type ScheduleFormValues = {
  name: string;
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

const defaultEmail = "optinestdigital@gmail.com";

function formatPreferredCallTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short"
  });
}

function createMailtoUrl(values: ScheduleFormValues, email: string) {
  const subject = `Schedule a Call - ${values.name || "New Project Inquiry"}`;
  const bodyLines = [
    "Hi Optinest Digital,",
    "",
    "I would like to schedule a call about my project.",
    "",
    `Name: ${values.name}`,
    `Company: ${values.company}`,
    `Website: ${values.website}`,
    `Service Needed (Web Design / SEO / Both): ${values.serviceNeeded}`,
    `Estimated Budget: ${values.estimatedBudget}`,
    `Timeline: ${values.timeline}`,
    `Main Goals: ${values.mainGoals}`,
    `Additional Details: ${values.additionalDetails}`,
    `Best Contact Number: ${values.contactNumber}`,
    `Preferred Call Time: ${formatPreferredCallTime(values.preferredCallTime)}`
  ];
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join("\n")
  )}`;
}

export function ScheduleCallModal({
  label = "Schedule a Call",
  className,
  email = defaultEmail,
  children
}: ScheduleCallModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const values: ScheduleFormValues = {
      name: String(data.get("name") ?? "").trim(),
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

    const mailtoUrl = createMailtoUrl(values, email);
    window.location.href = mailtoUrl;
    setIsOpen(false);
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
                  className="rounded-full border-2 border-ink bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-mist hover:-translate-y-0.5"
                >
                  Send Via Email
                </button>
              </div>
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
