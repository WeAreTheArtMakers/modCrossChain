import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-zinc-800 bg-[#0d100f] p-6 shadow-2xl shadow-black/40">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#ba9eff]">Draft Terms</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Terms of Use</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          This draft is designed for a non-custodial bridge interface that routes through LI.FI. It should be reviewed
          by counsel before production launch.
        </p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Non-custodial service</h2>
            <p>
              modCrossChain is a frontend interface. It does not take custody of user assets, does not store private
              keys, and does not operate a custom bridge protocol. All blockchain interactions are initiated and signed
              by the connected wallet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Aggregator routing</h2>
            <p>
              Routes are sourced from third-party infrastructure, including LI.FI and the underlying bridges or DEX
              protocols selected by the route. Availability, timing, pricing, and execution quality may change without
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Fees and disclosure</h2>
            <p>
              The interface may include a disclosed LI.FI integrator fee. Gas costs, bridge fees, and platform fees are
              shown in the route panel before execution. Any small-transfer minimum fee policy is presented as a
              disclosure target only unless the execution path explicitly supports it without changing the custody
              model.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. User responsibilities</h2>
            <p>
              Users are responsible for verifying token, amount, route, destination chain, wallet prompts, and
              supported jurisdictions before confirming a transaction. Blockchain transactions are generally
              irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Restricted use</h2>
            <p>
              The operator may block or refuse access where sanctions, embargoes, licensing requirements, or local
              prohibitions make the service unavailable. See the{" "}
              <Link href="/jurisdictions" className="text-zinc-100 underline underline-offset-4">
                Supported Jurisdictions
              </Link>{" "}
              page for operational restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. No legal or tax advice</h2>
            <p>
              The interface and its documentation are operational materials only. They are not legal, compliance, tax,
              investment, or accounting advice.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-zinc-800 px-4 text-zinc-200 transition hover:border-zinc-700 hover:text-white"
          >
            Back to app
          </Link>
          <Link
            href="/jurisdictions"
            className="inline-flex h-10 items-center rounded-lg bg-[#ba9eff] px-4 font-semibold text-zinc-950 transition hover:bg-[#c8b5ff]"
          >
            Supported Jurisdictions
          </Link>
        </div>
      </div>
    </main>
  );
}
