import "server-only";

import { Redis } from "@upstash/redis";
import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from "@/lib/server-env";

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type RequestControlGlobal = typeof globalThis & {
  __modCrossChainRateLimit?: Map<string, RateLimitEntry>;
  __modCrossChainResponseCache?: Map<string, CacheEntry<unknown>>;
  __modCrossChainUpstashRedis?: Redis;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  scope: string;
  windowMs: number;
};

type CacheOptions = {
  key: string;
  scope: string;
  ttlMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export async function enforceRateLimit({ key, limit, scope, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return enforceMemoryRateLimit({ key, limit, scope, windowMs });
  }

  try {
    return await enforceRedisRateLimit(redis, { key, limit, scope, windowMs });
  } catch {
    return enforceMemoryRateLimit({ key, limit, scope, windowMs });
  }
}

export async function readResponseCache<T>({ key, scope }: Pick<CacheOptions, "key" | "scope">): Promise<T | undefined> {
  const redis = getRedisClient();
  if (!redis) {
    return readMemoryResponseCache<T>({ key, scope });
  }

  try {
    const cacheKey = `${scope}:${key}`;
    const entry = await redis.get<string>(cacheKey);
    if (typeof entry !== "string") {
      return undefined;
    }

    return JSON.parse(entry) as T;
  } catch {
    return readMemoryResponseCache<T>({ key, scope });
  }
}

export async function writeResponseCache<T>({ key, scope, ttlMs }: CacheOptions, value: T): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    writeMemoryResponseCache({ key, scope, ttlMs }, value);
    return;
  }

  try {
    await redis.set(`${scope}:${key}`, JSON.stringify(value), {
      ex: Math.max(1, Math.ceil(ttlMs / 1000)),
    });
  } catch {
    writeMemoryResponseCache({ key, scope, ttlMs }, value);
  }
}

function getRedisClient() {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return undefined;
  }

  const globalForStore = globalThis as RequestControlGlobal;
  globalForStore.__modCrossChainUpstashRedis ??= new Redis({
    token: UPSTASH_REDIS_REST_TOKEN,
    url: UPSTASH_REDIS_REST_URL,
  });

  return globalForStore.__modCrossChainUpstashRedis;
}

async function enforceRedisRateLimit(
  redis: Redis,
  { key, limit, scope, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowIndex = Math.floor(now / windowMs);
  const bucketKey = `${scope}:${key}:${windowIndex}`;
  const resetAt = (windowIndex + 1) * windowMs;
  const count = Number(await redis.incr(bucketKey));

  if (count === 1) {
    await redis.expire(bucketKey, Math.max(1, Math.ceil(windowMs / 1000)));
  }

  if (count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(resetAt - now, 0),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(limit - count, 0),
    retryAfterMs: Math.max(resetAt - now, 0),
  };
}

function enforceMemoryRateLimit({ key, limit, scope, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucketKey = `${scope}:${key}`;
  const bucket = getRateLimitStore();
  const current = bucket.get(bucketKey);

  if (!current || current.expiresAt <= now) {
    bucket.set(bucketKey, {
      count: 1,
      expiresAt: now + windowMs,
    });

    pruneRateLimitStore(bucket, now);

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterMs: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(current.expiresAt - now, 0),
    };
  }

  current.count += 1;
  bucket.set(bucketKey, current);

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    retryAfterMs: Math.max(current.expiresAt - now, 0),
  };
}

function readMemoryResponseCache<T>({ key, scope }: Pick<CacheOptions, "key" | "scope">): T | undefined {
  const now = Date.now();
  const cacheKey = `${scope}:${key}`;
  const store = getResponseCacheStore();
  const entry = store.get(cacheKey) as CacheEntry<T> | undefined;

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= now) {
    store.delete(cacheKey);
    return undefined;
  }

  return entry.value;
}

function writeMemoryResponseCache<T>({ key, scope, ttlMs }: CacheOptions, value: T) {
  const now = Date.now();
  const cacheKey = `${scope}:${key}`;
  const store = getResponseCacheStore();

  store.set(cacheKey, {
    expiresAt: now + ttlMs,
    value,
  });

  pruneResponseCacheStore(store, now);
}

function getRateLimitStore() {
  const globalForStore = globalThis as RequestControlGlobal;
  globalForStore.__modCrossChainRateLimit ??= new Map<string, RateLimitEntry>();
  return globalForStore.__modCrossChainRateLimit;
}

function getResponseCacheStore() {
  const globalForStore = globalThis as RequestControlGlobal;
  globalForStore.__modCrossChainResponseCache ??= new Map<string, CacheEntry<unknown>>();
  return globalForStore.__modCrossChainResponseCache;
}

function pruneRateLimitStore(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 200) {
    return;
  }

  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function pruneResponseCacheStore(store: Map<string, CacheEntry<unknown>>, now: number) {
  if (store.size < 200) {
    return;
  }

  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }
}
