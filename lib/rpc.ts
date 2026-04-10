import { fallback, http } from "wagmi";
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from "viem/chains";
import { RPC_ENDPOINTS } from "@/lib/env";

type TransportChain = typeof mainnet | typeof bsc | typeof polygon | typeof base | typeof arbitrum | typeof avalanche;

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
