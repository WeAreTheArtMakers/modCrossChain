import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "modCrossChain Bridge",
  description: "Bridge tokens across Ethereum, BNB Chain, and Polygon with LI.FI routing.",
  icons: {
    icon: "/brand/modcrosschain-mark.svg",
    shortcut: "/brand/modcrosschain-mark.svg",
    apple: "/brand/modcrosschain-mark.svg",
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
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
