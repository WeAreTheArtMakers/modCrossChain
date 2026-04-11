import { fallback, http } from "wagmi";
import { arbitrum, avalanche, base, bsc, mainnet, polygon } from "viem/chains";
import { RPC_ENDPOINTS } from "@/lib/env";
import type { RpcHealthSummary, RpcProbeResult, RpcProbeSource } from "@/types/rpc";

type TransportChain = typeof mainnet | typeof bsc | typeof polygon | typeof base | typeof arbitrum | typeof avalanche;

type RpcProbeEntry = {
  chainId: number;
  configured: boolean;
  key: keyof typeof RPC_ENDPOINTS;
  label: string;
  publicUrl: string;
  source: RpcProbeSource;
  targetUrl: string;
};

const RPC_LABELS = {
  arbitrum: "Arbitrum",
  avalanche: "Avalanche",
  base: "Base",
  bnb: "BNB Chain",
  ethereum: "Ethereum",
  polygon: "Polygon",
} as const;

const CHAIN_PROBE_ENTRIES: RpcProbeEntry[] = [
  createProbeEntry("ethereum", mainnet),
  createProbeEntry("bnb", bsc),
  createProbeEntry("polygon", polygon),
  createProbeEntry("base", base),
  createProbeEntry("arbitrum", arbitrum),
  createProbeEntry("avalanche", avalanche),
];

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

export const RPC_HEALTH = getRpcCoverageSummary();

export async function getRpcHealthSummary(): Promise<RpcHealthSummary> {
  const coverage = getRpcCoverageSummary();
  const results = await Promise.all(CHAIN_PROBE_ENTRIES.map((entry) => probeRpcEntry(entry)));

  return {
    ...coverage,
    results,
  };
}

function getRpcCoverageSummary() {
  const coverageEntries = CHAIN_PROBE_ENTRIES.map((entry) => ({
    configured: entry.configured,
    label: entry.label,
  }));

  return {
    configuredCount: coverageEntries.filter((entry) => entry.configured).length,
    missing: coverageEntries.filter((entry) => !entry.configured).map((entry) => entry.label),
    status:
      coverageEntries.every((entry) => entry.configured)
        ? "FULLY_COVERED"
        : coverageEntries.some((entry) => entry.configured)
          ? "PARTIAL"
          : "PUBLIC_FALLBACK",
    totalCount: coverageEntries.length,
  } satisfies Omit<RpcHealthSummary, "results">;
}

async function probeRpcEntry(entry: RpcProbeEntry): Promise<RpcProbeResult> {
  const startedAt = Date.now();

  try {
    const response = await fetch(entry.targetUrl, {
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(2_500),
    });

    if (!response.ok) {
      return {
        chainId: entry.chainId,
        error: `HTTP ${response.status}`,
        label: entry.label,
        source: entry.source,
        status: "UNAVAILABLE",
      };
    }

    const payload = (await response.json()) as { result?: string; error?: { message?: string } };
    const observedChainId = payload.result ? Number.parseInt(payload.result, 16) : undefined;

    if (observedChainId !== entry.chainId) {
      return {
        chainId: entry.chainId,
        error: payload.error?.message ?? `Unexpected chain id ${payload.result ?? "unknown"}`,
        label: entry.label,
        latencyMs: Date.now() - startedAt,
        source: entry.source,
        status: "UNAVAILABLE",
      };
    }

    const latencyMs = Date.now() - startedAt;

    return {
      chainId: entry.chainId,
      label: entry.label,
      latencyMs,
      source: entry.source,
      status: latencyMs >= 1_250 ? "SLOW" : "HEALTHY",
    };
  } catch (error) {
    return {
      chainId: entry.chainId,
      error: error instanceof Error ? error.message : "Probe failed",
      label: entry.label,
      source: entry.source,
      status: "UNAVAILABLE",
    };
  }
}

function createProbeEntry(key: keyof typeof RPC_ENDPOINTS, chain: TransportChain): RpcProbeEntry {
  const dedicatedUrl = RPC_ENDPOINTS[key];

  return {
    chainId: chain.id,
    configured: Boolean(dedicatedUrl),
    key,
    label: RPC_LABELS[key],
    publicUrl: chain.rpcUrls.default.http[0],
    source: dedicatedUrl ? "DEDICATED" : "PUBLIC_FALLBACK",
    targetUrl: dedicatedUrl || chain.rpcUrls.default.http[0],
  };
}
