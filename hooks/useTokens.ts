"use client";

import { useQuery } from "@tanstack/react-query";
import { getSourceTokens } from "@/lib/bridge/lifi";

export function useTokens(chainId: number, search: string, toChainId?: number) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: ["tokens", chainId, toChainId ?? "same-chain", normalizedSearch],
    queryFn: ({ signal }) => getSourceTokens(chainId, normalizedSearch, signal, toChainId),
    staleTime: 10 * 60 * 1000,
  });
}
