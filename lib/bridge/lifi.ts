import {
  createConfig as createLifiConfig,
  EVM,
  executeRoute,
  type ExecutionOptions,
  type LiFiStep,
  type Route,
  type RouteExtended,
  type Token,
} from "@lifi/sdk";
import { getWalletClient, switchChain } from "wagmi/actions";
import { DEFAULT_SLIPPAGE, LIFI_INTEGRATOR } from "@/lib/env";
import type { PlatformFeeInfo } from "@/types/bridge";
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

export async function getSourceTokens(chainId: number, search: string, signal?: AbortSignal, toChainId?: number) {
  const query = new URLSearchParams({
    chainId: String(chainId),
  });
  if (search) {
    query.set("search", search);
  }
  if (toChainId && toChainId !== chainId) {
    query.set("toChainId", String(toChainId));
  }

  const response = await fetch(`/api/lifi/tokens?${query.toString()}`, {
    method: "GET",
    signal,
  });

  const payload = (await response.json()) as Token[] | { error?: string };

  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(
      !Array.isArray(payload) && payload.error ? payload.error : "Could not load supported tokens.",
    );
  }

  return payload;
}

export async function getBestLifiRoute(input: BestRouteInput) {
  const response = await fetch("/api/lifi/routes", {
    body: JSON.stringify({
      address: input.address,
      amount: input.amount,
      fromChainId: input.fromChainId,
      fromToken: input.fromToken,
      order: input.order,
      slippage: input.slippage,
      toChainId: input.toChainId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    signal: input.signal,
  });

  const payload = (await response.json()) as
    | {
        bestRoute: Route;
        comparisons: RouteComparisons;
        destinationToken: Token;
        platformFee: PlatformFeeInfo;
        routes: Route[];
      }
    | { error?: string };

  if (!response.ok || !("bestRoute" in payload)) {
    throw new Error(("error" in payload && payload.error) || "Could not quote a route right now.");
  }

  return {
    bestRoute: payload.bestRoute,
    comparisons: payload.comparisons,
    destinationToken: payload.destinationToken,
    platformFee: payload.platformFee,
    routes: payload.routes,
  };
}

export async function executeLifiRoute(route: Route, options: ExecutionOptions): Promise<RouteExtended> {
  configureLifi();

  if (process.env.NEXT_PUBLIC_ENABLE_TEST_WALLET === "true" && route.id.startsWith("mock-")) {
    return simulateMockExecution(route, options);
  }

  return executeRoute(route, {
    ...options,
    executeInBackground: false,
  });
}

async function simulateMockExecution(route: Route, options: ExecutionOptions): Promise<RouteExtended> {
  const mockTx = {
    txHash: "0xmockbridge00000000000000000000000000000000000000000000000000000001",
    txLink: "https://example.com/mock-tx",
  };
  const pendingRoute = createMockExecutionRoute(route, "PENDING", "Bridge queued", {
    txHash: mockTx.txHash,
    txLink: mockTx.txLink,
  });
  options.updateRouteHook?.(pendingRoute);
  await delay(250);

  if (route.id.includes("failure")) {
    const failedRoute = createMockExecutionRoute(route, "FAILED", "Mock bridge failed for test coverage.");
    options.updateRouteHook?.(failedRoute);
    throw new Error("Mock execution failed.");
  }

  const completeRoute = createMockExecutionRoute(route, "DONE", "Mock bridge completed.", mockTx);
  options.updateRouteHook?.(completeRoute);
  return completeRoute;
}

function createMockExecutionRoute(
  route: Route,
  status: "PENDING" | "FAILED" | "DONE",
  message: string,
  tx?: { txHash: string; txLink: string },
) {
  const step = route.steps[0] as LiFiStep | undefined;

  return {
    ...route,
    steps: route.steps.map((currentStep, index) => ({
      ...(currentStep as LiFiStep),
      execution:
        index === 0
          ? {
              process: [
                {
                  chainId: route.fromChainId,
                  message,
                  startedAt: Date.now(),
                  status,
                  txHash: tx?.txHash,
                  txLink: tx?.txLink,
                  type: step?.action.fromChainId !== step?.action.toChainId ? "CROSS_CHAIN" : "SWAP",
                },
              ],
              startedAt: Date.now(),
              status: status === "DONE" ? "DONE" : status === "FAILED" ? "FAILED" : "PENDING",
            }
          : undefined,
    })),
  } satisfies RouteExtended;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
