export type RpcHealthStatus = "FULLY_COVERED" | "PARTIAL" | "PUBLIC_FALLBACK";
export type RpcProbeStatus = "HEALTHY" | "SLOW" | "UNAVAILABLE";
export type RpcProbeSource = "DEDICATED" | "PUBLIC_FALLBACK";

export type RpcProbeResult = {
  chainId: number;
  error?: string;
  label: string;
  latencyMs?: number;
  source: RpcProbeSource;
  status: RpcProbeStatus;
};

export type RpcHealthSummary = {
  configuredCount: number;
  missing: string[];
  results: RpcProbeResult[];
  status: RpcHealthStatus;
  totalCount: number;
};
