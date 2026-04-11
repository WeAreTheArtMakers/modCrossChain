import "server-only";

import {
  createConfig as createLifiConfig,
  getRoutes,
  getToken,
  getTokens,
  type Route,
  type RouteOptions,
  type Token,
} from "@lifi/sdk";
import { parseAmountToUnits } from "@/lib/amounts";
import { DEFAULT_SLIPPAGE, LIFI_INTEGRATOR, OPTIONAL_LIFI_FEE } from "@/lib/env";
import { getNetRouteValueUsd, getRouteDuration } from "@/lib/format";
import { LIFI_API_KEY } from "@/lib/server-env";
import type { PlatformFeeInfo, RoutePreference } from "@/types/bridge";

type LifiServerGlobal = typeof globalThis & {
  __modCrossChainServerLifiConfigured?: boolean;
};

type BestRouteInput = {
  address: `0x${string}`;
  amount: string;
  fromChainId: number;
  fromToken: Token;
  order: RoutePreference;
  signal?: AbortSignal;
  slippage: number;
  toChainId: number;
};

type RouteComparisons = Record<RoutePreference, Route | undefined>;

export async function getServerSourceTokens(chainId: number, search: string, signal?: AbortSignal) {
  configureServerLifi();

  const response = await getTokens(
    {
      chains: [chainId],
      extended: true,
      limit: search ? 40 : 80,
      orderBy: "marketCapUSD",
      search: search || undefined,
    },
    { signal },
  );

  return response.tokens[chainId] ?? [];
}

export async function getServerBestRoute(input: BestRouteInput) {
  configureServerLifi();

  const fromAmount = parseAmountToUnits(input.amount, input.fromToken.decimals);
  if (!fromAmount || fromAmount <= 0n) {
    throw new Error("Enter an amount greater than zero.");
  }

  const destinationToken = await resolveDestinationToken(input.fromToken, input.toChainId, input.signal);

  const baseRouteOptions: RouteOptions = {
    allowSwitchChain: true,
    integrator: LIFI_INTEGRATOR,
    maxPriceImpact: 0.3,
    order: toLifiOrder(input.order),
    slippage: input.slippage,
  };

  const requestPayload = {
    fromAddress: input.address,
    fromAmount: fromAmount.toString(),
    fromChainId: input.fromChainId,
    fromTokenAddress: input.fromToken.address,
    toAddress: input.address,
    toChainId: input.toChainId,
    toTokenAddress: destinationToken.address,
  };

  const { platformFee, response } = await getRoutesWithFeeFallback({
    requestPayload,
    routeOptions: baseRouteOptions,
    signal: input.signal,
  });

  const routes = response.routes ?? [];
  if (!routes.length) {
    const reason =
      response.unavailableRoutes?.filteredOut?.[0]?.reason ??
      response.unavailableRoutes?.failed?.[0]?.subpaths?.[0]?.[0]?.message ??
      "No route found for this token, amount, and chain pair.";
    throw new Error(reason);
  }

  const comparisons = getRouteComparisons(routes);

  return {
    bestRoute: comparisons[input.order] ?? comparisons.CHEAPEST ?? routes[0],
    comparisons,
    destinationToken,
    platformFee,
    routes,
  };
}

function configureServerLifi() {
  const globalForLifi = globalThis as LifiServerGlobal;
  if (globalForLifi.__modCrossChainServerLifiConfigured) {
    return;
  }

  createLifiConfig({
    apiKey: LIFI_API_KEY,
    integrator: LIFI_INTEGRATOR,
    routeOptions: {
      allowSwitchChain: true,
      maxPriceImpact: 0.3,
      order: "CHEAPEST",
      slippage: DEFAULT_SLIPPAGE,
    },
  });

  globalForLifi.__modCrossChainServerLifiConfigured = true;
}

async function resolveDestinationToken(fromToken: Token, toChainId: number, signal?: AbortSignal) {
  const lookupKeys = [fromToken.coinKey, fromToken.symbol].filter(Boolean) as string[];

  for (const lookupKey of lookupKeys) {
    try {
      const token = await getToken(toChainId, lookupKey, { signal });
      if (token?.address && token.symbol.toLowerCase() === fromToken.symbol.toLowerCase()) {
        return token;
      }
    } catch {
      // Fall back to token search below when LI.FI cannot resolve a symbol directly.
    }
  }

  const response = await getTokens(
    {
      chains: [toChainId],
      extended: true,
      limit: 25,
      search: fromToken.symbol,
    },
    { signal },
  );

  const destinationToken = response.tokens[toChainId]?.find(
    (token) => token.symbol.toLowerCase() === fromToken.symbol.toLowerCase(),
  );

  if (!destinationToken) {
    throw new Error(`${fromToken.symbol} is not supported on the destination chain.`);
  }

  return destinationToken;
}

function getRouteComparisons(routes: Route[]): RouteComparisons {
  return {
    BEST_RECEIVED: [...routes].sort((left, right) => Number(right.toAmountUSD) - Number(left.toAmountUSD))[0],
    CHEAPEST: [...routes].sort((left, right) => getNetRouteValueUsd(right) - getNetRouteValueUsd(left))[0],
    FASTEST: [...routes].sort((left, right) => getRouteDuration(left) - getRouteDuration(right))[0],
  };
}

function toLifiOrder(order: RoutePreference): RouteOptions["order"] {
  if (order === "FASTEST") {
    return "FASTEST";
  }

  return "CHEAPEST";
}

async function getRoutesWithFeeFallback({
  requestPayload,
  routeOptions,
  signal,
}: {
  requestPayload: {
    fromAddress: `0x${string}`;
    fromAmount: string;
    fromChainId: number;
    fromTokenAddress: string;
    toAddress: `0x${string}`;
    toChainId: number;
    toTokenAddress: string;
  };
  routeOptions: RouteOptions;
  signal?: AbortSignal;
}) {
  if (!OPTIONAL_LIFI_FEE) {
    const response = await getRoutes(
      {
        ...requestPayload,
        options: routeOptions,
      },
      { signal },
    );

    return {
      platformFee: {
        status: "NOT_CONFIGURED",
      } satisfies PlatformFeeInfo,
      response,
    };
  }

  try {
    const response = await getRoutes(
      {
        ...requestPayload,
        options: {
          ...routeOptions,
          fee: OPTIONAL_LIFI_FEE,
        },
      },
      { signal },
    );

    return {
      platformFee: {
        appliedRate: OPTIONAL_LIFI_FEE,
        requestedRate: OPTIONAL_LIFI_FEE,
        status: "ACTIVE",
      } satisfies PlatformFeeInfo,
      response,
    };
  } catch (error) {
    if (!shouldDisableIntegratorFee(error)) {
      throw error;
    }

    const response = await getRoutes(
      {
        ...requestPayload,
        options: routeOptions,
      },
      { signal },
    );

    return {
      platformFee: {
        message: `Integrator fee is configured in env, but LI.FI still rejected fee collection for "${LIFI_INTEGRATOR}". Verify the exact integrator slug and fee wallet activation in the LI.FI portal.`,
        requestedRate: OPTIONAL_LIFI_FEE,
        status: "DISABLED_UNCONFIGURED",
      } satisfies PlatformFeeInfo,
      response,
    };
  }
}

function shouldDisableIntegratorFee(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("not configured for collecting fees") ||
    message.includes("configure your fee wallet") ||
    message.includes("integrator")
  );
}
