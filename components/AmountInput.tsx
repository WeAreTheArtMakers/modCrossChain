"use client";

type AmountInputProps = {
  amount: string;
  symbol?: string;
  onAmountChange: (amount: string) => void;
};

export function AmountInput({ amount, symbol, onAmountChange }: AmountInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        Amount
      </span>
      <div className="flex min-h-16 items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 transition focus-within:border-[#ba9eff]/70">
        <input
          value={amount}
          onChange={(event) => onAmountChange(sanitizeAmount(event.target.value))}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-zinc-700"
        />
        <span className="shrink-0 text-sm font-medium text-zinc-400">{symbol ?? "TOKEN"}</span>
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
