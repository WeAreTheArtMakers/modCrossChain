import { expect, test, type Page, type Route } from "@playwright/test";

const sourceToken = {
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chainId: 1,
  coinKey: "USDC",
  decimals: 6,
  logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg",
  name: "USD Coin",
  symbol: "USDC",
};

const destinationToken = {
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  chainId: 56,
  coinKey: "USDC",
  decimals: 18,
  logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg",
  name: "USD Coin",
  symbol: "USDC",
};

test("renders the bridge surface and disconnected state", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Bridge" })).toBeVisible();
  await expect(page.getByText("Connect a wallet to request a bridge route.")).toBeVisible();
  await expect(page.locator("header").getByRole("button", { name: "Connect wallet" })).toBeVisible();
});

test("shows no-route feedback from the LI.FI proxy", async ({ page }) => {
  await mockTokenSearch(page);
  await page.route("**/api/lifi/routes", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ error: "No route found for this token, amount, and chain pair." }),
      contentType: "application/json",
      status: 502,
    });
  });

  await page.goto("/?autoconnect=mock", { waitUntil: "domcontentloaded" });
  await waitForMockWallet(page);
  await selectToken(page);
  await page.getByPlaceholder("0.00").fill("25");

  await expect(page.getByText("No LI.FI route is available for this token, amount, and chain pair.")).toBeVisible();
});

test("retries after a failed mock execution and completes on refresh", async ({ page }) => {
  await mockTokenSearch(page);

  let quoteCount = 0;
  await page.route("**/api/lifi/routes", async (route) => {
    quoteCount += 1;
    await fulfillRouteQuote(route, quoteCount === 1 ? createMockRoute("mock-failure-1") : createMockRoute("mock-success-2"));
  });

  await page.goto("/?autoconnect=mock", { waitUntil: "domcontentloaded" });
  await waitForMockWallet(page);
  await selectToken(page);
  await page.getByPlaceholder("0.00").fill("25");

  await expect(page.getByRole("button", { name: "Bridge Now" })).toBeEnabled();
  await page.getByRole("button", { name: "Bridge Now" }).click();

  await expect(page.getByRole("heading", { name: "Bridge failed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh quote and retry" })).toBeVisible();

  await page.getByRole("button", { name: "Refresh quote and retry" }).click();

  await expect(page.getByRole("heading", { name: "Bridge complete" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open explorer" })).toBeVisible();
});

async function waitForMockWallet(page: Page) {
  const header = page.locator("header");
  const connected = header.getByRole("button", { name: /0xa11c/i });

  const alreadyConnected = await connected.isVisible().catch(() => false);
  if (alreadyConnected) {
    return;
  }

  const connectedAfterAutoConnect = await connected
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (connectedAfterAutoConnect) {
    return;
  }

  const connectButton = header.getByRole("button", { name: "Connect wallet" });
  if (await connectButton.isVisible().catch(() => false)) {
    await connectButton.click();

    const connectedAfterClick = await connected
      .waitFor({ state: "visible", timeout: 1_500 })
      .then(() => true)
      .catch(() => false);

    if (!connectedAfterClick) {
      const mockConnectorButton = page.getByRole("button", { name: /Test wallet/i });
      if (await mockConnectorButton.isVisible().catch(() => false)) {
        await mockConnectorButton.click();
      }
    }
  }

  await expect(connected).toBeVisible();
}

async function selectToken(page: Page) {
  await page.getByRole("button", { name: /Select token on/i }).click();
  await page.getByRole("button", { name: /USDC USD Coin/i }).click();
}

async function mockTokenSearch(page: Page) {
  await page.route("**/api/lifi/tokens**", async (route) => {
    await route.fulfill({
      body: JSON.stringify([sourceToken]),
      contentType: "application/json",
      status: 200,
    });
  });
}

async function fulfillRouteQuote(route: Route, mockRoute: ReturnType<typeof createMockRoute>) {
  await route.fulfill({
    body: JSON.stringify({
      bestRoute: mockRoute,
      comparisons: {
        BEST_RECEIVED: { ...mockRoute, id: `${mockRoute.id}-best`, toAmount: mockRoute.toAmount, toAmountUSD: mockRoute.toAmountUSD },
        CHEAPEST: mockRoute,
        FASTEST: { ...mockRoute, id: `${mockRoute.id}-fast`, gasCostUSD: "0.40", toAmount: "24650000", toAmountUSD: "24.65" },
      },
      destinationToken,
      routes: [mockRoute],
    }),
    contentType: "application/json",
    status: 200,
  });
}

function createMockRoute(id: string) {
  return {
    containsSwitchChain: false,
    fromAddress: "0xA11cE00000000000000000000000000000000001",
    fromAmount: "25000000",
    fromAmountUSD: "25.00",
    fromChainId: 1,
    fromToken: sourceToken,
    gasCostUSD: "0.45",
    id,
    insurance: {
      feeAmountUsd: "0",
      state: "NOT_INSURABLE",
    },
    steps: [
      {
        action: {
          fromAddress: "0xA11cE00000000000000000000000000000000001",
          fromAmount: "25000000",
          fromChainId: 1,
          fromToken: sourceToken,
          slippage: 0.005,
          toAddress: "0xA11cE00000000000000000000000000000000001",
          toChainId: 56,
          toToken: destinationToken,
        },
        estimate: {
          approvalAddress: "0x1111111111111111111111111111111111111111",
          executionDuration: 480,
          feeCosts: [
            {
              amount: "120000",
              amountUSD: "0.12",
              description: "Bridge fee",
              included: true,
              name: "Bridge Fee",
              percentage: "0.0048",
              token: sourceToken,
            },
          ],
          fromAmount: "25000000",
          fromAmountUSD: "25.00",
          gasCosts: [],
          toAmount: "24700000",
          toAmountMin: "24000000",
          toAmountUSD: "24.70",
          tool: "Across",
        },
        executionType: "transaction",
        id: "step-1",
        includedSteps: [
          {
            action: {
              fromAddress: "0xA11cE00000000000000000000000000000000001",
              fromAmount: "25000000",
              fromChainId: 1,
              fromToken: sourceToken,
              slippage: 0.005,
              toAddress: "0xA11cE00000000000000000000000000000000001",
              toChainId: 56,
              toToken: destinationToken,
            },
            estimate: {
              approvalAddress: "0x1111111111111111111111111111111111111111",
              executionDuration: 480,
              feeCosts: [],
              fromAmount: "25000000",
              fromAmountUSD: "25.00",
              gasCosts: [],
              toAmount: "24700000",
              toAmountMin: "24000000",
              toAmountUSD: "24.70",
              tool: "Across",
            },
            id: "nested-1",
            tool: "across",
            toolDetails: {
              key: "across",
              logoURI: "https://li.fi/logo/across.png",
              name: "Across",
            },
            type: "cross",
          },
        ],
        tool: "lifi",
        toolDetails: {
          key: "lifi",
          logoURI: "https://li.fi/logo/lifi.png",
          name: "LI.FI",
        },
        type: "lifi",
      },
    ],
    tags: ["CHEAPEST"],
    toAddress: "0xA11cE00000000000000000000000000000000001",
    toAmount: "24700000",
    toAmountMin: "24000000",
    toAmountUSD: "24.70",
    toChainId: 56,
    toToken: destinationToken,
  };
}
