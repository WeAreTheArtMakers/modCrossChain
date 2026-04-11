import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getRpcHealthSummary } from "@/lib/rpc";

export const dynamic = "force-dynamic";

const getCachedRpcHealthSummary = unstable_cache(async () => getRpcHealthSummary(), ["rpc-health-gate"], {
  revalidate: 15,
});

export async function GET() {
  try {
    const summary = await getCachedRpcHealthSummary();
    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not inspect RPC health.",
      },
      {
        status: 502,
      },
    );
  }
}
