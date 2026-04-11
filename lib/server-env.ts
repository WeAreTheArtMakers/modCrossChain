import "server-only";

export const LIFI_API_KEY = process.env.LIFI_API_KEY || process.env.NEXT_PUBLIC_LIFI_API_KEY || undefined;
export const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || undefined;
export const SENTRY_ORG = process.env.SENTRY_ORG || undefined;
export const SENTRY_PROJECT = process.env.SENTRY_PROJECT || undefined;
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || undefined;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || undefined;
