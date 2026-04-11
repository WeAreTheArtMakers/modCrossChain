"use client";

import { getChainName } from "@/lib/chains";
import { formatPercent, formatUsd, shortenAddress } from "@/lib/format";
import type { TransactionHistoryItem } from "@/types/bridge";

type TransactionHistoryPanelProps = {
  items: TransactionHistoryItem[];
  onClear: () => void;
};

export function TransactionHistoryPanel({ items, onClear }: TransactionHistoryPanelProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Local history</p>
          <p className="mt-1 text-sm font-semibold text-white">Recent bridge attempts</p>
        </div>
        {items.length ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {item.fromSymbol} {getChainName(item.fromChainId)} to {item.toSymbol} {getChainName(item.toChainId)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{item.routePreview}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                    item.status === "SUCCESS"
                      ? "bg-[#ba9eff]/15 text-[#e4c6ff]"
                      : "bg-red-400/15 text-red-200"
                  }`}
                >
                  {item.status === "SUCCESS" ? "Success" : "Failed"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span>{item.fromAmount}</span>
                <span>→</span>
                <span>{item.toAmount ?? "Pending"}</span>
                <span>•</span>
                <span>{formatTimestamp(item.createdAt)}</span>
                {typeof item.netReceivedUsd === "number" ? (
                  <>
                    <span>•</span>
                    <span>Net {formatUsd(item.netReceivedUsd)}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.riskLevel ? (
                  <span className={getRiskBadgeClass(item.riskLevel)}>{item.riskLevel}</span>
                ) : null}

                {item.warningCodes?.includes("LOW_LIQUIDITY") ? (
                  <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                    Low liquidity{typeof item.liquidityGap === "number" && item.liquidityGap > 0 ? ` (${formatPercent(item.liquidityGap, 2)})` : ""}
                  </span>
                ) : null}

                {item.txHash ? (
                  <span className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-300">
                    {shortenAddress(item.txHash)}
                  </span>
                ) : null}

                {item.txLink ? (
                  <a
                    href={item.txLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 transition hover:border-[#ba9eff]/60 hover:text-[#e4c6ff]"
                  >
                    Explorer
                  </a>
                ) : null}

                {item.error ? (
                  <span className="text-xs text-red-300">{item.error}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-zinc-800 bg-black/20 px-3 py-3 text-sm text-zinc-500">
          Successful and failed transfers are stored locally in this browser.
        </p>
      )}
    </div>
  );
}

function formatTimestamp(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getRiskBadgeClass(level: NonNullable<TransactionHistoryItem["riskLevel"]>) {
  const base = "rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

  if (level === "HIGH") {
    return `${base} bg-red-400/15 text-red-200`;
  }

  if (level === "MEDIUM") {
    return `${base} bg-amber-400/15 text-amber-100`;
  }

  return `${base} bg-emerald-400/15 text-emerald-100`;
}
