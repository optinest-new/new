"use client";

import { Button, Badge } from "@/components/ui";

type PortalAlertTone = "error" | "success" | "info";

type PortalAlertModalProps = {
  open: boolean;
  tone: PortalAlertTone;
  title: string;
  message: string;
  onClose: () => void;
};

const toneBadgeMap: Record<PortalAlertTone, "error" | "success" | "info"> = {
  error: "error",
  success: "success",
  info: "info"
};

export function PortalAlertModal({ open, tone, title, message, onClose }: PortalAlertModalProps) {
  if (!open || !message.trim()) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/55 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-alert-modal-title"
        className={`w-full max-w-lg rounded-2xl border-2 bg-mist p-5 shadow-hard sm:p-6 ${
          tone === "error" ? "border-[#d88]" : tone === "success" ? "border-[#84b98d]" : "border-[#9db6e7]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="portal-alert-modal-title" className="font-display text-2xl uppercase leading-none text-ink">
            {title}
          </h2>
          <Badge tone={toneBadgeMap[tone]} variant="solid" size="sm">{tone}</Badge>
        </div>
        <p className={`mt-3 text-sm ${
          tone === "error" ? "text-[#7a1f1f]" : tone === "success" ? "text-[#1f5c28]" : "text-[#1d3f7a]"
        }`}>{message}</p>
        <div className="mt-5 flex justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { PortalAlertTone };
