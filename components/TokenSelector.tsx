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
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
        Token
      </span>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="brand-border-hover flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-left outline-none"
      >
        {selectedToken ? (
          <span className="flex min-w-0 items-center gap-3">
            <TokenLogo logoURI={selectedToken.logoURI} symbol={selectedToken.symbol} />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-white sm:text-base">{selectedToken.symbol}</span>
              <span className="block truncate text-[13px] text-zinc-500 sm:text-sm">{selectedToken.name}</span>
            </span>
          </span>
        ) : (
          <span className="text-[15px] text-zinc-500 sm:text-base">Select token on {getChainName(chainId)}</span>
        )}
        <span className="text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-[18px] border border-white/10 bg-[#0d1012]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoFocus
            placeholder="Search token"
            className="brand-border-hover mb-2 h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-[rgb(var(--brand-accent-rgb)/0.7)] sm:text-base"
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
                className="flex min-h-13 w-full items-center gap-3 rounded-xl px-3 text-left transition hover:bg-zinc-900"
              >
                <TokenLogo logoURI={token.logoURI} symbol={token.symbol} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-white sm:text-base">{token.symbol}</span>
                  <span className="block truncate text-[13px] text-zinc-500 sm:text-sm">{token.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
