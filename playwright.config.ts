import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html"], ["list"]] : "list",
  workers: 1,
  use: {
    baseURL: "http://localhost:3001",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "NEXT_PUBLIC_ENABLE_TEST_WALLET=true NEXT_PUBLIC_APP_URL=http://localhost:3001 npm run dev -- --port 3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3001",
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
