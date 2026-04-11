"use client";

import { useEffect, useRef, useState } from "react";
import { SUPPORTED_CHAINS } from "@/lib/chains";

type ChainSelectProps = {
  label: string;
  value: number;
  onChange: (chainId: number) => void;
};

export function ChainSelect({ label, value, onChange }: ChainSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedChain = SUPPORTED_CHAINS.find((chain) => chain.id === value);

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
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="brand-border-hover flex h-14 w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-left outline-none"
      >
        <span className="truncate text-[15px] font-semibold text-zinc-100 sm:text-base">{selectedChain?.name}</span>
        <span className="text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#0d1012]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="max-h-72 overflow-y-auto pr-1">
            {SUPPORTED_CHAINS.map((chain) => {
              const selected = chain.id === value;

              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => {
                    onChange(chain.id);
                    setOpen(false);
                  }}
                  className={`flex min-h-12 w-full items-center rounded-xl px-3 text-left transition ${
                    selected
                      ? "brand-primary-button"
                      : "brand-border-hover border border-transparent text-zinc-200 hover:border-white/10 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`text-[15px] font-semibold sm:text-base ${selected ? "text-[#080a09]" : ""}`}>
                    {chain.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
