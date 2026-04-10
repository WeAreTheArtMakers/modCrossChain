import Link from "next/link";

export default function JurisdictionsPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-zinc-800 bg-[#0d100f] p-6 shadow-2xl shadow-black/40">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#ba9eff]">Operational Policy</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Supported Jurisdictions</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          This page provides operational guidance for availability. It is not a substitute for formal legal advice and
          should be reviewed by counsel before launch.
        </p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-lg font-semibold text-white">Service intent</h2>
            <p>
              modCrossChain is intended for jurisdictions where self-custodied digital asset transfers and
              aggregator-based routing are permitted, and where the operator chooses to make the interface available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Unavailable categories</h2>
            <ul className="list-disc space-y-2 pl-5 text-zinc-300">
              <li>Sanctioned or embargoed countries, territories, persons, or wallet addresses.</li>
              <li>Jurisdictions where digital asset bridging or exchange facilitation is prohibited.</li>
              <li>Markets where the operator would need a license, registration, or approval that it does not hold.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Operator controls</h2>
            <p>
              Access can be restricted using IP rules, wallet screening, sanctions tooling, analytics thresholds, or
              manual compliance review. Availability may change as regulation changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">User confirmation</h2>
            <p>
              By using the interface, the user confirms that access is lawful in their location, that they are not a
              restricted person, and that the destination wallet and funds are not subject to sanctions or other legal
              prohibitions.
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
            href="/terms"
            className="inline-flex h-10 items-center rounded-lg bg-[#ba9eff] px-4 font-semibold text-zinc-950 transition hover:bg-[#c8b5ff]"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </main>
  );
}
