import { notFound } from "next/navigation";
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
  const withdrawReady = diagnostics.withdrawals.filter((entry) => entry.status === "OK");
  const blockedWithdrawals = diagnostics.withdrawals.filter((entry) =>
    entry.status === "WARN" || entry.status === "ERROR" || entry.status === "MISSING",
  );
  const emptyWithdrawals = diagnostics.withdrawals.filter((entry) => entry.status === "INFO");
  const runtimeIssues = [
    diagnostics.apiKey.status !== "OK" ? diagnostics.apiKey.message : undefined,
    diagnostics.integration.status !== "OK" ? diagnostics.integration.message : undefined,
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#07090c] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--brand-secondary-rgb))]">
            Fee operations
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Collected / ready / blocked</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            This page stays narrow on fee operations. It answers three questions: how much has been collected, which
            chains are ready to withdraw, and whether anything is blocked.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Integrator: <span className="font-medium text-zinc-200">{diagnostics.integrator}</span>
            <span className="mx-3 text-zinc-700">|</span>
            Generated {new Date(diagnostics.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            body={
              diagnostics.fee.configuredRate
                ? `Integrator fee ${(diagnostics.fee.configuredRate * 100).toFixed(2)}% is active.`
                : diagnostics.fee.message
            }
            eyebrow="Collected"
            status={diagnostics.fee.status}
            title={`$${diagnostics.fee.totalCollectedUsd.toFixed(2)}`}
          />
          <SummaryCard
            body={
              withdrawReady.length
                ? withdrawReady.map((entry) => entry.label).join(", ")
                : "No chain has a withdraw payload yet."
            }
            eyebrow="Withdraw ready"
            status={withdrawReady.length ? "OK" : "INFO"}
            title={String(withdrawReady.length)}
          />
          <SummaryCard
            body={
              blockedWithdrawals.length || runtimeIssues.length
                ? [...runtimeIssues, ...blockedWithdrawals.map((entry) => `${entry.label}: ${entry.message}`)].join(" ")
                : "No payout blockers detected."
            }
            eyebrow="Blocked"
            status={blockedWithdrawals.length || runtimeIssues.length ? "WARN" : "OK"}
            title={String(blockedWithdrawals.length + runtimeIssues.length)}
          />
        </div>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Chain status</p>
              <h2 className="mt-2 text-2xl font-semibold">Withdraw readiness by network</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-500">
              Ready means LI.FI returned a payout payload. Empty means there is nothing to withdraw yet. Blocked means
              the chain or integration needs attention before payout.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {diagnostics.withdrawals.map((entry) => (
              <article
                key={entry.chainId}
                className="flex flex-col gap-3 rounded-[18px] border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{entry.label}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{entry.message}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getWithdrawalStatusClass(entry.status)}`}
                >
                  {getWithdrawalStatusLabel(entry.status)}
                </span>
              </article>
            ))}
          </div>

          {emptyWithdrawals.length ? (
            <p className="mt-5 text-sm text-zinc-500">
              Empty chains: {emptyWithdrawals.map((entry) => entry.label).join(", ")}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  body,
  eyebrow,
  status,
  title,
}: {
  body: string;
  eyebrow: string;
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

function getWithdrawalStatusLabel(status: "OK" | "WARN" | "ERROR" | "MISSING" | "INFO") {
  if (status === "OK") return "Ready";
  if (status === "INFO") return "Empty";
  return "Blocked";
}

function getWithdrawalStatusClass(status: "OK" | "WARN" | "ERROR" | "MISSING" | "INFO") {
  if (status === "OK") {
    return "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "INFO") {
    return "border border-sky-400/20 bg-sky-400/10 text-sky-100";
  }

  return "border border-amber-400/20 bg-amber-400/10 text-amber-100";
}
