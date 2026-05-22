import type { SVGAttributes } from "react";

type IconProps = SVGAttributes<SVGSVGElement> & {
  size?: number;
};

function IconBase({ children, size = 20, viewBox = "0 0 24 24", className = "", ...props }: IconProps & { viewBox?: string }) {
  return (
    <svg aria-hidden="true" viewBox={viewBox} className={`${className}`} style={{ width: size, height: size }} fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      {children}
    </svg>
  );
}

export function IconSearch({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3-3" />
    </IconBase>
  );
}

export function IconDocument({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </IconBase>
  );
}

export function IconCode({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="m8 7-4 5 4 5M16 7l4 5-4 5M13 5l-2 14" />
    </IconBase>
  );
}

export function IconCheck({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="m5 12 4 4 10-10" />
    </IconBase>
  );
}

export function IconBarChart({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M6 16V9M12 16V6M18 16v-4" />
      <path d="M4 18h16" />
    </IconBase>
  );
}

export function IconCart({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <rect x="3.5" y="7" width="17" height="10" rx="2" />
      <path d="M3.5 11h17" />
    </IconBase>
  );
}

export function IconLocation({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </IconBase>
  );
}

export function IconDollar({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v8M9.5 10.5c.3-1 1.1-1.5 2.5-1.5 1.5 0 2.5.7 2.5 1.8 0 1-1 1.5-2.5 1.8-1.3.3-2.3.7-2.3 1.8 0 1 .8 1.8 2.3 1.8 1.4 0 2.2-.6 2.5-1.6" />
    </IconBase>
  );
}

export function IconPackage({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M4 8h16v8H4z" />
      <path d="M8 12h8" />
    </IconBase>
  );
}

export function IconPen({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 2.4-8.4z" />
    </IconBase>
  );
}

export function IconActivity({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M6 19V5M10 19V9M14 19V12M18 19V7" />
    </IconBase>
  );
}

export function IconCircle({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="7" />
    </IconBase>
  );
}

export function IconPlus({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14M12 5v14" />
    </IconBase>
  );
}

export function IconShare({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="19" r="2.2" />
      <path d="M8 11l8-5M8 13l8 5" />
    </IconBase>
  );
}

export function IconArrowRight({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </IconBase>
  );
}

export function IconExternal({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </IconBase>
  );
}

export function IconCopy({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}

export function IconMail({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 8 10 6 10-6" />
    </IconBase>
  );
}

export function IconGlobe({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconBase>
  );
}

export function IconBell({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </IconBase>
  );
}

export function IconUpload({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </IconBase>
  );
}

export function IconDownload({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </IconBase>
  );
}

export function IconX({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
  );
}

export function IconMenu({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </IconBase>
  );
}

export function IconClock({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </IconBase>
  );
}

export function IconUser({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </IconBase>
  );
}

export function IconUsers({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function IconTrash({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </IconBase>
  );
}

export function IconSettings({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function IconFilter({ size }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </IconBase>
  );
}
