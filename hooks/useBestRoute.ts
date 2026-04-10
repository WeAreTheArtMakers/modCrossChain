"use client";

import type { Token } from "@lifi/sdk";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { getBestLifiRoute } from "@/lib/bridge/lifi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { RoutePreference } from "@/types/bridge";

type UseBestRouteInput = {
  address?: Address;
  amount: string;
  enabled: boolean;
  fromChainId: number;
  fromToken?: Token;
  order: RoutePreference;
  slippage: number;
  toChainId: number;
};

export function useBestRoute({
  address,
  amount,
  enabled,
  fromChainId,
  fromToken,
  order,
  slippage,
  toChainId,
}: UseBestRouteInput) {
  const debouncedAmount = useDebouncedValue(amount, 500);

  return useQuery<Awaited<ReturnType<typeof getBestLifiRoute>>, Error>({
    queryKey: [
      "best-route",
      address,
      fromChainId,
      toChainId,
      fromToken?.address,
      debouncedAmount,
      order,
      slippage,
    ],
    queryFn: ({ signal }) =>
      getBestLifiRoute({
        address: address!,
        amount: debouncedAmount,
        fromChainId,
        fromToken: fromToken!,
        order,
        signal,
        slippage,
        toChainId,
      }),
    enabled: Boolean(enabled && address && fromToken && debouncedAmount),
    placeholderData: keepPreviousData,
  });
}
