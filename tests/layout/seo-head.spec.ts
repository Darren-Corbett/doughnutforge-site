// What search engines and Safari read from the home, features and 404 pages:
// the Smart App Banner points at the iPhone app, the
// structured data names the app as security software and the organisation
// behind it, and the plain summary line shows only where it is translated.
import { expect, test } from "@playwright/test";
import english from "../../src/i18n/ui/en";

// Read as plain strings, so a key added with this test checks before the copy exists
const en = english as Record<string, string>;
// The iPhone and iPad app, as in stores.spec.ts
const IOS_ID = "6821344597";

const jsonLd = async (page: import("@playwright/test").Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => [JSON.parse(s)].flat());

test("home page: Smart App Banner for the iPhone app", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveAttribute("content", `app-id=${IOS_ID}`);
});

test("the Smart App Banner is on the home page only", async ({ page }) => {
  for (const path of ["/features/", "/download/", "/support/", "/de/"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="apple-itunes-app"]'), path).toHaveCount(0);
  }
});

test("home page: SecurityApplication and Organization structured data", async ({ page }) => {
  await page.goto("/");
  const data = await jsonLd(page);
  const app = data.find((d) => d["@type"] === "SoftwareApplication");
  expect(app?.applicationCategory).toBe("SecurityApplication");
  expect(app?.offers).toBeUndefined();
  const org = data.find((d) => d["@type"] === "Organization");
  expect(org).toMatchObject({ name: "Doughnut Forge", url: "https://doughnut-forge.app/", logo: "https://doughnut-forge.app/icon-512.png" });
});

test("home page: the summary line sits under the heading in English only", async ({ page }) => {
  for (const path of ["/", "/en-us/"]) {
    await page.goto(path);
    await expect(page.locator("h1 + p"), path).toHaveText(en["home.summary"]!);
  }
  await page.goto("/de/");
  await expect(page.getByText(en["home.summary"]!)).toHaveCount(0);
});

test("features page: four questions answered, no second FAQPage", async ({ page }) => {
  await page.goto("/features/");
  for (const id of ["offline", "storage", "restore", "subscription"]) {
    await expect(page.locator(`#faq-${id} summary`)).toHaveText(en[`faq.${id}.q`]!);
  }
  await expect(page.locator('a[href="/support/#faq"]')).toHaveText(en["pricing.questionsLink"]!);
  expect((await jsonLd(page)).some((d) => d["@type"] === "FAQPage")).toBe(false);
});

test("404 page: the doughnut copy and four working links", async ({ page, request }) => {
  await page.goto("/404.html");
  await expect(page.locator("h1")).toHaveText(en["notFound.title"]!);
  await expect(page.getByText(en["notFound.lead"]!)).toBeVisible();
  const links = page.locator("main ul a");
  await expect(links).toHaveCount(4);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")!))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});
