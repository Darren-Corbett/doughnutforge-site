// The 404 page: the heading is always the real text, in the HTML and for screen
// readers; the scramble is a decorative overlay that plays once and goes, never
// with reduced motion or without JavaScript; the padlock picture is inline and small.
import { expect, test } from "@playwright/test";
import english from "../../src/i18n/ui/en";

// Read as plain strings, so copy changed with this test checks before it exists
const en = english as Record<string, string>;
const PAGE = "/404.html";

test("the heading is the final text without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(PAGE);
  await expect(page.locator("h1")).toHaveText(en["notFound.title"]!);
  await expect(page.getByText(en["notFound.lead"]!)).toBeVisible();
  await expect(page.locator("[data-scramble]")).toHaveCount(0);
  await context.close();
});

test("with reduced motion there is no scramble and the padlock does not move", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(PAGE);
  await expect(page.locator("h1")).toHaveText(en["notFound.title"]!);
  await expect(page.locator("[data-scramble]")).toHaveCount(0);
  const animation = await page.locator(".shackle").evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  await context.close();
});

test("the scramble is hidden from screen readers and plays once", async ({ page }) => {
  await page.goto(PAGE);
  const overlay = page.locator("[data-scramble]");
  // It may already be gone on a slow start; when it is there, it is aria-hidden
  if (await overlay.count()) await expect(overlay).toHaveAttribute("aria-hidden", "true");
  await expect(overlay).toHaveCount(0, { timeout: 2500 });
  await expect(page.locator("h1")).toHaveText(en["notFound.title"]!);
  await expect(page.locator("h1")).toBeVisible();
});

test("the padlock picture is inline, decorative and small", async ({ page }) => {
  await page.goto(PAGE);
  const svg = page.locator("main svg.lock-icon");
  await expect(svg).toHaveCount(1);
  await expect(svg).toHaveAttribute("aria-hidden", "true");
  const markup = await svg.evaluate((el) => el.outerHTML);
  expect(new TextEncoder().encode(markup).length).toBeLessThan(3072);
  expect(markup).not.toMatch(/href=|url\(http/);
  await expect(page.locator("main img")).toHaveCount(0);
});
