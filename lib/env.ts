const INTEGRATOR_PATTERN = /[^a-zA-Z0-9._-]/g;

export const LIFI_INTEGRATOR = (
  process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || "modCrossChain"
)
  .replace(INTEGRATOR_PATTERN, "")
  .slice(0, 23);

export const LIFI_API_KEY = process.env.NEXT_PUBLIC_LIFI_API_KEY || undefined;

export const DEFAULT_SLIPPAGE = clampSlippage(
  Number(process.env.NEXT_PUBLIC_DEFAULT_SLIPPAGE ?? "0.005"),
);

export const OPTIONAL_LIFI_FEE = parseOptionalFee(process.env.NEXT_PUBLIC_LIFI_FEE);

function clampSlippage(value: number) {
  if (!Number.isFinite(value)) return 0.005;
  return Math.min(Math.max(value, 0.001), 0.05);
}

function parseOptionalFee(rawValue?: string) {
  if (!rawValue) return undefined;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed <= 0 || parsed >= 0.1) return undefined;

  return parsed;
}
