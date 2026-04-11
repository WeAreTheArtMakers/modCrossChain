import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CopyValueButton } from "@/components/CopyValueButton";
import { ADMIN_DIAGNOSTICS_TOKEN } from "@/lib/server-env";
import { getLifiDiagnostics } from "@/lib/server/lifi-diagnostics";

export const dynamic = "force-dynamic";

type AdminLifiPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function AdminLifiDiagnosticsPage({ searchParams }: AdminLifiPageProps) {
  const { token } = await searchParams;

  if (!ADMIN_DIAGNOSTICS_TOKEN || token !== ADMIN_DIAGNOSTICS_TOKEN) {
    notFound();
  }

  const diagnostics = await getLifiDiagnostics();

  return (
    <main className="min-h-screen bg-[#07090c] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--brand-secondary-rgb))]">
            Admin diagnostics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">LI.FI integration health</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            Use this surface to verify the exact integrator slug, API key health, fee readiness, and chain-level
            withdraw payloads without exposing secrets in the client bundle.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DiagnosticsCard
            body={diagnostics.apiKey.message}
            eyebrow="API key"
            raw={diagnostics.apiKey.raw}
            status={diagnostics.apiKey.status}
            title={diagnostics.apiKey.configured ? "Configured" : "Missing"}
          />
          <DiagnosticsCard
            body={diagnostics.integration.message}
            eyebrow="Integrator slug"
            raw={diagnostics.integration.raw}
            status={diagnostics.integration.status}
            title={diagnostics.integrator}
          />
          <DiagnosticsCard
            body={diagnostics.fee.message}
            eyebrow="Fee collection"
            status={diagnostics.fee.status}
            title={
              diagnostics.fee.configuredRate
                ? `${(diagnostics.fee.configuredRate * 100).toFixed(2)}% requested`
                : "Disabled"
            }
            footer={
              <p className="text-xs text-zinc-500">
                Total collected: <span className="font-semibold text-zinc-200">${diagnostics.fee.totalCollectedUsd.toFixed(2)}</span>
              </p>
            }
          />
        </div>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-end justify-between gap-3 border-b border-white/8 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Env health</p>
              <h2 className="mt-2 text-2xl font-semibold">Bridge runtime essentials</h2>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-zinc-500">
              This stays focused on quote, fee collection, cache, and RPC coverage. Nothing extra.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {diagnostics.envHealth.map((entry) => (
              <article key={entry.key} className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{entry.kind}</p>
                    <h3 className="mt-2 text-sm font-semibold text-white">{entry.key}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusClass(entry.status)}`}>
                    {entry.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{entry.preview}</p>
                <div className="mt-4">
                  <CopyValueButton value={entry.key} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Withdraw balances</p>
              <h2 className="mt-2 text-2xl font-semibold">Chain-by-chain payout surface</h2>
            </div>
            <p className="text-sm text-zinc-500">Generated {new Date(diagnostics.generatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {diagnostics.withdrawals.map((entry) => (
              <DiagnosticsCard
                key={entry.chainId}
                body={entry.message}
                eyebrow={entry.label}
                raw={entry.raw}
                status={entry.status}
                title={`Chain ${entry.chainId}`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function DiagnosticsCard({
  body,
  eyebrow,
  raw,
  status,
  title,
  footer,
}: {
  body: string;
  eyebrow: string;
  footer?: ReactNode;
  raw?: unknown;
  status: "OK" | "WARN" | "ERROR" | "MISSING" | "INFO";
  title: string;
}) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-zinc-300">{body}</p>
      {footer ? <div className="mt-4">{footer}</div> : null}
      {raw ? (
        <pre className="mt-4 overflow-x-auto rounded-[16px] border border-white/8 bg-zinc-950/80 p-3 text-xs leading-6 text-zinc-400">
          {JSON.stringify(raw, null, 2)}
        </pre>
      ) : null}
    </article>
  );
}

function getStatusClass(status: "OK" | "WARN" | "ERROR" | "MISSING" | "INFO") {
  if (status === "OK") {
    return "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "INFO") {
    return "border border-sky-400/20 bg-sky-400/10 text-sky-100";
  }

  if (status === "WARN") {
    return "border border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  if (status === "ERROR") {
    return "border border-red-400/20 bg-red-400/10 text-red-200";
  }

  return "border border-zinc-700 bg-zinc-900 text-zinc-300";
}
