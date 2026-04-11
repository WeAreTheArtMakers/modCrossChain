import { unstable_cache } from "next/cache";
import { BRAND_HEADLINE, BRAND_SUBHEAD } from "@/lib/branding";
import { SUPPORTED_CHAINS } from "@/lib/chains";
import { getRpcHealthSummary } from "@/lib/rpc";
import type { RpcHealthSummary } from "@/types/rpc";

const SCENE_NODES = [
  { label: "ETH", x: 62, y: 44 },
  { label: "BNB", x: 202, y: 34 },
  { label: "POL", x: 356, y: 76 },
  { label: "BASE", x: 108, y: 220 },
  { label: "ARB", x: 270, y: 214 },
  { label: "AVAX", x: 402, y: 164 },
] as const;

const METRIC_PILLS = [
  { label: "Live routes", value: "3 views" },
  { label: "Warnings", value: "Risk-aware" },
  { label: "Settlement", value: "Wallet-only" },
] as const;

const SUMMARY_CARDS = [
  {
    body: "Ethereum, BNB Chain, Polygon, Base, Arbitrum, Avalanche",
    title: "Networks",
    value: String(SUPPORTED_CHAINS.length),
  },
  {
    body: "Cheapest, fastest, and best received from one quote stack.",
    title: "Route modes",
    value: "3",
  },
  {
    body: "Route risk, fee burden, and liquidity spread stay visible before signing.",
    title: "Signals",
    value: "Live",
  },
] as const;

const getCachedRpcHealthSummary = unstable_cache(async () => getRpcHealthSummary(), ["rpc-health"], {
  revalidate: 45,
});

export async function BridgeShowcasePanel() {
  const rpcHealth = await getCachedRpcHealthSummary();
  const signalStrips = [
    {
      badge: "Fresh",
      body: "Short-lived route caching keeps the interface responsive while quotes remain fresh enough for execution.",
      title: "Quote buffer",
    },
    {
      badge: "Pre-sign",
      body: "Low-liquidity and fee burden warnings surface before the wallet prompt so users can back out earlier.",
      title: "Risk engine",
    },
    {
      badge: getInfraBadge(rpcHealth),
      body: getInfraBody(rpcHealth),
      title: "Infra posture",
    },
  ] as const;

  return (
    <aside className="relative hidden min-h-[780px] overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,17,0.92),rgba(8,10,12,0.84))] px-6 py-6 shadow-[0_30px_110px_rgba(0,0,0,0.45)] lg:block xl:px-8 xl:py-8">
      <div className="desktop-panel-aurora absolute -left-16 top-14 h-56 w-56 rounded-full" aria-hidden />
      <div className="desktop-panel-aurora desktop-panel-aurora-secondary absolute bottom-12 right-8 h-72 w-72 rounded-full" aria-hidden />
      <div className="absolute inset-0 bridge-grid opacity-50" aria-hidden />
      <div className="desktop-panel-noise absolute inset-0 opacity-70" aria-hidden />

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_230px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--brand-secondary-rgb))]">
              Route intelligence
            </p>
            <h2 className="mt-4 max-w-[12ch] text-[clamp(3rem,4vw,4.4rem)] font-semibold leading-[0.98] text-white">
              {BRAND_HEADLINE}
            </h2>
            <p className="mt-4 max-w-[44rem] text-[15px] leading-7 text-zinc-400 xl:text-base">{BRAND_SUBHEAD}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {METRIC_PILLS.map((pill) => (
                <div
                  key={pill.label}
                  className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{pill.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{pill.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden 2xl:block">
            <div className="desktop-surface relative overflow-hidden rounded-[18px] border border-white/8 px-5 py-5">
              <div className="absolute inset-0 desktop-surface-beam" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Brand field</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                The mark is split into orbit nodes and glow shards so the desktop surface carries brand motion instead
                of dead decorative space.
              </p>

              <div className="brand-orbit-mini relative mt-6 h-[170px] rounded-[18px] border border-white/8 bg-black/20">
                <svg
                  viewBox="0 0 180 180"
                  className="absolute inset-0 h-full w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M32 118C52 85 77 68 104 68C126 68 145 80 157 104" className="brand-mark-arc" />
                </svg>
                <span className="brand-mark-node brand-mark-node-left brand-mark-node-large" aria-hidden />
                <span className="brand-mark-node brand-mark-node-right brand-mark-node-large" aria-hidden />
                <span className="brand-mark-node brand-mark-node-top brand-mark-node-large" aria-hidden />
                <span className="brand-mark-node brand-mark-node-center" aria-hidden />
                <span className="brand-mark-shard brand-mark-shard-top" aria-hidden />
                <span className="brand-mark-shard brand-mark-shard-left" aria-hidden />
                <span className="brand-mark-shard brand-mark-shard-right" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.06fr)_minmax(280px,0.94fr)]">
          <div className="desktop-surface relative overflow-hidden rounded-[18px] border border-white/8 px-5 py-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" aria-hidden />
            <div className="absolute inset-0 desktop-surface-beam" aria-hidden />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[28rem]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Cross-chain lattice</p>
                <p className="mt-2 text-[15px] font-medium leading-7 text-zinc-200 xl:text-base">
                  Cheapest, fastest, and best received routes read from the same quote surface.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                {SUPPORTED_CHAINS.length} chains
              </span>
            </div>

            <div className="relative mt-5 h-[330px] overflow-hidden rounded-[16px] border border-white/8 bg-black/20">
              <svg
                viewBox="0 0 460 270"
                className="absolute inset-0 h-full w-full"
                aria-hidden
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M62 44C128 28 162 29 202 34C260 41 304 54 356 76" className="bridge-stroke-primary" />
                <path d="M62 44C95 118 100 170 108 220" className="bridge-stroke-secondary" />
                <path d="M202 34C204 114 228 174 270 214" className="bridge-stroke-primary bridge-delay" />
                <path d="M356 76C348 132 358 157 402 164" className="bridge-stroke-secondary bridge-delay" />
                <path d="M108 220C176 218 222 214 270 214" className="bridge-stroke-primary bridge-delay-2" />
                <path d="M270 214C320 236 360 214 422 182" className="bridge-stroke-secondary bridge-delay-2" />
              </svg>

              <div className="relative z-10 h-full">
                {SCENE_NODES.map((node, index) => (
                  <div
                    key={node.label}
                    className="bridge-node"
                    style={{
                      animationDelay: `${index * 140}ms`,
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                    }}
                  >
                    <span className="bridge-node-dot" aria-hidden />
                    <span className="bridge-node-label">{node.label}</span>
                  </div>
                ))}

                <div className="desktop-route-ribbon desktop-route-ribbon-primary" aria-hidden />
                <div className="desktop-route-ribbon desktop-route-ribbon-secondary" aria-hidden />
                <div className="bridge-scan-line" aria-hidden />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="desktop-surface rounded-[18px] border border-white/8 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Execution posture</p>
                  <p className="mt-2 text-[2rem] font-semibold leading-tight text-white">Wallet-only settlement</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--brand-secondary-rgb))]">
                  Non-custodial
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {signalStrips.map((strip, index) => (
                  <div key={strip.title} className="rounded-[14px] border border-white/8 bg-black/20 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`desktop-signal-dot desktop-signal-dot-${(index % 3) + 1}`} aria-hidden />
                        <p className="text-[15px] font-semibold text-white">{strip.title}</p>
                      </div>
                      <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                        {strip.badge}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">{strip.body}</p>

                    {strip.title === "Infra posture" ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {rpcHealth.results.map((result) => (
                          <div key={result.chainId} className="rounded-[12px] border border-white/8 bg-white/[0.03] px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-zinc-200">{result.label}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${getProbeBadgeClass(result.status)}`}>
                                {result.source === "DEDICATED" ? "Dedicated" : "Fallback"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-white">
                              {result.status === "UNAVAILABLE" ? "Unavailable" : `${result.latencyMs ?? 0} ms`}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {result.status === "UNAVAILABLE"
                                ? result.error ?? "Probe failed"
                                : result.status === "SLOW"
                                  ? "Latency is elevated."
                                  : "Latency is healthy."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {SUMMARY_CARDS.map((card) => (
                <div key={card.title} className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{card.title}</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none text-white">{card.value}</p>
                  <p className="mt-3 text-[15px] leading-7 text-zinc-400">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function getInfraBadge(summary: RpcHealthSummary) {
  if (summary.status === "FULLY_COVERED") {
    return "Fully covered";
  }

  if (summary.status === "PARTIAL") {
    return `${summary.configuredCount}/${summary.totalCount} ready`;
  }

  return "Public fallback";
}

function getInfraBody(summary: RpcHealthSummary) {
  const slowCount = summary.results.filter((result) => result.status === "SLOW").length;
  const unavailableCount = summary.results.filter((result) => result.status === "UNAVAILABLE").length;

  if (summary.status === "FULLY_COVERED") {
    return `Dedicated RPC coverage is configured for every supported chain. ${slowCount ? `${slowCount} endpoint${slowCount > 1 ? "s are" : " is"} slower than target.` : "Latency probes are healthy across the board."}`;
  }

  if (summary.status === "PARTIAL") {
    return `Dedicated RPC coverage is partial. Missing: ${summary.missing.join(", ")}. ${unavailableCount ? `${unavailableCount} probe${unavailableCount > 1 ? "s are" : " is"} currently unavailable.` : "Public fallback stays active for the remaining chains."}`;
  }

  return "Dedicated RPC endpoints are not configured yet. The app is still live on public RPC fallback, and the health check marks coverage as incomplete.";
}

function getProbeBadgeClass(status: RpcHealthSummary["results"][number]["status"]) {
  if (status === "UNAVAILABLE") {
    return "bg-red-400/15 text-red-200";
  }

  if (status === "SLOW") {
    return "bg-amber-400/15 text-amber-100";
  }

  return "bg-emerald-400/15 text-emerald-100";
}
