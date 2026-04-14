const INTEGRATOR_PATTERN = /[^a-zA-Z0-9._-]/g;

export const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() || "development") as
  | "development"
  | "production";
export const IS_PRODUCTION_APP = APP_ENV === "production";

export const LIFI_INTEGRATOR = (
  process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || "modcrosschain"
)
  .replace(INTEGRATOR_PATTERN, "")
  .slice(0, 23);

export const DEFAULT_SLIPPAGE = clampSlippage(
  Number(process.env.NEXT_PUBLIC_DEFAULT_SLIPPAGE ?? "0.005"),
);

export const OPTIONAL_LIFI_FEE = parseOptionalFee(process.env.NEXT_PUBLIC_LIFI_FEE);
export const MIN_PLATFORM_FEE_NOTICE_USD = clampUsdFloor(
  Number(process.env.NEXT_PUBLIC_MIN_PLATFORM_FEE_NOTICE_USD ?? "0.5"),
);
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
export const SENTRY_TRACES_SAMPLE_RATE = clampSampleRate(
  Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.15"),
);

export const RPC_ENDPOINTS = {
  arbitrum: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL?.trim() || undefined,
  avalanche: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL?.trim() || undefined,
  base: process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() || undefined,
  bnb: process.env.NEXT_PUBLIC_BNB_RPC_URL?.trim() || undefined,
  ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL?.trim() || undefined,
  polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL?.trim() || undefined,
} as const;

const defaultRpcThresholds = IS_PRODUCTION_APP
  ? {
      blockMs: 1400,
      slowMs: 700,
      timeoutMs: 2200,
    }
  : {
      blockMs: 1800,
      slowMs: 900,
      timeoutMs: 2500,
    };

export const RPC_HEALTH_TIMEOUT_MS = clampMilliseconds(
  Number(process.env.NEXT_PUBLIC_RPC_HEALTH_TIMEOUT_MS ?? String(defaultRpcThresholds.timeoutMs)),
  800,
  10_000,
  defaultRpcThresholds.timeoutMs,
);
export const RPC_HEALTH_SLOW_THRESHOLD_MS = clampMilliseconds(
  Number(process.env.NEXT_PUBLIC_RPC_HEALTH_SLOW_THRESHOLD_MS ?? String(defaultRpcThresholds.slowMs)),
  200,
  5_000,
  defaultRpcThresholds.slowMs,
);
export const RPC_HEALTH_BLOCK_THRESHOLD_MS = clampMilliseconds(
  Number(process.env.NEXT_PUBLIC_RPC_HEALTH_BLOCK_THRESHOLD_MS ?? String(defaultRpcThresholds.blockMs)),
  RPC_HEALTH_SLOW_THRESHOLD_MS + 100,
  8_000,
  defaultRpcThresholds.blockMs,
);

export const HAS_DEDICATED_RPC_COVERAGE = Object.values(RPC_ENDPOINTS).every(Boolean);

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

function clampUsdFloor(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0.5;
  return Math.min(value, 100);
}

function clampSampleRate(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0.15;
  }

  return Math.min(value, 1);
}

function clampMilliseconds(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(value), min), max);
}
