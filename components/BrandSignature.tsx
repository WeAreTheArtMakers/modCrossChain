import Image from "next/image";
import { BRAND_MARK_SRC, BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";

export function BrandSignature() {
  return (
    <div className="brand-signature-shell relative w-full max-w-[360px] overflow-hidden rounded-[22px] border border-white/8 px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)] sm:px-3.5 sm:py-3.5">
      <div className="brand-signature-noise absolute inset-0" aria-hidden />
      <div className="brand-signature-aurora absolute -left-8 top-0 h-24 w-24 rounded-full" aria-hidden />
      <div className="brand-signature-aurora brand-signature-aurora-secondary absolute bottom-0 right-3 h-20 w-20 rounded-full" aria-hidden />

      <div className="relative z-10 flex min-h-[54px] items-center gap-3">
        <div className="brand-mark-frame relative flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] sm:h-[54px] sm:w-[54px]">
          <Image
            src={BRAND_MARK_SRC}
            alt={BRAND_NAME}
            width={128}
            height={128}
            priority
            className="h-[38px] w-[38px] sm:h-[42px] sm:w-[42px]"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <p className="truncate text-[1.3rem] font-semibold leading-none text-white sm:text-[1.55rem]">{BRAND_NAME}</p>
          <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-400 sm:text-[10px]">
            {BRAND_TAGLINE}
          </p>
        </div>
      </div>
    </div>
  );
}
