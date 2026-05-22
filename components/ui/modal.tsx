"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  tone?: "default" | "error" | "success" | "info";
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  label?: string;
};

const toneBorderStyles = {
  default: "border-ink/80",
  error: "border-[#d88]",
  success: "border-[#84b98d]",
  info: "border-[#9db6e7]"
};

const maxWidthStyles = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl"
};

export function Modal({
  open,
  onClose,
  title,
  children,
  tone = "default",
  footer,
  maxWidth = "sm",
  label
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/55 px-4 py-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label || title}
        className={`w-full ${maxWidthStyles[maxWidth]} rounded-2xl border-2 bg-mist p-5 shadow-hard animate-fade-in sm:p-6 ${toneBorderStyles[tone]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl uppercase leading-none text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ink/40 bg-white px-2 py-1 text-sm font-bold text-ink hover:bg-fog"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer ? (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
