"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#080a09] text-zinc-100">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-[#0d100f] p-6 shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--brand-secondary-rgb))]">
              Execution status
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">A runtime error interrupted the session.</h1>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              The failure has been captured for diagnostics. Reset the page state and request a fresh route before
              signing again.
            </p>
            <button type="button" onClick={reset} className="brand-primary-button mt-6 rounded-lg px-4 py-3 text-sm font-semibold">
              Reset app state
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
