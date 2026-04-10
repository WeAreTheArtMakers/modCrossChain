import type { Process, RouteExtended } from "@lifi/sdk";

export function getExecutionProcesses(route: RouteExtended) {
  return route.steps.flatMap((step) => step.execution?.process ?? []);
}

export function extractTransactionProgress(route: RouteExtended) {
  const processes = getExecutionProcesses(route);
  const latestWithTx = [...processes].reverse().find((process) => process.txHash);
  const failed = processes.some((process) => process.status === "FAILED" || process.status === "CANCELLED");

  return {
    hasFailure: failed,
    txHash: latestWithTx?.txHash,
    txLink: latestWithTx?.txLink,
    latestProcess: processes.at(-1) as Process | undefined,
  };
}
