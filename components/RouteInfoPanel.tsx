"use client";

import Link from "next/link";
import type { Route, Token } from "@lifi/sdk";
import {
  formatDuration,
  formatPercent,
  formatTokenAmount,
  formatUsd,
  getRouteBridgeFeeUsd,
  getRouteDuration,
  getPlatformFeeUsd,
  getRoutePreview,
} from "@/lib/format";
import { MIN_PLATFORM_FEE_NOTICE_USD, OPTIONAL_LIFI_FEE } from "@/lib/env";
import { analyzeRouteRisk } from "@/lib/route-risk";
import type { RoutePreference } from "@/types/bridge";

type RouteInfoPanelProps = {
  comparisons?: Partial<Record<RoutePreference, Route | undefined>>;
  destinationToken?: Token;
  error?: string;
  isLoading: boolean;
  onSelectPreference: (routePreference: RoutePreference) => void;
  routePreference: RoutePreference;
  route?: Route;
};

const COMPARISON_ORDER: RoutePreference[] = ["CHEAPEST", "FASTEST", "BEST_RECEIVED"];

export function RouteInfoPanel({
  comparisons,
  destinationToken,
  error,
  isLoading,
  onSelectPreference,
  route,
  routePreference,
}: RouteInfoPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
        <div className="mb-4 h-4 w-28 animate-pulse rounded bg-zinc-800" />
        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
        {error}
      </div>
    );
  }

  if (!route) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-500">
        Enter an amount to quote a route.
      </div>
    );
  }

  const platformFeeUsd = route ? getPlatformFeeUsd(route, OPTIONAL_LIFI_FEE) : 0;
  const feeFallsBelowMinimumNotice =
    OPTIONAL_LIFI_FEE && platformFeeUsd > 0 && platformFeeUsd < MIN_PLATFORM_FEE_NOTICE_USD;
  const routeRisk = analyzeRouteRisk(route);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
      {comparisons ? (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {COMPARISON_ORDER.map((preference) => {
            const option = comparisons[preference];

            return (
              <button
                key={preference}
                type="button"
                onClick={() => option && onSelectPreference(preference)}
                disabled={!option}
                className={`rounded-lg border p-3 text-left transition ${
                  routePreference === preference
                    ? "bg-[rgb(var(--brand-accent-rgb)/0.10)]"
                    : "border-zinc-800 bg-black/20 hover:border-zinc-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                style={
                  routePreference === preference
                    ? {
                        borderColor: "rgb(var(--brand-accent-rgb) / 0.6)",
                      }
                    : undefined
                }
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {getPreferenceLabel(preference)}
                </p>
                <p className="mt-2 text-[15px] font-semibold text-zinc-100">
                  {option
                    ? `${formatTokenAmount(option.toAmount, option.toToken.decimals)} ${option.toToken.symbol}`
                    : "Unavailable"}
                </p>
                <p className="mt-1 text-[13px] text-zinc-500">
                  {option ? `${formatDuration(getRouteDuration(option))} • ${formatUsd(getRouteBridgeFeeUsd(option))}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Best route</p>
          <p className="mt-1 text-[15px] font-semibold text-white">{getRoutePreview(route)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-zinc-500">Receive</p>
          <p className="mt-1 text-[15px] font-semibold text-[rgb(var(--brand-accent-rgb))]">
            {formatTokenAmount(route.toAmount, route.toToken.decimals)} {destinationToken?.symbol ?? route.toToken.symbol}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div className="rounded-md border border-zinc-800 bg-black/20 p-3">
          <dt className="text-xs text-zinc-500">Gas</dt>
          <dd className="mt-1 font-medium text-zinc-100">{formatUsd(route.gasCostUSD)}</dd>
        </div>
        <div className="rounded-md border border-zinc-800 bg-black/20 p-3">
          <dt className="text-xs text-zinc-500">Bridge fee</dt>
          <dd className="mt-1 font-medium text-zinc-100">{formatUsd(getRouteBridgeFeeUsd(route))}</dd>
        </div>
        <div className="rounded-md border border-zinc-800 bg-black/20 p-3">
          <dt className="text-xs text-zinc-500">Time</dt>
          <dd className="mt-1 font-medium text-zinc-100">{formatDuration(getRouteDuration(route))}</dd>
        </div>
        <div className="rounded-md border border-zinc-800 bg-black/20 p-3">
          <dt className="text-xs text-zinc-500">Platform fee</dt>
          <dd className="mt-1 font-medium text-zinc-100">
            {OPTIONAL_LIFI_FEE ? `${formatUsd(platformFeeUsd)} (${formatPercent(OPTIONAL_LIFI_FEE)})` : "Not set"}
          </dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg border border-zinc-800 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Route risk</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {routeRisk.level === "LOW" ? "Standard execution" : routeRisk.level === "MEDIUM" ? "Review before signing" : "Elevated attention required"}
            </p>
          </div>
          <span className={getRiskBadgeClass(routeRisk.level)}>{routeRisk.level}</span>
        </div>

        {routeRisk.warnings.length ? (
          <div className="mt-3 space-y-2">
            {routeRisk.warnings.map((warning) => (
              <div key={warning.code} className="rounded-md border border-white/6 bg-white/[0.02] px-3 py-2">
                <p className="text-sm font-medium text-zinc-100">{warning.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{warning.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-zinc-400">
            Minimum received is close to the live quote, the fee share stays controlled, and execution path complexity is limited.
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 text-xs leading-5">
        <p className="rounded-md border border-zinc-800 bg-black/20 px-3 py-2 text-zinc-400">
          {OPTIONAL_LIFI_FEE
            ? `The live quote includes a visible LI.FI integrator fee.`
            : `No platform fee is configured in this environment yet.`}{" "}
          Small transfers below the ${MIN_PLATFORM_FEE_NOTICE_USD.toFixed(2)} target minimum are disclosed, not
          topped up through custody.
        </p>

        {feeFallsBelowMinimumNotice ? (
          <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-amber-100">
            This quote falls below the small-transfer fee target. The app still preserves a non-custodial flow and
            does not add a separate fixed surcharge.
          </p>
        ) : null}

        {routeRisk.liquidityGap >= 0.008 ? (
          <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-amber-100">
            Low-liquidity buffer detected. Minimum received is {formatPercent(routeRisk.liquidityGap, 2)} below the
            current quote.
          </p>
        ) : null}

        {route.containsSwitchChain ? (
          <p className="rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-amber-100">
            This route may require an additional network switch. Review every wallet prompt before signing.
          </p>
        ) : (
          <p className="px-1 text-zinc-500">
            Quotes can change before execution. Slippage protection is applied when the route is requested.
          </p>
        )}

        <p className="px-1 text-zinc-500">
          By using this interface you agree to the{" "}
          <Link href="/terms" className="text-zinc-300 transition hover:text-white">
            Terms
          </Link>{" "}
          and confirm access from a supported jurisdiction described{" "}
          <Link href="/jurisdictions" className="text-zinc-300 transition hover:text-white">
            here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function getPreferenceLabel(preference: RoutePreference) {
  switch (preference) {
    case "BEST_RECEIVED":
      return "Best received";
    case "FASTEST":
      return "Fastest";
    default:
      return "Cheapest";
  }
}

function getRiskBadgeClass(level: "LOW" | "MEDIUM" | "HIGH") {
  const base = "rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
  if (level === "HIGH") {
    return `${base} bg-red-400/15 text-red-200`;
  }

  if (level === "MEDIUM") {
    return `${base} bg-amber-400/15 text-amber-100`;
  }

  return `${base} bg-emerald-400/15 text-emerald-100`;
}
