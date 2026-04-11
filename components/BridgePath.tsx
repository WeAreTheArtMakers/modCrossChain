"use client";

import { getChainName } from "@/lib/chains";

type BridgePathProps = {
  fromChainId: number;
  toChainId: number;
  active?: boolean;
};

export function BridgePath({ active, fromChainId, toChainId }: BridgePathProps) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#131315] px-3 py-3.5">
      <div className="flex items-center gap-3">
        <ChainPill label={getChainName(fromChainId)} />
        <div className="relative h-px flex-1 border-t border-dashed border-zinc-700">
          <span
            className={[
              "absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--brand-accent-rgb))]",
              active ? "shadow-[0_0_18px_rgba(186,158,255,0.65)]" : "opacity-45",
            ].join(" ")}
          />
        </div>
        <ChainPill label={getChainName(toChainId)} />
      </div>
    </div>
  );
}

function ChainPill({ label }: { label: string }) {
  return (
    <span className="min-w-0 rounded-md bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-100 sm:text-xs">
      {label}
    </span>
  );
}
