import Image from "next/image";
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
        <BridgeCard />
      </section>
    </main>
  );
}
