"use client";

type PortalAlertTone = "error" | "success" | "info";

type PortalAlertModalProps = {
  open: boolean;
  tone: PortalAlertTone;
  title: string;
  message: string;
  onClose: () => void;
};

const toneStyles: Record<PortalAlertTone, { border: string; badge: string; body: string }> = {
  error: {
    border: "border-[#d88]",
    badge: "bg-[#ffe2e2] text-[#892727]",
    body: "text-[#7a1f1f]"
  },
  success: {
    border: "border-[#84b98d]",
    badge: "bg-[#e9f9ec] text-[#1f5c28]",
    body: "text-[#1f5c28]"
  },
  info: {
    border: "border-[#9db6e7]",
    badge: "bg-[#edf4ff] text-[#1d4ea5]",
    body: "text-[#1d3f7a]"
  }
};

export function PortalAlertModal({ open, tone, title, message, onClose }: PortalAlertModalProps) {
  if (!open || !message.trim()) {
    return null;
  }

  const style = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/55 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-alert-modal-title"
        className={`w-full max-w-lg rounded-2xl border-2 bg-mist p-5 shadow-hard sm:p-6 ${style.border}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="portal-alert-modal-title" className="font-display text-2xl uppercase leading-none text-ink">
            {title}
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${style.badge}`}
          >
            {tone}
          </span>
        </div>
        <p className={`mt-3 text-sm ${style.body}`}>{message}</p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-mist transition hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export type { PortalAlertTone };
