"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  className?: string;
  label?: string;
};

export function CopyButton({ text, className, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={
        className ||
        "rounded-full border border-ink/40 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-fog"
      }
    >
      {copied ? "Copied" : label}
    </button>
  );
}
