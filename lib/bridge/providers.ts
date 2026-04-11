import type { ExecutionOptions, Route, RouteExtended, Token } from "@lifi/sdk";
import { executeLifiRoute, getBestLifiRoute } from "@/lib/bridge/lifi";
import type { PlatformFeeInfo, RoutePreference } from "@/types/bridge";

export type BridgeRouteRequest = {
  address: `0x${string}`;
  amount: string;
  fromChainId: number;
  fromToken: Token;
  order: RoutePreference;
  signal?: AbortSignal;
  slippage: number;
  toChainId: number;
};

export type BridgeRouteResponse = {
  bestRoute: Route;
  comparisons: Partial<Record<RoutePreference, Route | undefined>>;
  destinationToken: Token;
  platformFee: PlatformFeeInfo;
  routes: Route[];
};

export type BridgeAggregatorClient = {
  getRoutes: (request: BridgeRouteRequest) => Promise<BridgeRouteResponse>;
  executeRoute: (route: Route, options: ExecutionOptions) => Promise<RouteExtended>;
};

export const lifiAggregator: BridgeAggregatorClient = {
  getRoutes: getBestLifiRoute,
  executeRoute: executeLifiRoute,
};

export const socketAggregator: BridgeAggregatorClient = {
  async getRoutes() {
    throw new Error("Socket fallback is not configured yet.");
  },
  async executeRoute() {
    throw new Error("Socket fallback is not configured yet.");
  },
};

export const bridgeAggregators = {
  lifi: lifiAggregator,
  socket: socketAggregator,
} satisfies Record<string, BridgeAggregatorClient>;
