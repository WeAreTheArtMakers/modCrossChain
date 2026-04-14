export type RpcHealthStatus = "FULLY_COVERED" | "PARTIAL" | "PUBLIC_FALLBACK";
export type RpcHealthProfile = "development" | "production";
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
  profile: RpcHealthProfile;
  results: RpcProbeResult[];
  status: RpcHealthStatus;
  thresholds: {
    blockThresholdMs: number;
    slowThresholdMs: number;
    timeoutMs: number;
  };
  totalCount: number;
};
