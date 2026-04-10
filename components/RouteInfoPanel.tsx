"use client";

import type { Route, Token } from "@lifi/sdk";
import {
  formatDuration,
  formatTokenAmount,
  formatUsd,
  getRouteBridgeFeeUsd,
  getRouteDuration,
  getRoutePreview,
} from "@/lib/format";

type RouteInfoPanelProps = {
  destinationToken?: Token;
  error?: string;
  isLoading: boolean;
  route?: Route;
};

export function RouteInfoPanel({ destinationToken, error, isLoading, route }: RouteInfoPanelProps) {
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

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
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

      <dl className="grid grid-cols-3 gap-2 text-sm">
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
      </dl>

      {route.containsSwitchChain ? (
        <p className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
          This route may require an additional network switch. Review every wallet prompt before signing.
        </p>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Quotes can change before execution. Slippage protection is applied when the route is requested.
        </p>
      )}
    </div>
  );
}
