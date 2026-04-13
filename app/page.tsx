import Link from "next/link";
import { BridgeCard } from "@/components/BridgeCard";
import { BrandSignature } from "@/components/BrandSignature";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { BRAND_PRODUCT_URL } from "@/lib/branding";

export const revalidate = 45;

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 text-zinc-100 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-[980px] flex-col gap-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <BrandSignature />
        <div className="self-end sm:self-auto">
          <ConnectWalletButton />
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[980px] items-start justify-center pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-[480px]">
          <BridgeCard />

          <footer className="mx-auto mt-6 flex max-w-[480px] flex-wrap items-center justify-between gap-3 px-1 pb-4 text-[13px] text-zinc-500">
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
      </section>
    </main>
  );
}
