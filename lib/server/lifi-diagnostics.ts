import "server-only";

import { SUPPORTED_CHAINS } from "@/lib/chains";
import { LIFI_INTEGRATOR, OPTIONAL_LIFI_FEE } from "@/lib/env";
import { LIFI_API_KEY } from "@/lib/server-env";

const LIFI_API_BASE = "https://li.quest/v1";

type DiagnosticsStatus = "OK" | "WARN" | "ERROR" | "MISSING";

export type LifiDiagnostics = {
  apiKey: {
    configured: boolean;
    message: string;
    raw?: unknown;
    status: DiagnosticsStatus;
  };
  fee: {
    configuredRate?: number;
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
  const withdrawals = await Promise.all(
    SUPPORTED_CHAINS.map(async (chain) => ({
      chainId: chain.id,
      label: chain.name,
      ...(await getWithdrawalStatus(chain.id)),
    })),
  );

  return {
    apiKey,
    fee: getFeeStatus(integration.status, withdrawals),
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
  withdrawals: LifiDiagnostics["withdrawals"],
): LifiDiagnostics["fee"] {
  if (!OPTIONAL_LIFI_FEE) {
    return {
      message: "NEXT_PUBLIC_LIFI_FEE is not set, so no integrator fee is being requested.",
      status: "MISSING",
    };
  }

  if (integrationStatus !== "OK") {
    return {
      configuredRate: OPTIONAL_LIFI_FEE,
      message:
        "The fee rate is configured in the app, but the LI.FI integration record is not healthy yet. Check the exact integrator string and portal activation.",
      status: "WARN",
    };
  }

  const hasLiveWithdrawPayload = withdrawals.some((entry) => entry.status === "OK");
  return {
    configuredRate: OPTIONAL_LIFI_FEE,
    message: hasLiveWithdrawPayload
      ? "Fee routing looks active. Withdraw payloads are reachable from the LI.FI API."
      : "The fee rate is configured and the integration exists, but no withdraw payload was returned yet.",
    status: hasLiveWithdrawPayload ? "OK" : "WARN",
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
