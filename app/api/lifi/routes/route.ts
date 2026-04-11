import { NextRequest, NextResponse } from "next/server";
import type { Token } from "@lifi/sdk";
import { getServerBestRoute } from "@/lib/server/lifi";
import { getRequestClientKey, getStableCacheKey } from "@/lib/server/http";
import { enforceRateLimit, readResponseCache, writeResponseCache } from "@/lib/server/request-control";
import type { RoutePreference } from "@/types/bridge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const amount = typeof payload.amount === "string" ? payload.amount.trim() : "";
  const fromChainId = Number(payload.fromChainId);
  const toChainId = Number(payload.toChainId);
  const address = typeof payload.address === "string" ? payload.address : undefined;
  const slippage = Number(payload.slippage);
  const order = payload.order as RoutePreference;
  const clientKey = getRequestClientKey(request);
  const fromTokenCandidate =
    payload.fromToken && typeof payload.fromToken === "object" && !Array.isArray(payload.fromToken)
      ? (payload.fromToken as Partial<Token>)
      : undefined;

  if (!address || !amount || !Number.isFinite(fromChainId) || !Number.isFinite(toChainId) || !Number.isFinite(slippage)) {
    return NextResponse.json({ error: "Missing route parameters." }, { status: 400 });
  }

  if (!fromTokenCandidate || typeof fromTokenCandidate.address !== "string" || typeof fromTokenCandidate.symbol !== "string") {
    return NextResponse.json({ error: "Invalid token payload." }, { status: 400 });
  }

  if (!["CHEAPEST", "FASTEST", "BEST_RECEIVED"].includes(order)) {
    return NextResponse.json({ error: "Invalid route preference." }, { status: 400 });
  }

  const rateLimit = await enforceRateLimit({
    key: clientKey,
    limit: 40,
    scope: "lifi:routes",
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Quote rate limit reached. Wait a few seconds before requesting another route.",
      },
      {
        headers: {
          "Retry-After": Math.ceil(rateLimit.retryAfterMs / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
        status: 429,
      },
    );
  }

  const cacheKey = getStableCacheKey([
    address?.toLowerCase(),
    amount,
    fromChainId,
    toChainId,
    fromTokenCandidate.address?.toLowerCase(),
    slippage,
    order,
  ]);
  const cachedQuote = await readResponseCache<Awaited<ReturnType<typeof getServerBestRoute>>>({
    key: cacheKey,
    scope: "lifi:routes",
  });

  if (cachedQuote) {
    return NextResponse.json(cachedQuote, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Cache": "HIT",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  }

  try {
    const response = await getServerBestRoute({
      address: address as `0x${string}`,
      amount,
      fromChainId,
      fromToken: fromTokenCandidate as Token,
      order,
      slippage,
      toChainId,
    });
    await writeResponseCache(
      {
        key: cacheKey,
        scope: "lifi:routes",
        ttlMs: 7_500,
      },
      response,
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not quote a route right now.",
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
        status: 502,
      },
    );
  }
}
