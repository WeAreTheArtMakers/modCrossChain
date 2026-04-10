import "server-only";

import type { NextRequest } from "next/server";

export function getRequestClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const fallback = request.headers.get("host") || "anonymous";
  return (forwardedFor?.split(",")[0] || realIp || fallback).trim().toLowerCase();
}

export function getStableCacheKey(parts: Array<string | number | boolean | undefined>) {
  return parts.map((part) => String(part ?? "")).join("|");
}
