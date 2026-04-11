import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";

export function BrandSignature() {
  return (
    <div className="brand-signature-shell relative w-full max-w-[640px] overflow-hidden rounded-[26px] border border-white/8 px-4 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.38)] sm:px-5 sm:py-5">
      <div className="brand-signature-noise absolute inset-0" aria-hidden />
      <div className="brand-signature-aurora absolute -left-10 top-0 h-40 w-40 rounded-full" aria-hidden />
      <div className="brand-signature-aurora brand-signature-aurora-secondary absolute bottom-0 right-6 h-36 w-36 rounded-full" aria-hidden />

      <div className="relative z-10 flex items-center gap-4 sm:gap-5">
        <div className="brand-mark-frame relative h-[74px] w-[74px] shrink-0 rounded-[22px] sm:h-[92px] sm:w-[92px]">
          <div className="brand-mark-grid absolute inset-[8px] rounded-[18px]" aria-hidden />
          <svg
            viewBox="0 0 128 128"
            className="absolute inset-0 h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M32 76C42.6667 58.6667 55.3333 50 70 50C83.3333 50 94 57 102 71" className="brand-mark-arc" />
          </svg>

          <span className="brand-mark-node brand-mark-node-left" aria-hidden />
          <span className="brand-mark-node brand-mark-node-right" aria-hidden />
          <span className="brand-mark-node brand-mark-node-top" aria-hidden />
          <span className="brand-mark-node brand-mark-node-center" aria-hidden />
          <span className="brand-mark-shard brand-mark-shard-top" aria-hidden />
          <span className="brand-mark-shard brand-mark-shard-left" aria-hidden />
          <span className="brand-mark-shard brand-mark-shard-right" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[1.7rem] font-semibold leading-none text-white sm:text-[2.35rem]">{BRAND_NAME}</p>
          <p className="mt-2 max-w-[28rem] text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400 sm:text-[13px]">
            {BRAND_TAGLINE}
          </p>
        </div>
      </div>
    </div>
  );
}
