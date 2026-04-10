"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import { GA_MEASUREMENT_ID } from "@/lib/env";

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    trackPageView(search ? `${pathname}?${search}` : pathname);
  }, [pathname]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `,
        }}
      />
    </>
  );
}
