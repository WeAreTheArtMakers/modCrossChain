import type { RouteExtended } from "@lifi/sdk";

export type RoutePreference = "CHEAPEST" | "FASTEST";

export type BridgeExecutionPhase =
  | "idle"
  | "switching_network"
  | "waiting_wallet"
  | "executing"
  | "success"
  | "failed";

export type BridgeExecutionState = {
  error?: string;
  phase: BridgeExecutionPhase;
  route?: RouteExtended;
  txHash?: string;
  txLink?: string;
  updatedAt: number;
};
