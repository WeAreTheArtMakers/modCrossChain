"use client";

type AmountInputProps = {
  amount: string;
  symbol?: string;
  onAmountChange: (amount: string) => void;
};

export function AmountInput({ amount, symbol, onAmountChange }: AmountInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
        Amount
      </span>
      <div className="brand-border-hover flex min-h-[72px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 focus-within:border-[rgb(var(--brand-accent-rgb)/0.7)]">
        <input
          value={amount}
          onChange={(event) => onAmountChange(sanitizeAmount(event.target.value))}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full bg-transparent text-[2rem] font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-[2.2rem]"
        />
        <span className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.1em] text-zinc-400 sm:text-sm">
          {symbol ?? "TOKEN"}
        </span>
      </div>
    </label>
  );
}

function sanitizeAmount(value: string) {
  const normalized = value.replace(",", ".");
  if (!/^\d*\.?\d*$/.test(normalized)) {
    return "";
  }
  return normalized;
}
