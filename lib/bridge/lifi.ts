import {
  createConfig as createLifiConfig,
  EVM,
  executeRoute,
  getRoutes,
  getToken,
  getTokens,
  type ExecutionOptions,
  type Route,
  type RouteExtended,
  type RouteOptions,
  type Token,
} from "@lifi/sdk";
import { getWalletClient, switchChain } from "wagmi/actions";
import { parseAmountToUnits } from "@/lib/amounts";
import { DEFAULT_SLIPPAGE, LIFI_API_KEY, LIFI_INTEGRATOR, OPTIONAL_LIFI_FEE } from "@/lib/env";
import { getNetRouteValueUsd } from "@/lib/format";
import { wagmiConfig } from "@/lib/wagmi";
import type { RoutePreference } from "@/types/bridge";

type SupportedWagmiChainId = (typeof wagmiConfig.chains)[number]["id"];

type LifiGlobal = typeof globalThis & {
  __modCrossChainLifiConfigured?: boolean;
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

export function configureLifi() {
  const globalForLifi = globalThis as LifiGlobal;
  if (globalForLifi.__modCrossChainLifiConfigured) {
    return;
  }

  createLifiConfig({
    integrator: LIFI_INTEGRATOR,
    apiKey: LIFI_API_KEY,
    routeOptions: {
      allowSwitchChain: true,
      maxPriceImpact: 0.3,
      order: "CHEAPEST",
      slippage: DEFAULT_SLIPPAGE,
    },
    providers: [
      EVM({
        getWalletClient: () => getWalletClient(wagmiConfig),
        async switchChain(chainId) {
          const supportedChainId = chainId as SupportedWagmiChainId;
          await switchChain(wagmiConfig, { chainId: supportedChainId });
          return getWalletClient(wagmiConfig, { chainId: supportedChainId });
        },
      }),
    ],
  });

  globalForLifi.__modCrossChainLifiConfigured = true;
}

export async function getSourceTokens(chainId: number, search: string, signal?: AbortSignal) {
  configureLifi();

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

export async function getBestLifiRoute(input: BestRouteInput) {
  configureLifi();

  const fromAmount = parseAmountToUnits(input.amount, input.fromToken.decimals);
  if (!fromAmount || fromAmount <= 0n) {
    throw new Error("Enter an amount greater than zero.");
  }

  const destinationToken = await resolveDestinationToken(input.fromToken, input.toChainId, input.signal);

  const routeOptions: RouteOptions = {
    allowSwitchChain: true,
    fee: OPTIONAL_LIFI_FEE,
    maxPriceImpact: 0.3,
    order: toLifiOrder(input.order),
    slippage: input.slippage,
  };

  const response = await getRoutes(
    {
      fromAddress: input.address,
      fromAmount: fromAmount.toString(),
      fromChainId: input.fromChainId,
      fromTokenAddress: input.fromToken.address,
      options: routeOptions,
      toAddress: input.address,
      toChainId: input.toChainId,
      toTokenAddress: destinationToken.address,
    },
    { signal: input.signal },
  );

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
    routes,
  };
}

export async function executeLifiRoute(route: Route, options: ExecutionOptions): Promise<RouteExtended> {
  configureLifi();
  return executeRoute(route, {
    ...options,
    executeInBackground: false,
  });
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

function getRouteDuration(route: Route) {
  return route.steps.reduce((total, step) => total + (step.estimate?.executionDuration ?? 0), 0);
}

function toLifiOrder(order: RoutePreference): RouteOptions["order"] {
  if (order === "FASTEST") {
    return "FASTEST";
  }

  return "CHEAPEST";
}
