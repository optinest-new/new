import type { ReactNode } from "react";

type StatusTone = "success" | "error" | "info" | "warning";

type StatusMessageProps = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  success: "border-[#84b98d] bg-[#e9f9ec] text-[#1f5c28]",
  error: "border-[#d88] bg-[#fff1f1] text-[#7a1f1f]",
  info: "border-[#a3b2d6] bg-[#eef3ff] text-[#254084]",
  warning: "border-amber-400 bg-amber-50 text-amber-800"
};

export function StatusMessage({ tone, children, className = "" }: StatusMessageProps) {
  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${toneStyles[tone]} ${className}`}>
      {children}
    </p>
  );
}
