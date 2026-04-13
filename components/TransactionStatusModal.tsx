"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { getRoutePreview } from "@/lib/format";
import { getExecutionProcesses } from "@/lib/transactions";
import type { BridgeExecutionState } from "@/types/bridge";

type TransactionStatusModalProps = {
  execution: BridgeExecutionState;
  onClose: () => void;
  onRetry: () => void | Promise<void>;
  open: boolean;
};

export default function TransactionStatusModal({
  execution,
  onClose,
  onRetry,
  open,
}: TransactionStatusModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open || typeof document === "undefined") return null;

  const processes = execution.route ? getExecutionProcesses(execution.route) : [];
  const title = getTitle(execution.phase);

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-status-title"
        className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#0d100f] p-4 shadow-2xl shadow-black"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#ba9eff]">Transaction</p>
            <h3 id="transaction-status-title" className="mt-1 text-xl font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
            aria-label="Close transaction status"
          >
            ×
          </button>
        </div>

        {execution.route ? (
          <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-sm font-medium text-white">{getRoutePreview(execution.route)}</p>
            <p className="mt-1 text-xs text-zinc-500">Waiting for LI.FI status updates.</p>
          </div>
        ) : null}

        {execution.error ? (
          <p className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 px-3 py-2 text-sm leading-6 text-red-100">
            {execution.error}
          </p>
        ) : null}

        <div className="space-y-2">
          {processes.length ? (
            processes.map((process, index) => (
              <div
                key={`${process.type}-${process.startedAt}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{formatProcessType(process.type)}</p>
                  <p className="text-xs text-zinc-500">{process.message ?? process.status}</p>
                </div>
                <span className={getStatusClass(process.status)}>{process.status}</span>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-zinc-800 bg-black/20 px-3 py-3 text-sm text-zinc-500">
              Waiting for wallet confirmation.
            </p>
          )}
        </div>

        {execution.txHash ? (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs text-zinc-500">Transaction hash</p>
            <p className="mt-1 break-all text-sm text-zinc-100">{execution.txHash}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!execution.txHash) return;
                  await navigator.clipboard.writeText(execution.txHash);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex h-9 items-center rounded-lg border border-zinc-800 px-3 text-sm font-semibold text-zinc-100 transition hover:border-[#ba9eff]/60 hover:text-[#e4c6ff]"
              >
                {copied ? "Copied" : "Copy hash"}
              </button>
              {execution.txLink ? (
                <a
                  href={execution.txLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center rounded-lg bg-[#ba9eff] px-3 text-sm font-semibold text-zinc-950 transition hover:bg-[#c8b5ff]"
                >
                  Open explorer
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {execution.phase === "failed" ? (
            <button
              type="button"
              onClick={() => void onRetry()}
              className="inline-flex h-10 items-center rounded-lg bg-[#ba9eff] px-3 text-sm font-semibold text-zinc-950 transition hover:bg-[#c8b5ff]"
            >
              Refresh quote and retry
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg border border-zinc-800 px-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-700 hover:text-white"
          >
            {execution.phase === "success" ? "Bridge another" : "Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function getTitle(phase: BridgeExecutionState["phase"]) {
  switch (phase) {
    case "switching_network":
      return "Switch network";
    case "waiting_wallet":
      return "Confirm in wallet";
    case "executing":
      return "Bridge in progress";
    case "success":
      return "Bridge complete";
    case "failed":
      return "Bridge failed";
    default:
      return "Ready";
  }
}

function formatProcessType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClass(status: string) {
  const base = "rounded-md px-2 py-1 text-xs font-semibold";
  if (status === "DONE") return `${base} bg-[#ba9eff]/15 text-[#e4c6ff]`;
  if (status === "FAILED" || status === "CANCELLED") return `${base} bg-red-400/15 text-red-200`;
  if (status === "PENDING" || status === "STARTED") return `${base} bg-amber-400/15 text-amber-100`;
  return `${base} bg-zinc-800 text-zinc-300`;
}
