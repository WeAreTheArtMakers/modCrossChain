"use client";

import { useState } from "react";

export function CopyValueButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/20 hover:text-white"
    >
      {copied ? "Copied" : "Copy key"}
    </button>
  );
}
