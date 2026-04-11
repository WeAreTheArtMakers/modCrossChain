import { NextRequest, NextResponse } from "next/server";
import { getServerSourceTokens } from "@/lib/server/lifi";
import { getRequestClientKey, getStableCacheKey } from "@/lib/server/http";
import { enforceRateLimit, readResponseCache, writeResponseCache } from "@/lib/server/request-control";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const chainId = Number(request.nextUrl.searchParams.get("chainId"));
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const clientKey = getRequestClientKey(request);

  if (!Number.isFinite(chainId) || chainId <= 0) {
    return NextResponse.json({ error: "Invalid chainId." }, { status: 400 });
  }

  const rateLimit = await enforceRateLimit({
    key: clientKey,
    limit: 90,
    scope: "lifi:tokens",
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Token search rate limit reached. Wait a few seconds and try again.",
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

  const cacheKey = getStableCacheKey([chainId, search.toLowerCase()]);
  const cachedTokens = await readResponseCache<Awaited<ReturnType<typeof getServerSourceTokens>>>({
    key: cacheKey,
    scope: "lifi:tokens",
  });

  if (cachedTokens) {
    return NextResponse.json(cachedTokens, {
      headers: {
        "Cache-Control": "public, s-maxage=90, stale-while-revalidate=300",
        "X-Cache": "HIT",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  }

  try {
    const tokens = await getServerSourceTokens(chainId, search);
    await writeResponseCache(
      {
        key: cacheKey,
        scope: "lifi:tokens",
        ttlMs: 90_000,
      },
      tokens,
    );

    return NextResponse.json(tokens, {
      headers: {
        "Cache-Control": "public, s-maxage=90, stale-while-revalidate=300",
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load supported tokens.",
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
