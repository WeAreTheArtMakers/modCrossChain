import "server-only";

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

export function enforceRateLimit({ key, limit, scope, windowMs }: RateLimitOptions): RateLimitResult {
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

export function readResponseCache<T>({ key, scope }: Pick<CacheOptions, "key" | "scope">): T | undefined {
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

export function writeResponseCache<T>({ key, scope, ttlMs }: CacheOptions, value: T) {
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
