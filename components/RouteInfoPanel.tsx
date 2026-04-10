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
                    ? "border-[#ba9eff]/60 bg-[#ba9eff]/10"
                    : "border-zinc-800 bg-black/20 hover:border-zinc-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {getPreferenceLabel(preference)}
                </p>
                <p className="mt-2 text-sm font-medium text-zinc-100">
                  {option
                    ? `${formatTokenAmount(option.toAmount, option.toToken.decimals)} ${option.toToken.symbol}`
                    : "Unavailable"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {option ? `${formatDuration(getRouteDuration(option))} • ${formatUsd(getRouteBridgeFeeUsd(option))}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Best route</p>
          <p className="mt-1 text-sm font-semibold text-white">{getRoutePreview(route)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Receive</p>
          <p className="mt-1 text-sm font-semibold text-[#e4c6ff]">
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
