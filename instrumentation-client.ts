import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, SENTRY_TRACES_SAMPLE_RATE } from "@/lib/env";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
