"use client";

import type { Token } from "@lifi/sdk";
import { useEffect, useRef, useState } from "react";
import { TokenLogo } from "@/components/TokenLogo";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTokens } from "@/hooks/useTokens";
import { getChainName } from "@/lib/chains";

type TokenSelectorProps = {
  chainId: number;
  selectedToken?: Token;
  onSelect: (token: Token | undefined) => void;
};

export function TokenSelector({ chainId, selectedToken, onSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tokenQuery = useTokens(chainId, debouncedSearch);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        Token
      </span>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="brand-border-hover flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-left outline-none"
      >
        {selectedToken ? (
          <span className="flex min-w-0 items-center gap-3">
            <TokenLogo logoURI={selectedToken.logoURI} symbol={selectedToken.symbol} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{selectedToken.symbol}</span>
              <span className="block truncate text-xs text-zinc-500">{selectedToken.name}</span>
            </span>
          </span>
        ) : (
          <span className="text-sm text-zinc-500">Select token on {getChainName(chainId)}</span>
        )}
        <span className="text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-800 bg-[#0d100f] p-2 shadow-2xl shadow-black/60">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoFocus
            placeholder="Search token"
            className="brand-border-hover mb-2 h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[rgb(var(--brand-accent-rgb)/0.7)]"
          />

          <div className="max-h-72 overflow-y-auto pr-1">
            {tokenQuery.isLoading ? (
              <div className="space-y-2 p-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-11 animate-pulse rounded-md bg-zinc-900" />
                ))}
              </div>
            ) : null}

            {tokenQuery.error ? (
              <p className="rounded-md bg-red-400/10 px-3 py-2 text-sm text-red-100">
                Could not load tokens. Try another search.
              </p>
            ) : null}

            {!tokenQuery.isLoading && tokenQuery.data?.length === 0 ? (
              <p className="rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-500">
                No supported tokens found.
              </p>
            ) : null}

            {tokenQuery.data?.map((token) => (
              <button
                key={`${token.chainId}-${token.address}`}
                type="button"
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-left transition hover:bg-zinc-900"
              >
                <TokenLogo logoURI={token.logoURI} symbol={token.symbol} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{token.symbol}</span>
                  <span className="block truncate text-xs text-zinc-500">{token.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
