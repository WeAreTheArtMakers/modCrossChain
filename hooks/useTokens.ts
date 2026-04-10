"use client";

import { useQuery } from "@tanstack/react-query";
import { getSourceTokens } from "@/lib/bridge/lifi";

export function useTokens(chainId: number, search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: ["tokens", chainId, normalizedSearch],
    queryFn: ({ signal }) => getSourceTokens(chainId, normalizedSearch, signal),
    staleTime: 10 * 60 * 1000,
  });
}
