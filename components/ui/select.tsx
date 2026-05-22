import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: "default" | "portal" | "schedule";
  label?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
};

const variantStyles = {
  default:
    "border-2 border-line/16 bg-surface-container px-3 py-2.5 text-sm text-ink outline-none ring-0 focus:border-primary focus:shadow-hard",
  portal:
    "border-2 border-line/16 bg-surface-container px-3 py-3 text-sm text-ink outline-none focus:border-primary focus:shadow-hard",
  schedule:
    "border-2 border-line/16 bg-surface-container px-3 py-2.5 text-base text-ink outline-none ring-0 focus:border-primary focus:shadow-hard sm:text-sm"
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ variant = "default", label, placeholder, options, className = "", ...props }, ref) => {
    return (
      <label className="grid gap-2 text-sm font-semibold text-ink">
        {label ? <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-primary">{label}</span> : null}
        <select ref={ref} className={`${variantStyles[variant]} ${className}`} {...props}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
);
Select.displayName = "Select";
