import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone =
  | "blue"
  | "green"
  | "amber"
  | "purple"
  | "teal"
  | "red"
  | "gray"
  | "info"
  | "success"
  | "warning"
  | "error";

type BadgeVariant = "solid" | "bordered" | "subtle";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  as?: "span" | "div";
};

const toneStyles: Record<BadgeTone, Record<BadgeVariant, string>> = {
  blue: {
    solid: "bg-[#d8ecff] text-[#134d7a]",
    bordered: "border border-[#1d4ed8]/40 bg-[#eff6ff] text-[#1d4ea5]",
    subtle: "border border-[#1d4ed8]/25 bg-[#eff6ff] text-[#134d7a]"
  },
  green: {
    solid: "bg-[#d5f4e2] text-[#0b6a40]",
    bordered: "border border-[#15803d]/30 bg-[#dcfce7] text-[#166534]",
    subtle: "border border-[#12b76a]/25 bg-[#edfcf2] text-[#027a48]"
  },
  amber: {
    solid: "bg-amber-100 text-amber-800",
    bordered: "border border-amber-700/30 bg-amber-200 text-amber-900",
    subtle: "border border-amber-600/25 bg-amber-50 text-amber-800"
  },
  purple: {
    solid: "bg-[#e9dbff] text-[#4f2b88]",
    bordered: "border border-[#7c3aed]/40 bg-[#f5f3ff] text-[#6d28d9]",
    subtle: "border border-[#7c3aed]/25 bg-[#f5f3ff] text-[#4f2b88]"
  },
  teal: {
    solid: "bg-[#def7f7] text-[#0f6a70]",
    bordered: "border border-[#0f766e]/40 bg-[#ecfdf5] text-[#0f766e]",
    subtle: "border border-[#0f766e]/25 bg-[#ecfdf5] text-[#0f766e]"
  },
  red: {
    solid: "bg-[#ffe2e2] text-[#892727]",
    bordered: "border border-[#b42318]/30 bg-[#fff1f1] text-[#b42318]",
    subtle: "border border-[#b42318]/25 bg-[#fff4f2] text-[#7a271a]"
  },
  gray: {
    solid: "bg-[#ececec] text-[#5f5f5f]",
    bordered: "border border-ink/30 bg-white text-ink/70",
    subtle: "border border-ink/15 bg-mist text-ink/65"
  },
  info: {
    solid: "bg-[#edf4ff] text-[#1d4ea5]",
    bordered: "border border-[#9db6e7]/40 bg-[#edf4ff] text-[#1d4ea5]",
    subtle: "border border-[#9db6e7]/25 bg-[#f5f8ff] text-[#1d4ea5]"
  },
  success: {
    solid: "bg-[#e9f9ec] text-[#1f5c28]",
    bordered: "border border-[#84b98d]/40 bg-[#e9f9ec] text-[#1f5c28]",
    subtle: "border border-[#12b76a]/25 bg-[#edfcf2] text-[#027a48]"
  },
  warning: {
    solid: "bg-amber-50 text-amber-800",
    bordered: "border border-amber-400/40 bg-amber-50 text-amber-800",
    subtle: "border border-amber-400/25 bg-amber-50 text-amber-800"
  },
  error: {
    solid: "bg-[#fff1f1] text-[#7a1f1f]",
    bordered: "border border-[#d88]/40 bg-[#fff1f1] text-[#7a1f1f]",
    subtle: "border border-[#d88]/25 bg-[#fff8f8] text-[#7a1f1f]"
  }
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[0.62rem]",
  md: "px-3 py-1 text-[0.68rem]"
};

export function Badge({
  tone = "gray",
  variant = "solid",
  size = "sm",
  as: Tag = "span",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const classes = `inline-flex rounded-full font-semibold uppercase tracking-[0.08em] ${toneStyles[tone][variant]} ${sizeStyles[size]} ${className}`;

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
