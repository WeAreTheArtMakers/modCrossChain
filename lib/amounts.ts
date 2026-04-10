import { parseUnits } from "viem";

export function parseAmountToUnits(amount: string, decimals: number) {
  const normalized = amount.trim();
  if (!normalized) return undefined;

  try {
    return parseUnits(normalized, decimals);
  } catch {
    return undefined;
  }
}
