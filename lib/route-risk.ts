import type { Route } from "@lifi/sdk";
import { getRouteBridgeFeeUsd, getRouteDuration } from "@/lib/format";
import type { RouteRiskLevel, TransactionHistoryWarningCode } from "@/types/bridge";

export type RouteRiskWarning = {
  code: TransactionHistoryWarningCode;
  level: RouteRiskLevel;
  title: string;
  detail: string;
};

export type RouteRiskSummary = {
  feeShare: number;
  level: RouteRiskLevel;
  liquidityGap: number;
  warnings: RouteRiskWarning[];
};

export function analyzeRouteRisk(route: Route): RouteRiskSummary {
  const fromAmountUsd = Number(route.fromAmountUSD || 0);
  const routeFeesUsd = getRouteBridgeFeeUsd(route) + Number(route.gasCostUSD || 0);
  const feeShare = fromAmountUsd > 0 ? routeFeesUsd / fromAmountUsd : 0;
  const duration = getRouteDuration(route);
  const liquidityGap = getLiquidityGap(route);
  const warnings: RouteRiskWarning[] = [];

  if (liquidityGap >= 0.02) {
    warnings.push({
      code: "LOW_LIQUIDITY",
      detail: "Minimum received drops materially below the quoted output. Liquidity is thin or slippage pressure is elevated.",
      level: "HIGH",
      title: "Low liquidity buffer",
    });
  } else if (liquidityGap >= 0.008) {
    warnings.push({
      code: "LOW_LIQUIDITY",
      detail: "Minimum received sits below the live quote by more than a routine buffer.",
      level: "MEDIUM",
      title: "Liquidity spread is wider",
    });
  }

  if (feeShare >= 0.05) {
    warnings.push({
      code: "FEE_BURDEN",
      detail: "Gas and bridge costs consume more than 5% of the transfer value.",
      level: "HIGH",
      title: "Fee burden is heavy",
    });
  } else if (feeShare >= 0.02) {
    warnings.push({
      code: "FEE_BURDEN",
      detail: "Gas and bridge costs are high relative to the transfer value.",
      level: "MEDIUM",
      title: "Fee burden is elevated",
    });
  }

  if (duration >= 3600) {
    warnings.push({
      code: "LONG_DURATION",
      detail: "The current route can take more than an hour to settle. Expect longer status uncertainty.",
      level: "HIGH",
      title: "Settlement may be slow",
    });
  } else if (duration >= 1200) {
    warnings.push({
      code: "LONG_DURATION",
      detail: "The route is slower than a typical bridge transfer.",
      level: "MEDIUM",
      title: "Long execution window",
    });
  }

  if (route.steps.length >= 3) {
    warnings.push({
      code: "MULTI_STEP",
      detail: "This quote chains together multiple steps. More hops raise execution complexity.",
      level: route.steps.length >= 4 ? "HIGH" : "MEDIUM",
      title: "Fragmented route",
    });
  }

  if (route.containsSwitchChain) {
    warnings.push({
      code: "NETWORK_SWITCH",
      detail: "The wallet may ask for an additional chain switch before or during execution.",
      level: "LOW",
      title: "Extra wallet prompt expected",
    });
  }

  return {
    feeShare,
    level: getRiskLevel(warnings),
    liquidityGap,
    warnings,
  };
}

function getLiquidityGap(route: Route) {
  try {
    const quote = BigInt(route.toAmount);
    const minimum = BigInt(route.toAmountMin);

    if (quote <= 0n || minimum <= 0n || minimum >= quote) {
      return 0;
    }

    return Number(((quote - minimum) * 10_000n) / quote) / 10_000;
  } catch {
    return 0;
  }
}

function getRiskLevel(warnings: RouteRiskWarning[]): RouteRiskLevel {
  if (warnings.some((warning) => warning.level === "HIGH")) {
    return "HIGH";
  }

  if (warnings.some((warning) => warning.level === "MEDIUM")) {
    return "MEDIUM";
  }

  return "LOW";
}
