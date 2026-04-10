"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { Route } from "@lifi/sdk";
import { isAddress, type Address } from "viem";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { AmountInput } from "@/components/AmountInput";
import { BridgePath } from "@/components/BridgePath";
import { ChainSelect } from "@/components/ChainSelect";
import { RouteInfoPanel } from "@/components/RouteInfoPanel";
import { TokenSelector } from "@/components/TokenSelector";
import { TransactionHistoryPanel } from "@/components/TransactionHistoryPanel";
import { executeLifiRoute } from "@/lib/bridge/lifi";
import { getChainName, isSupportedChainId } from "@/lib/chains";
import { DEFAULT_SLIPPAGE } from "@/lib/env";
import { toHumanBridgeError } from "@/lib/errors";
import { formatTokenAmount, getRoutePreview, parseTokenAmount } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { useBridgeStore } from "@/lib/store";
import { extractTransactionProgress } from "@/lib/transactions";
import { useBestRoute } from "@/hooks/useBestRoute";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import type { BridgeExecutionState, RoutePreference, TransactionHistoryItem } from "@/types/bridge";

const TransactionStatusModal = lazy(() => import("@/components/TransactionStatusModal"));
const ROUTE_PREFERENCES: RoutePreference[] = ["CHEAPEST", "FASTEST", "BEST_RECEIVED"];
const testWalletMode = process.env.NEXT_PUBLIC_ENABLE_TEST_WALLET === "true";

export function BridgeCard() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const [modalOpen, setModalOpen] = useState(false);
  const [execution, setExecution] = useState<BridgeExecutionState>({
    phase: "idle",
  });

  const {
    amount,
    fromChainId,
    routePreference,
    selectedToken,
    setAmount,
    setFromChainId,
    setRoutePreference,
    setSelectedToken,
    setSlippage,
    setToChainId,
    slippage,
    toChainId,
  } = useBridgeStore();
  const { clearHistory, items: transactionHistory, pushHistoryItem } = useTransactionHistory();

  useEffect(() => {
    if (isConnected && isSupportedChainId(currentChainId)) {
      setFromChainId(currentChainId);
    }
  }, [currentChainId, isConnected, setFromChainId]);

  useEffect(() => {
    if (!slippage) {
      setSlippage(DEFAULT_SLIPPAGE);
    }
  }, [setSlippage, slippage]);

  const parsedAmount = useMemo(
    () => (selectedToken ? parseTokenAmount(amount, selectedToken.decimals) : undefined),
    [amount, selectedToken],
  );

  const tokenAddress = selectedToken?.address;
  const validTokenAddress = tokenAddress ? isAddress(tokenAddress) : false;
  const isNativeToken =
    tokenAddress?.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
    tokenAddress?.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

  const balanceQuery = useBalance({
    address,
    chainId: fromChainId,
    token: selectedToken && validTokenAddress && !isNativeToken ? (selectedToken.address as Address) : undefined,
    query: {
      enabled: Boolean(address && selectedToken && validTokenAddress && !testWalletMode),
      staleTime: 15_000,
    },
  });

  const insufficientBalance =
    !testWalletMode && Boolean(parsedAmount && balanceQuery.data) && parsedAmount! > balanceQuery.data!.value;

  const validationError = getValidationError({
    amount,
    isConnected,
    parsedAmount,
    selectedToken,
    validTokenAddress,
    insufficientBalance,
    fromChainId,
    toChainId,
  });

  const routeQuery = useBestRoute({
    address,
    amount,
    enabled: !validationError && Boolean(address),
    fromChainId,
    fromToken: selectedToken,
    order: routePreference,
    slippage,
    toChainId,
  });

  const bestRoute = routeQuery.data?.bestRoute;
  const routeError = routeQuery.error ? toHumanBridgeError(routeQuery.error) : undefined;
  const networkMismatch = isConnected && currentChainId !== fromChainId;
  const canBridge = Boolean(isConnected && bestRoute && !validationError && !routeQuery.isFetching);
  const buttonLabel = getButtonLabel({
    canBridge,
    isConnected,
    isFetchingRoute: routeQuery.isFetching,
    isSwitchingChain,
    networkMismatch,
    fromChainId,
  });

  useEffect(() => {
    if (!bestRoute) {
      return;
    }

    trackEvent("bridge_route_loaded", {
      from_chain_id: fromChainId,
      route_id: bestRoute.id,
      route_preference: routePreference,
      to_chain_id: toChainId,
    });
  }, [bestRoute, fromChainId, routePreference, toChainId]);

  useEffect(() => {
    if (!routeQuery.error) {
      return;
    }

    Sentry.captureException(routeQuery.error, {
      tags: {
        source: "route_quote",
      },
    });
  }, [routeQuery.error]);

  async function executeBridge(routeToExecute: Route) {
    if (!isConnected || !address || !routeToExecute || validationError) {
      return;
    }

    setModalOpen(true);
    setExecution({
      error: undefined,
      phase: "waiting_wallet",
      route: routeToExecute,
      txHash: undefined,
      txLink: undefined,
    });

    try {
      trackEvent("bridge_started", {
        from_chain_id: routeToExecute.fromChainId,
        route_id: routeToExecute.id,
        to_chain_id: routeToExecute.toChainId,
      });

      if (currentChainId !== fromChainId) {
        setExecution({ phase: "switching_network", route: routeToExecute });
        await switchChainAsync({ chainId: fromChainId });
      }

      setExecution({ phase: "executing", route: routeToExecute });

      const executedRoute = await executeLifiRoute(routeToExecute, {
        updateRouteHook(updatedRoute) {
          const progress = extractTransactionProgress(updatedRoute);
          setExecution({
            phase: progress.hasFailure ? "failed" : "executing",
            route: updatedRoute,
            txHash: progress.txHash,
            txLink: progress.txLink,
          });
        },
        async acceptExchangeRateUpdateHook({ oldToAmount, newToAmount, toToken }) {
          return window.confirm(
            `The estimated ${toToken.symbol} output changed from ${oldToAmount} to ${newToAmount}. Continue with the updated route?`,
          );
        },
      });

      const progress = extractTransactionProgress(executedRoute);
      setExecution({
        phase: "success",
        route: executedRoute,
        txHash: progress.txHash,
        txLink: progress.txLink,
      });
      trackEvent("bridge_succeeded", {
        from_chain_id: executedRoute.fromChainId,
        route_id: executedRoute.id,
        to_chain_id: executedRoute.toChainId,
      });
      pushHistoryItem(createHistoryItem({ route: executedRoute, status: "SUCCESS", txHash: progress.txHash, txLink: progress.txLink }));
    } catch (error) {
      const humanError = toHumanBridgeError(error);
      Sentry.captureException(error, {
        tags: {
          source: "bridge_execution",
        },
      });
      trackEvent("bridge_failed", {
        from_chain_id: routeToExecute.fromChainId,
        route_id: routeToExecute.id,
        to_chain_id: routeToExecute.toChainId,
      });
      setExecution((current) => ({
        ...current,
        phase: "failed",
        error: humanError,
      }));
      pushHistoryItem(
        createHistoryItem({
          error: humanError,
          route: routeToExecute,
          status: "FAILED",
        }),
      );
    }
  }

  async function handleBridge() {
    if (!bestRoute) {
      return;
    }

    await executeBridge(bestRoute);
  }

  async function handleRetry() {
    if (!address || validationError) {
      return;
    }

    setExecution((current) => ({
      ...current,
      error: undefined,
      phase: "executing",
    }));

    const refreshed = await routeQuery.refetch();
    const refreshedRoute = refreshed.data?.bestRoute;

    if (!refreshedRoute) {
      setExecution((current) => ({
        ...current,
        error: "Could not refresh the route. Review the quote and try again.",
        phase: "failed",
      }));
      return;
    }

    await executeBridge(refreshedRoute);
  }

  function createHistoryItem({
    error,
    route,
    status,
    txHash,
    txLink,
  }: {
    error?: string;
    route?: Route;
    status: TransactionHistoryItem["status"];
    txHash?: string;
    txLink?: string;
  }): TransactionHistoryItem {
    return {
      createdAt: Date.now(),
      error,
      fromAmount: route ? `${formatTokenAmount(route.fromAmount, route.fromToken.decimals)} ${route.fromToken.symbol}` : amount,
      fromChainId,
      fromSymbol: route?.fromToken.symbol ?? selectedToken?.symbol ?? "Token",
      id: `${Date.now()}-${status}-${txHash ?? crypto.randomUUID()}`,
      routePreview: route ? getRoutePreview(route) : "LI.FI route",
      status,
      toAmount: route ? `${formatTokenAmount(route.toAmount, route.toToken.decimals)} ${route.toToken.symbol}` : undefined,
      toChainId,
      toSymbol: route?.toToken.symbol ?? routeQuery.data?.destinationToken?.symbol ?? selectedToken?.symbol ?? "Token",
      txHash,
      txLink,
    };
  }

    return (
    <>
      <div className="w-full max-w-[480px] rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,18,22,0.96),rgba(10,12,15,0.92))] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-4">
        <div className="mb-4 flex items-start justify-between gap-4 px-1 pt-1">
          <div>
            <h2 className="text-xl font-semibold text-white">Bridge</h2>
            <p className="mt-1 text-sm text-zinc-500">Ethereum, BNB Chain, Polygon, Base, Arbitrum, Avalanche</p>
          </div>
          <div className="brand-chip rounded-md border px-2 py-1 text-xs font-medium">
            LI.FI
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_44px_1fr] sm:items-end">
            <ChainSelect label="From" value={fromChainId} onChange={setFromChainId} />
            <button
              type="button"
              aria-label="Swap source and destination chains"
              onClick={() => {
                const nextFrom = toChainId;
                setFromChainId(nextFrom);
                setToChainId(fromChainId);
              }}
              className="brand-border-hover mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 sm:mb-0"
            >
              <span aria-hidden>↓</span>
            </button>
            <ChainSelect label="To" value={toChainId} onChange={setToChainId} />
          </div>

          <BridgePath active={Boolean(bestRoute)} fromChainId={fromChainId} toChainId={toChainId} />

          <TokenSelector chainId={fromChainId} selectedToken={selectedToken} onSelect={setSelectedToken} />

          <AmountInput amount={amount} onAmountChange={setAmount} symbol={selectedToken?.symbol} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.7fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Route
              </span>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2">
                {ROUTE_PREFERENCES.map((preference) => (
                  <button
                    key={preference}
                    type="button"
                    onClick={() => setRoutePreference(preference)}
                    className={`min-h-11 rounded-md px-2 text-xs font-semibold transition ${
                      routePreference === preference
                        ? "brand-primary-button"
                        : "brand-border-hover border border-zinc-800 bg-zinc-950 text-zinc-300"
                    }`}
                  >
                    {getRoutePreferenceLabel(preference)}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Slippage
              </span>
              <select
                value={slippage}
                onChange={(event) => setSlippage(Number(event.target.value))}
                className="brand-border-hover h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-[rgb(var(--brand-accent-rgb)/0.7)]"
              >
                <option value={0.003}>0.3%</option>
                <option value={0.005}>0.5%</option>
                <option value={0.01}>1.0%</option>
                <option value={0.02}>2.0%</option>
              </select>
            </label>
          </div>

          <RouteInfoPanel
            comparisons={routeQuery.data?.comparisons}
            destinationToken={routeQuery.data?.destinationToken}
            error={validationError ?? routeError}
            isLoading={routeQuery.isFetching}
            onSelectPreference={setRoutePreference}
            routePreference={routePreference}
            route={bestRoute}
          />

          {networkMismatch ? (
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              Wallet is on {getChainName(currentChainId)}. You will be prompted to switch to{" "}
              {getChainName(fromChainId)} before bridging.
            </p>
          ) : null}

          <button
            type="button"
            disabled={!canBridge && !networkMismatch}
            onClick={handleBridge}
            className="brand-primary-button h-[52px] w-full rounded-lg px-4 text-base font-semibold disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {buttonLabel}
          </button>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-3 text-xs leading-5 text-zinc-500">
            Non-custodial execution only. Review the fee disclosure before bridging. See{" "}
            <Link href="/terms" className="font-medium text-zinc-300 transition hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/jurisdictions" className="font-medium text-zinc-300 transition hover:text-white">
              Supported Jurisdictions
            </Link>
            .
          </div>

          <TransactionHistoryPanel items={transactionHistory} onClear={clearHistory} />
        </div>
      </div>

      {modalOpen ? (
        <Suspense fallback={null}>
          <TransactionStatusModal
            execution={execution}
            onClose={() => setModalOpen(false)}
            onRetry={handleRetry}
            open={modalOpen}
          />
        </Suspense>
      ) : null}
    </>
  );
}

function getValidationError({
  amount,
  fromChainId,
  insufficientBalance,
  isConnected,
  parsedAmount,
  selectedToken,
  toChainId,
  validTokenAddress,
}: {
  amount: string;
  fromChainId: number;
  insufficientBalance: boolean;
  isConnected: boolean;
  parsedAmount?: bigint;
  selectedToken: { symbol: string } | undefined;
  toChainId: number;
  validTokenAddress: boolean;
}) {
  if (!isConnected) return "Connect a wallet to request a bridge route.";
  if (fromChainId === toChainId) return "Choose different source and destination chains.";
  if (!selectedToken) return "Select a source token.";
  if (!validTokenAddress) return "Selected token has an invalid address.";
  if (!amount) return "Enter an amount to bridge.";
  if (!parsedAmount || parsedAmount <= 0n) return "Enter an amount greater than zero.";
  if (insufficientBalance) return `Insufficient ${selectedToken.symbol} balance.`;
  return undefined;
}

function getButtonLabel({
  canBridge,
  fromChainId,
  isConnected,
  isFetchingRoute,
  isSwitchingChain,
  networkMismatch,
}: {
  canBridge: boolean;
  fromChainId: number;
  isConnected: boolean;
  isFetchingRoute: boolean;
  isSwitchingChain: boolean;
  networkMismatch: boolean;
}) {
  if (!isConnected) return "Connect wallet";
  if (isSwitchingChain) return "Switching network";
  if (networkMismatch) return `Switch to ${getChainName(fromChainId)}`;
  if (isFetchingRoute) return "Finding best route";
  if (!canBridge) return "Bridge unavailable";
  return "Bridge Now";
}

function getRoutePreferenceLabel(value: RoutePreference) {
  if (value === "BEST_RECEIVED") {
    return "Best received";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}
