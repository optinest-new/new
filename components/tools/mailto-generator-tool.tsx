"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

export function MailtoGeneratorTool() {
  const [to, setTo] = useState("optinestdigital@gmail.com");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("Schedule a Call - New Project Inquiry");
  const [body, setBody] = useState(
    "Hi Optinest Digital,\n\nI would like to schedule a call about my project.\n\nName:\nCompany:\nWebsite:\nService Needed:\nEstimated Budget:\nTimeline:\nMain Goals:\nAdditional Details:\nBest Contact Number:\nPreferred Call Time:"
  );
  const [anchorText, setAnchorText] = useState("Schedule a Call");

  const mailtoUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (cc.trim()) {
      params.set("cc", cc.trim());
    }
    if (bcc.trim()) {
      params.set("bcc", bcc.trim());
    }
    if (subject.trim()) {
      params.set("subject", subject.trim());
    }
    if (body.trim()) {
      params.set("body", body.trim());
    }

    const query = params.toString();
    return `mailto:${to.trim()}${query ? `?${query}` : ""}`;
  }, [bcc, body, cc, subject, to]);

  const anchorCode = `<a href="${mailtoUrl}">${anchorText}</a>`;

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          To Email
          <input
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Anchor Text
          <input
            value={anchorText}
            onChange={(event) => setAnchorText(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          CC
          <input
            value={cc}
            onChange={(event) => setCc(event.target.value)}
            placeholder="team@example.com"
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          BCC
          <input
            value={bcc}
            onChange={(event) => setBcc(event.target.value)}
            placeholder="owner@example.com"
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">
          Body
          <textarea
            rows={9}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 font-mono text-xs text-ink"
          />
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">Generated Mailto URL</h2>
            <CopyButton text={mailtoUrl} label="Copy URL" />
          </div>
          <textarea
            readOnly
            value={mailtoUrl}
            className="h-24 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">HTML Anchor Snippet</h2>
            <CopyButton text={anchorCode} label="Copy HTML" />
          </div>
          <textarea
            readOnly
            value={anchorCode}
            className="h-20 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
        </div>
      </div>
    </section>
  );
}
