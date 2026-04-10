"use client";

import { SUPPORTED_CHAINS } from "@/lib/chains";

type ChainSelectProps = {
  label: string;
  value: number;
  onChange: (chainId: number) => void;
};

export function ChainSelect({ label, value, onChange }: ChainSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[52px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm font-medium text-zinc-100 outline-none transition focus:border-[#ba9eff]/70"
      >
        {SUPPORTED_CHAINS.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
    </label>
  );
}
