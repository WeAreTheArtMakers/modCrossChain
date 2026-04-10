import Image from "next/image";
import Link from "next/link";
import { BridgeCard } from "@/components/BridgeCard";
import { BridgeShowcasePanel } from "@/components/BridgeShowcasePanel";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_PRODUCT_URL, BRAND_TAGLINE } from "@/lib/branding";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 text-zinc-100 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 py-3">
        <div>
          <Image
            alt={BRAND_NAME}
            src={BRAND_LOGO_SRC}
            width={218}
            height={42}
            priority
            className="w-[168px] sm:w-[218px]"
            style={{ height: "auto", width: "auto" }}
          />
          <p className="mt-2 text-sm font-medium text-zinc-400">{BRAND_TAGLINE}</p>
        </div>
        <ConnectWalletButton />
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1240px] items-start pt-4 sm:items-center sm:pt-0">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="w-full lg:sticky lg:top-6">
            <div className="mb-5 hidden rounded-lg border border-white/8 bg-[linear-gradient(135deg,rgba(16,20,24,0.94),rgba(8,10,12,0.78))] px-5 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:block">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--brand-secondary-rgb))]">
                    Execution surface
                  </p>
                  <h1 className="mt-2 max-w-md text-[28px] font-semibold leading-tight text-white">
                    Modern desktop routing with a focused mobile bridge flow.
                  </h1>
                </div>
                <div className="hidden items-center gap-2 xl:flex">
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300">
                    Wallet-native
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300">
                    Visible fees
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Desktop</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Rich route context, animated network map, and sharper visual hierarchy.
                  </p>
                </div>
                <div className="rounded-md border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Mobile</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Same palette and contrast, without turning the main flow into a landing page.
                  </p>
                </div>
                <div className="rounded-md border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Runtime</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Cached quotes, guarded API routes, and wallet-only execution remain unchanged.
                  </p>
                </div>
              </div>
            </div>

            <BridgeCard />

            <footer className="mx-auto mt-6 flex max-w-[480px] flex-wrap items-center justify-between gap-3 px-1 pb-4 text-xs text-zinc-500">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/terms" className="transition hover:text-white">
                  Terms
                </Link>
                <Link href="/jurisdictions" className="transition hover:text-white">
                  Supported Jurisdictions
                </Link>
                <a
                  href={BRAND_PRODUCT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Product Page
                </a>
              </div>
              <span>LI.FI execution with wallet-only signing</span>
            </footer>
          </div>

          <BridgeShowcasePanel />
        </div>
      </section>
    </main>
  );
}
