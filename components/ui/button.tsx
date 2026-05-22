import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "cancel"
  | "link"
  | "danger"
  | "teal"
  | "blue"
  | "amber"
  | "green"
  | "purple"
  | "slate"
  | "dark-red";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asLink?: { href: string } & Record<string, unknown>;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-2 border-black bg-primary text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  secondary:
    "border-2 border-white/80 bg-transparent text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-x-1 active:translate-y-1 active:shadow-none",
  ghost:
    "border border-white/18 bg-mist text-ink hover:border-primary hover:text-primary",
  cancel:
    "border border-white/18 bg-transparent text-white/78 hover:border-white/40 hover:text-white",
  link:
    "border-0 bg-transparent px-0 text-primary underline-offset-4 hover:underline",
  danger:
    "border-2 border-black bg-coral text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  teal:
    "border-2 border-black bg-[#99f6e4] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  blue:
    "border-2 border-black bg-surface-base text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  amber:
    "border-2 border-black bg-growth-orange text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  green:
    "border-2 border-black bg-[#bef264] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  purple:
    "border-2 border-black bg-[#d8b4fe] text-black shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
  slate:
    "border-2 border-white/22 bg-fog text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-x-1 active:translate-y-1 active:shadow-none",
  "dark-red":
    "border-2 border-black bg-[#b91c1c] text-white shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 py-2 text-[0.62rem]",
  md: "min-h-11 px-4 py-2.5 text-xs",
  lg: "min-h-12 px-6 py-3 text-sm"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-mono font-semibold uppercase tracking-[0.16em] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60";
    const classes = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <button ref={ref} type="button" disabled={disabled} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
