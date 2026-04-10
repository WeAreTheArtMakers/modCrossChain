import Image from "next/image";
import Link from "next/link";
import { BridgeCard } from "@/components/BridgeCard";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 text-zinc-100 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-3">
        <div>
          <Image
            alt="modCrossChain"
            src="/brand/modcrosschain-wordmark.svg"
            width={218}
            height={42}
            priority
            className="h-auto w-[168px] sm:w-[218px]"
          />
          <p className="mt-2 text-sm font-medium text-zinc-400">Cross-chain bridge</p>
        </div>
        <ConnectWalletButton />
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-6xl items-start justify-center pt-4 sm:items-center sm:pt-0">
        <div className="w-full">
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
                href="https://wearetheartmakers.github.io/modCrossChain/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Product Page
              </a>
            </div>
            <span>LI.FI integrator flow with wallet-only execution</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
