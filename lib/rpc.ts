import { fallback, http } from "wagmi";
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from "viem/chains";
import { RPC_ENDPOINTS } from "@/lib/env";

type TransportChain = typeof mainnet | typeof bsc | typeof polygon | typeof base | typeof arbitrum | typeof avalanche;

const RPC_LABELS = {
  arbitrum: "Arbitrum",
  avalanche: "Avalanche",
  base: "Base",
  bnb: "BNB Chain",
  ethereum: "Ethereum",
  polygon: "Polygon",
} as const;

export function createChainTransport(chain: TransportChain, dedicatedUrl?: string) {
  const urls = [dedicatedUrl, chain.rpcUrls.default.http[0]].filter(Boolean) as string[];
  return fallback(urls.map((url) => http(url, { retryCount: 1, retryDelay: 500 })));
}

export const rpcTransports = {
  [mainnet.id]: createChainTransport(mainnet, RPC_ENDPOINTS.ethereum),
  [bsc.id]: createChainTransport(bsc, RPC_ENDPOINTS.bnb),
  [polygon.id]: createChainTransport(polygon, RPC_ENDPOINTS.polygon),
  [base.id]: createChainTransport(base, RPC_ENDPOINTS.base),
  [arbitrum.id]: createChainTransport(arbitrum, RPC_ENDPOINTS.arbitrum),
  [avalanche.id]: createChainTransport(avalanche, RPC_ENDPOINTS.avalanche),
};

const coverageEntries = Object.entries(RPC_ENDPOINTS).map(([key, value]) => ({
  configured: Boolean(value),
  key: key as keyof typeof RPC_ENDPOINTS,
  label: RPC_LABELS[key as keyof typeof RPC_LABELS],
}));

export const RPC_HEALTH = {
  configuredCount: coverageEntries.filter((entry) => entry.configured).length,
  missing: coverageEntries.filter((entry) => !entry.configured).map((entry) => entry.label),
  status:
    coverageEntries.every((entry) => entry.configured)
      ? "FULLY_COVERED"
      : coverageEntries.some((entry) => entry.configured)
        ? "PARTIAL"
        : "PUBLIC_FALLBACK",
  totalCount: coverageEntries.length,
} as const;
