import "server-only";

import { SUPPORTED_CHAINS } from "@/lib/chains";
import { LIFI_INTEGRATOR, OPTIONAL_LIFI_FEE } from "@/lib/env";
import {
  ADMIN_DIAGNOSTICS_TOKEN,
  LIFI_API_KEY,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from "@/lib/server-env";
import { RPC_ENDPOINTS } from "@/lib/env";

const LIFI_API_BASE = "https://li.quest/v1";

type DiagnosticsStatus = "OK" | "WARN" | "ERROR" | "MISSING" | "INFO";

type FeeBalanceEntry = {
  amountUsd?: number;
  chainId?: number;
  symbol?: string;
};

export type LifiDiagnostics = {
  apiKey: {
    configured: boolean;
    message: string;
    raw?: unknown;
    status: DiagnosticsStatus;
  };
  envHealth: Array<{
    key: string;
    kind: "public" | "secret";
    preview: string;
    status: DiagnosticsStatus;
  }>;
  fee: {
    configuredRate?: number;
    totalCollectedUsd: number;
    message: string;
    status: DiagnosticsStatus;
  };
  generatedAt: string;
  integration: {
    message: string;
    raw?: unknown;
    status: DiagnosticsStatus;
  };
  integrator: string;
  withdrawals: Array<{
    chainId: number;
    label: string;
    message: string;
    raw?: unknown;
    status: DiagnosticsStatus;
  }>;
};

export async function getLifiDiagnostics(): Promise<LifiDiagnostics> {
  const apiKey = await getApiKeyStatus();
  const integration = await getIntegrationStatus();
  const totalCollectedUsd = getTotalCollectedUsd(integration.raw);
  const withdrawals = await Promise.all(
    SUPPORTED_CHAINS.map(async (chain) => ({
      chainId: chain.id,
      label: chain.name,
      ...(await getWithdrawalStatus(chain.id)),
    })),
  );

  return {
    apiKey,
    envHealth: getEnvHealth(),
    fee: getFeeStatus(integration.status, totalCollectedUsd),
    generatedAt: new Date().toISOString(),
    integration,
    integrator: LIFI_INTEGRATOR,
    withdrawals,
  };
}

async function getApiKeyStatus(): Promise<LifiDiagnostics["apiKey"]> {
  if (!LIFI_API_KEY) {
    return {
      configured: false,
      message: "LIFI_API_KEY is not configured on the server.",
      status: "MISSING",
    };
  }

  const response = await fetchLifiJson("/keys/test");
  if (!response.ok) {
    return {
      configured: true,
      message: response.message || "LI.FI rejected the current API key.",
      raw: response.data,
      status: "ERROR",
    };
  }

  return {
    configured: true,
    message: "Server-side API key test succeeded.",
    raw: response.data,
    status: "OK",
  };
}

async function getIntegrationStatus(): Promise<LifiDiagnostics["integration"]> {
  const response = await fetchLifiJson(`/integrators/${encodeURIComponent(LIFI_INTEGRATOR)}`);

  if (!response.ok) {
    return {
      message:
        response.status === 404
          ? `No LI.FI integration was found for "${LIFI_INTEGRATOR}". Check the exact portal string.`
          : response.message || "Could not load LI.FI integration details.",
      raw: response.data,
      status: response.status === 404 ? "WARN" : "ERROR",
    };
  }

  return {
    message: `Integration "${LIFI_INTEGRATOR}" is reachable from the LI.FI API.`,
    raw: response.data,
    status: "OK",
  };
}

async function getWithdrawalStatus(chainId: number): Promise<{
  message: string;
  raw?: unknown;
  status: DiagnosticsStatus;
}> {
  const response = await fetchLifiJson(
    `/integrators/${encodeURIComponent(LIFI_INTEGRATOR)}/withdraw/${chainId}`,
  );

  if (!response.ok) {
    if (isEmptyWithdrawResponse(response.data, response.message)) {
      return {
        message: "No collected fees are waiting on this chain yet.",
        raw: response.data,
        status: "INFO",
      };
    }

    return {
      message:
        response.status === 404
          ? "No withdraw payload for this chain yet."
          : response.message || "Could not load withdraw balance.",
      raw: response.data,
      status: response.status === 404 ? "WARN" : "ERROR",
    };
  }

  return {
    message: summarizeWithdrawalPayload(response.data),
    raw: response.data,
    status: "OK",
  };
}

function getFeeStatus(
  integrationStatus: DiagnosticsStatus,
  totalCollectedUsd: number,
): LifiDiagnostics["fee"] {
  if (!OPTIONAL_LIFI_FEE) {
    return {
      message: "NEXT_PUBLIC_LIFI_FEE is not set, so no integrator fee is being requested.",
      totalCollectedUsd,
      status: "MISSING",
    };
  }

  if (integrationStatus !== "OK") {
    return {
      configuredRate: OPTIONAL_LIFI_FEE,
      message:
        "The fee rate is configured in the app, but the LI.FI integration record is not healthy yet. Check the exact integrator string and portal activation.",
      totalCollectedUsd,
      status: "WARN",
    };
  }

  const hasCollectedFees = totalCollectedUsd > 0;
  return {
    configuredRate: OPTIONAL_LIFI_FEE,
    message: hasCollectedFees
      ? "Fee routing is active and collected balances are present in the LI.FI integration record."
      : "Fee routing is active, but there are no collected balances to withdraw yet.",
    totalCollectedUsd,
    status: "OK",
  };
}

async function fetchLifiJson(path: string): Promise<{
  data?: unknown;
  message?: string;
  ok: boolean;
  status: number;
}> {
  const response = await fetch(`${LIFI_API_BASE}${path}`, {
    headers: {
      ...(LIFI_API_KEY ? { "x-lifi-api-key": LIFI_API_KEY } : {}),
    },
    method: "GET",
    next: {
      revalidate: 0,
    },
  });

  const text = await response.text();
  const data = text ? tryParseJson(text) : undefined;

  return {
    data,
    message: getDiagnosticsMessage(data, response.statusText),
    ok: response.ok,
    status: response.status,
  };
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function getDiagnosticsMessage(data: unknown, fallback: string) {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const candidate = data as { message?: unknown; error?: unknown };
    if (typeof candidate.message === "string") {
      return candidate.message;
    }

    if (typeof candidate.error === "string") {
      return candidate.error;
    }
  }

  return fallback;
}

function summarizeWithdrawalPayload(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Withdraw endpoint responded.";
  }

  const record = data as Record<string, unknown>;
  const balances = Array.isArray(record.balances)
    ? record.balances
    : Array.isArray(record.data)
      ? record.data
      : undefined;

  if (balances?.length) {
    const preview = balances
      .slice(0, 3)
      .map((entry) => summarizeUnknownRecord(entry))
      .filter(Boolean)
      .join(" | ");

    return preview || "Withdraw balances are available.";
  }

  const directPreview = summarizeUnknownRecord(record);
  return directPreview || "Withdraw endpoint responded.";
}

function getEnvHealth(): LifiDiagnostics["envHealth"] {
  const configuredRpcCount = Object.values(RPC_ENDPOINTS).filter(Boolean).length;
  const totalRpcCount = Object.keys(RPC_ENDPOINTS).length;

  return [
    getEnvEntry("LIFI_API_KEY", "secret", Boolean(LIFI_API_KEY)),
    getEnvEntry("UPSTASH_REDIS_REST_URL", "secret", Boolean(UPSTASH_REDIS_REST_URL)),
    getEnvEntry("UPSTASH_REDIS_REST_TOKEN", "secret", Boolean(UPSTASH_REDIS_REST_TOKEN)),
    getEnvEntry("ADMIN_DIAGNOSTICS_TOKEN", "secret", Boolean(ADMIN_DIAGNOSTICS_TOKEN)),
    getEnvEntry("NEXT_PUBLIC_LIFI_INTEGRATOR", "public", Boolean(LIFI_INTEGRATOR), LIFI_INTEGRATOR),
    getEnvEntry("NEXT_PUBLIC_LIFI_FEE", "public", Boolean(OPTIONAL_LIFI_FEE), OPTIONAL_LIFI_FEE?.toString()),
    {
      key: "NEXT_PUBLIC_RPC_COVERAGE",
      kind: "public",
      preview: `${configuredRpcCount}/${totalRpcCount} configured`,
      status: configuredRpcCount === totalRpcCount ? "OK" : configuredRpcCount > 0 ? "WARN" : "MISSING",
    },
  ];
}

function getEnvEntry(
  key: string,
  kind: "public" | "secret",
  configured: boolean,
  preview?: string,
) {
  return {
    key,
    kind,
    preview: preview ?? (configured ? "Configured" : "Missing"),
    status: configured ? "OK" : "MISSING",
  } satisfies LifiDiagnostics["envHealth"][number];
}

function extractFeeBalances(data: unknown) {
  if (!data || typeof data !== "object") {
    return [] as FeeBalanceEntry[];
  }

  const feeBalances = (data as { feeBalances?: unknown }).feeBalances;
  if (!Array.isArray(feeBalances)) {
    return [] as FeeBalanceEntry[];
  }

  return feeBalances.map((entry) => {
    const record = entry as Record<string, unknown>;
    return {
      amountUsd: toNumber(record.amountUSD ?? record.amountUsd ?? record.usdValue),
      chainId: toNumber(record.chainId),
      symbol: firstString(record, ["symbol", "tokenSymbol", "coinKey"]),
    } satisfies FeeBalanceEntry;
  });
}

function isEmptyWithdrawResponse(data: unknown, message?: string) {
  if (typeof message === "string" && /no tokens to withdraw/i.test(message)) {
    return true;
  }

  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  return typeof record.message === "string" && /no tokens to withdraw/i.test(record.message);
}

function getTotalCollectedUsd(data: unknown) {
  const total = extractFeeBalances(data).reduce((sum, entry) => sum + (entry.amountUsd ?? 0), 0);
  return Number(total.toFixed(2));
}

function summarizeUnknownRecord(value: unknown) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as Record<string, unknown>;
  const symbol = firstString(record, ["symbol", "tokenSymbol", "coinKey"]);
  const amount = firstString(record, ["amount", "formattedAmount", "value", "balance"]);
  const chain = firstString(record, ["chainId", "chain"]);

  return [symbol, amount, chain ? `chain ${chain}` : undefined].filter(Boolean).join(" ");
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}
