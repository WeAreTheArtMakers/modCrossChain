import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";

export function BrandSignature() {
  return (
    <div className="brand-signature-shell relative w-full max-w-[430px] overflow-hidden rounded-[22px] border border-white/8 px-3 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:px-4 sm:py-4">
      <div className="brand-signature-noise absolute inset-0" aria-hidden />
      <div className="brand-signature-aurora absolute -left-8 top-0 h-28 w-28 rounded-full" aria-hidden />
      <div className="brand-signature-aurora brand-signature-aurora-secondary absolute bottom-0 right-4 h-24 w-24 rounded-full" aria-hidden />

      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
        <div className="brand-mark-frame relative h-[58px] w-[58px] shrink-0 rounded-[18px] sm:h-[68px] sm:w-[68px]">
          <div className="brand-mark-grid absolute inset-[7px] rounded-[14px]" aria-hidden />
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
          <p className="truncate text-[1.45rem] font-semibold leading-none text-white sm:text-[1.8rem]">{BRAND_NAME}</p>
          <p className="mt-1.5 max-w-[18rem] text-[10px] font-medium tracking-[0.12em] text-zinc-400 sm:text-[11px]">
            {BRAND_TAGLINE}
          </p>
        </div>
      </div>
    </div>
  );
}
