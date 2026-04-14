import { defineConfig, devices } from "@playwright/test";

const prodAppUrl = process.env.PLAYWRIGHT_PROD_APP_URL || "https://modcrosschain-production.up.railway.app";
const prodPagesUrl =
  process.env.PLAYWRIGHT_PROD_PAGES_URL || "https://wearetheartmakers.github.io/modCrossChain/";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "prod-smoke.spec.ts",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: process.env.CI ? [["html"], ["list"]] : "list",
  workers: 1,
  metadata: {
    prodAppUrl,
    prodPagesUrl,
  },
  use: {
    baseURL: prodAppUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 980 },
      },
    },
  ],
});
