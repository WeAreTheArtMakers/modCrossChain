import { BRAND_HEADLINE, BRAND_SUBHEAD } from "@/lib/branding";
import { SUPPORTED_CHAINS } from "@/lib/chains";
import { HAS_DEDICATED_RPC_COVERAGE } from "@/lib/env";

const SCENE_NODES = [
  { label: "ETH", x: 62, y: 44 },
  { label: "BNB", x: 202, y: 34 },
  { label: "POL", x: 356, y: 76 },
  { label: "BASE", x: 108, y: 220 },
  { label: "ARB", x: 270, y: 214 },
  { label: "AVAX", x: 402, y: 164 },
] as const;

const SIGNAL_STRIPS = [
  {
    body: "Short-lived route caching keeps the interface responsive while quotes remain fresh enough for execution.",
    title: "Quote buffer",
  },
  {
    body: "Low-liquidity and fee burden warnings surface before the wallet prompt so users can back out earlier.",
    title: "Risk engine",
  },
  {
    body: HAS_DEDICATED_RPC_COVERAGE
      ? "Dedicated RPC coverage is configured for every supported chain."
      : "Dedicated RPCs can be dropped in per chain without changing the product surface.",
    title: "Infra posture",
  },
] as const;

const METRIC_PILLS = [
  { label: "Live routes", value: "3 views" },
  { label: "Warnings", value: "Risk-aware" },
  { label: "Settlement", value: "Wallet-only" },
] as const;

export function BridgeShowcasePanel() {
  return (
    <aside className="relative hidden min-h-[780px] overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,17,0.92),rgba(8,10,12,0.84))] px-8 py-8 shadow-[0_30px_110px_rgba(0,0,0,0.45)] lg:block">
      <div className="desktop-panel-aurora absolute -left-16 top-14 h-56 w-56 rounded-full" aria-hidden />
      <div className="desktop-panel-aurora desktop-panel-aurora-secondary absolute bottom-12 right-8 h-72 w-72 rounded-full" aria-hidden />
      <div className="absolute inset-0 bridge-grid opacity-50" aria-hidden />
      <div className="desktop-panel-noise absolute inset-0 opacity-70" aria-hidden />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--brand-secondary-rgb))]">
              Route intelligence
            </p>
            <h2 className="mt-4 max-w-xl text-[42px] font-semibold leading-[1.04] text-white">{BRAND_HEADLINE}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">{BRAND_SUBHEAD}</p>
          </div>

          <div className="hidden xl:flex xl:flex-col xl:items-end xl:gap-3">
            {METRIC_PILLS.map((pill) => (
              <div
                key={pill.label}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-right backdrop-blur"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{pill.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{pill.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5">
          <div className="desktop-surface relative overflow-hidden rounded-[18px] border border-white/8 px-5 py-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" aria-hidden />
            <div className="absolute inset-0 desktop-surface-beam" aria-hidden />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Cross-chain lattice</p>
                <p className="mt-2 text-sm font-medium text-zinc-200">
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
                <path
                  d="M62 44C128 28 162 29 202 34C260 41 304 54 356 76"
                  className="bridge-stroke-primary"
                />
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
                  <p className="mt-2 text-2xl font-semibold text-white">Wallet-only settlement</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--brand-secondary-rgb))]">
                  Non-custodial
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {SIGNAL_STRIPS.map((strip, index) => (
                  <div key={strip.title} className="rounded-[14px] border border-white/8 bg-black/20 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`desktop-signal-dot desktop-signal-dot-${(index % 3) + 1}`} aria-hidden />
                      <p className="text-sm font-semibold text-white">{strip.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{strip.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Networks</p>
                <p className="mt-3 text-3xl font-semibold text-white">{SUPPORTED_CHAINS.length}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Ethereum, BNB Chain, Polygon, Base, Arbitrum, Avalanche</p>
              </div>
              <div className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Route modes</p>
                <p className="mt-3 text-3xl font-semibold text-white">3</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Cheapest, fastest, and best received from one quote stack.</p>
              </div>
              <div className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Signals</p>
                <p className="mt-3 text-3xl font-semibold text-white">Live</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Route risk, fee burden, and liquidity spread stay visible before signing.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[18px] border border-white/8 bg-black/20 px-5 py-4">
          <div className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            <span>Desktop emphasis</span>
            <span className="text-[rgb(var(--brand-secondary-rgb))]">Responsive by reduction on mobile</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <p className="leading-6 text-zinc-300">
              Desktop carries the richer route narrative, animated topology, and stronger contrast hierarchy so the empty right column becomes product context instead of dead space.
            </p>
            <p className="leading-6 text-zinc-300">
              Mobile keeps the bridge card first, preserves the same palette and glow language, and avoids forcing a hero section ahead of the transfer form.
            </p>
            <p className="leading-6 text-zinc-300">
              The visual language is now one system: same accent pair, same dark surfaces, fewer layout jumps, more value per screen width.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
