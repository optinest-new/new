import { forwardRef, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: "default" | "portal" | "schedule" | "mono";
  label?: string;
  error?: string;
};

const variantStyles = {
  default:
    "border-2 border-line/16 bg-surface-container px-3 py-2.5 text-sm text-ink outline-none ring-0 resize-y placeholder:text-ink/35 focus:border-primary focus:shadow-hard",
  portal:
    "border-2 border-line/16 bg-surface-container px-3 py-3 text-sm text-ink outline-none resize-y placeholder:text-ink/35 focus:border-primary focus:shadow-hard",
  schedule:
    "border-2 border-line/16 bg-surface-container px-3 py-2.5 text-sm text-ink outline-none ring-0 resize-y placeholder:text-ink/35 focus:border-primary focus:shadow-hard",
  mono:
    "border-2 border-line/16 bg-surface-container px-3 py-2.5 font-mono text-xs text-ink resize-y placeholder:text-ink/35 focus:border-primary focus:shadow-hard disabled:bg-fog"
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = "default", label, error, className = "", ...props }, ref) => {
    return (
      <label className="grid gap-2 text-sm font-semibold text-ink">
        {label ? <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-primary">{label}</span> : null}
        <textarea
          ref={ref}
          className={`${variantStyles[variant]} ${className}`}
          {...props}
        />
        {error ? <p className="text-xs text-coral">{error}</p> : null}
      </label>
    );
  }
);
Textarea.displayName = "Textarea";
