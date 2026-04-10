import type { Route } from "@lifi/sdk";
import { formatUnits, parseUnits } from "viem";

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function parseTokenAmount(amount: string, decimals: number) {
  try {
    if (!amount.trim()) return undefined;
    return parseUnits(amount, decimals);
  } catch {
    return undefined;
  }
}

export function formatTokenAmount(amount: string, decimals: number) {
  try {
    const value = Number(formatUnits(BigInt(amount), decimals));
    if (!Number.isFinite(value)) return "0";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: value >= 1 ? 4 : 8,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return "0";
  }
}

export function formatUsd(value?: string | number) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: parsed >= 1 ? 2 : 4,
  }).format(parsed);
}

export function formatPercent(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value) || value <= 0) return "0%";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits,
    minimumFractionDigits: value < 0.01 ? 2 : 0,
  }).format(value);
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "Under 1 min";
  if (seconds < 60) return `${Math.ceil(seconds)} sec`;

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

export function getRouteDuration(route: Route) {
  return route.steps.reduce((total, step) => total + (step.estimate?.executionDuration ?? 0), 0);
}

export function getRouteBridgeFeeUsd(route: Route) {
  return route.steps.reduce((total, step) => {
    const stepFees = step.estimate?.feeCosts?.reduce((sum, fee) => sum + Number(fee.amountUSD || 0), 0) ?? 0;
    return total + stepFees;
  }, 0);
}

export function getPlatformFeeUsd(route: Route, fee?: number) {
  if (!fee) return 0;
  return Number(route.fromAmountUSD || 0) * fee;
}

export function getNetRouteValueUsd(route: Route) {
  return Number(route.toAmountUSD || 0) - Number(route.gasCostUSD || 0) - getRouteBridgeFeeUsd(route);
}

export function getRoutePreview(route: Route) {
  const tools = route.steps
    .flatMap((step) => step.includedSteps?.map((includedStep) => includedStep.toolDetails?.name) ?? step.toolDetails?.name)
    .filter(Boolean);

  return Array.from(new Set(tools)).slice(0, 3).join(" → ") || "LI.FI route";
}
