import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { AppProviders } from "@/components/AppProviders";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import {
  BRAND_ACCENT,
  BRAND_ACCENT_RGB,
  BRAND_MARK_SRC,
  BRAND_NAME,
  BRAND_SECONDARY,
  BRAND_SECONDARY_RGB,
  BRAND_TAGLINE,
} from "@/lib/branding";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} Bridge`,
  description: BRAND_TAGLINE,
  icons: {
    icon: BRAND_MARK_SRC,
    shortcut: BRAND_MARK_SRC,
    apple: BRAND_MARK_SRC,
  },
};

export const viewport: Viewport = {
  themeColor: "#080a09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={
          {
            "--brand-accent": BRAND_ACCENT,
            "--brand-accent-rgb": BRAND_ACCENT_RGB,
            "--brand-secondary": BRAND_SECONDARY,
            "--brand-secondary-rgb": BRAND_SECONDARY_RGB,
          } as CSSProperties
        }
      >
        <AppProviders>
          <AnalyticsProvider />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
