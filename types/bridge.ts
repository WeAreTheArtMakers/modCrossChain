import type { RouteExtended } from "@lifi/sdk";

export type RoutePreference = "CHEAPEST" | "FASTEST" | "BEST_RECEIVED";

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
};

export type TransactionHistoryStatus = "SUCCESS" | "FAILED";

export type TransactionHistoryItem = {
  createdAt: number;
  error?: string;
  fromAmount: string;
  fromChainId: number;
  fromSymbol: string;
  id: string;
  routePreview: string;
  status: TransactionHistoryStatus;
  toAmount?: string;
  toChainId: number;
  toSymbol: string;
  txHash?: string;
  txLink?: string;
};

export type PlatformFeeStatus = "ACTIVE" | "DISABLED_UNCONFIGURED" | "NOT_CONFIGURED";

export type PlatformFeeInfo = {
  appliedRate?: number;
  message?: string;
  requestedRate?: number;
  status: PlatformFeeStatus;
};
