import { forwardRef, type InputHTMLAttributes } from "react";

type InputVariant = "default" | "portal" | "tool" | "schedule";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
};

const variantStyles: Record<InputVariant, string> = {
  default:
    "border-2 border-white/16 bg-surface-container px-3 py-2.5 text-sm text-ink outline-none ring-0 placeholder:text-white/35 focus:border-primary focus:shadow-hard",
  portal:
    "border-2 border-white/16 bg-surface-container px-3 py-3 text-sm text-ink outline-none placeholder:text-white/35 focus:border-primary focus:shadow-hard",
  tool:
    "border-2 border-white/16 bg-surface-container px-3 py-2.5 text-sm text-ink outline-none placeholder:text-white/35 focus:border-primary focus:shadow-hard",
  schedule:
    "border-2 border-white/16 bg-surface-container px-3 py-2.5 text-base text-ink outline-none ring-0 placeholder:text-white/35 focus:border-primary focus:shadow-hard sm:text-sm"
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", label, error, helperText, className = "", ...props }, ref) => {
    return (
      <label className="grid gap-2 text-sm font-semibold text-ink">
        {label ? <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-primary">{label}</span> : null}
        <input
          ref={ref}
          className={`${variantStyles[variant]} disabled:cursor-not-allowed disabled:bg-fog disabled:text-white/40 ${className}`}
          {...props}
        />
        {error ? <p className="text-xs text-coral">{error}</p> : null}
        {helperText && !error ? <p className="text-xs text-white/55">{helperText}</p> : null}
      </label>
    );
  }
);
Input.displayName = "Input";
