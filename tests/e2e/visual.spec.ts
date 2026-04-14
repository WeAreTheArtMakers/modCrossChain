import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

test("app header matches the visual baseline", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("header")).toHaveScreenshot("app-header.png", {
    animations: "disabled",
    caret: "hide",
  });
});

test("docs landing hero matches the visual baseline", async ({ page }) => {
  const docsUrl = pathToFileURL(path.join(process.cwd(), "docs", "index.html")).toString();
  await page.goto(docsUrl, { waitUntil: "domcontentloaded" });

  await expect(page.locator(".hero")).toHaveScreenshot("docs-landing-hero.png", {
    animations: "disabled",
    caret: "hide",
  });
});
