import type { HTMLAttributes } from "react";

type CardVariant = "primary" | "yellow" | "tagline" | "flat" | "blog";

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
  as?: "section" | "article" | "div" | "aside" | "header";
};

const variantStyles: Record<CardVariant, string> = {
  primary:
    "border-2 border-white/85 bg-mist shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg",
  yellow:
    "border-2 border-black bg-primary text-black shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg",
  tagline: "border-2 border-white/85 bg-mist/95 tagline-pop",
  flat: "border border-white/14 bg-surface-container",
  blog:
    "border-2 border-white/85 bg-mist shadow-hard transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg"
};

const paddingStyles: Record<string, string> = {
  sm: "p-4 sm:p-5",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8"
};

export function Card({
  variant = "primary",
  padding = "md",
  as: Tag = "section",
  className = "",
  children,
  ...props
}: CardProps) {
  const classes = `${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
