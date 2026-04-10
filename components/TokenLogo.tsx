"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type TokenLogoProps = {
  logoURI?: string;
  symbol: string;
};

export function TokenLogo({ logoURI, symbol }: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const fallback = symbol.slice(0, 2).toUpperCase();

  if (!logoURI || failed) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ba9eff] text-xs font-bold text-zinc-950">
        {fallback}
      </span>
    );
  }

  return (
    // Token logos are remote aggregator metadata; using img keeps the bundle small and avoids host config churn.
    <img
      alt={`${symbol} logo`}
      src={logoURI}
      onError={() => setFailed(true)}
      className="h-8 w-8 shrink-0 rounded-full bg-zinc-900"
    />
  );
}
