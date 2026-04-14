import { expect, test } from "@playwright/test";

const pagesUrl =
  process.env.PLAYWRIGHT_PROD_PAGES_URL || "https://wearetheartmakers.github.io/modCrossChain/";
const adminToken = process.env.PLAYWRIGHT_PROD_ADMIN_TOKEN;

test("production bridge shell responds", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");

  await expect(page).toHaveTitle(/modCrossChain/i);
  await expect(header).toContainText("modCrossChain");
  await expect(page.getByRole("heading", { name: "Bridge" })).toBeVisible();
  await expect(page.getByText("Ethereum, BNB Chain, Polygon, Base, Arbitrum, Avalanche")).toBeVisible();
  await expect(header.getByRole("button", { name: /Connect wallet|0x/i })).toBeVisible();
});

test("production rpc health endpoint responds", async ({ request, baseURL }) => {
  const resolvedBaseUrl = baseURL || "https://modcrosschain-production.up.railway.app";
  const response = await request.get(new URL("/api/infra/rpc-health", resolvedBaseUrl).toString());

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as {
    configuredCount?: number;
    profile?: string;
    results?: unknown[];
    thresholds?: { blockThresholdMs?: number; slowThresholdMs?: number; timeoutMs?: number };
    totalCount?: number;
  };

  expect(payload.totalCount).toBe(6);
  expect(Array.isArray(payload.results)).toBeTruthy();

  if (payload.profile) {
    expect(payload.profile).toMatch(/development|production/);
  }

  if (payload.thresholds) {
    expect(payload.thresholds.timeoutMs).toBeGreaterThan(0);
    expect(payload.thresholds.slowThresholdMs).toBeGreaterThan(0);
    expect(payload.thresholds.blockThresholdMs).toBeGreaterThan(payload.thresholds.slowThresholdMs ?? 0);
  }
});

test("production landing page responds", async ({ page }) => {
  await page.goto(pagesUrl, { waitUntil: "domcontentloaded" });

  const hero = page.locator(".hero");

  await expect(page).toHaveTitle(/modCrossChain/i);
  await expect(page.locator("body")).toContainText("modCrossChain");
  await expect(hero).toContainText("Cross-chain execution with one clear decision surface.");
  await expect(hero.getByRole("link", { name: /Open live app/i })).toBeVisible();
});

test("production admin fee summary responds when a token is provided", async ({ page, baseURL }) => {
  test.skip(!adminToken, "PLAYWRIGHT_PROD_ADMIN_TOKEN is not configured.");
  const resolvedBaseUrl = baseURL || "https://modcrosschain-production.up.railway.app";

  await page.goto(new URL(`/admin/lifi?token=${encodeURIComponent(adminToken!)}`, resolvedBaseUrl).toString(), {
    waitUntil: "domcontentloaded",
  });

  await expect(page.getByRole("heading", { name: "Collected / ready / blocked" })).toBeVisible();
  await expect(page.getByText("Collected")).toBeVisible();
  await expect(page.getByText("Withdraw ready")).toBeVisible();
  await expect(page.getByText("Blocked")).toBeVisible();
});
