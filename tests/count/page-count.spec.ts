// The page script (src/components/PageCount.astro) on the copy of the site with
// the counter on: one beacon per view, with the path and the referring site's
// domain only; one per store tap; nothing stored on the device; nothing at all
// with Do Not Track or Global Privacy Control, or off the live site.
import { type Page } from "@playwright/test";
import { expect, test } from "../support/browser";
import { readdirSync } from "node:fs";
import { bodies, COUNTER, serveSite, SITE, SITE_DIR, type Beacon } from "./site";

// Long enough for a beacon that is going to be sent to arrive
const settle = (page: Page) => page.waitForTimeout(750);
const views = (beacons: Beacon[]) => bodies(beacons).filter((b) => "p" in b);
const taps = (beacons: Beacon[]) => bodies(beacons).filter((b) => "s" in b);

const STORE_LINKS = {
  "app-store": "https://apps.apple.com/app/id6821344597",
  "mac-app-store": "https://apps.apple.com/app/id6812778888",
  "microsoft-store": "https://apps.microsoft.com/detail/9P25BS9L8LNB",
  "google-play": "https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile",
};

test.describe("a page view", () => {
  test("sends one beacon to the counter with the path, as plain text", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/features/`);
    await expect.poll(() => beacons.length).toBe(1);
    await settle(page);
    expect(beacons).toEqual([{ url: `${COUNTER}/hit`, method: "POST", type: "text/plain;charset=UTF-8", body: '{"p":"/features/","r":"direct"}' }]);
  });

  test("sends the path without the query string or anchor", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/features/?utm_source=newsletter#top`);
    await expect.poll(() => views(beacons)).toEqual([{ p: "/features/", r: "direct" }]);
  });

  test("sends only the referring site's domain, without www", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/`, { referer: "https://www.google.com/search?q=private+words" });
    await expect.poll(() => views(beacons)).toEqual([{ p: "/", r: "google.com" }]);
    expect(beacons[0].body).not.toContain("search");
    expect(beacons[0].body).not.toContain("private");
  });

  test("marks a visit from another page of the site as internal", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/`);
    await page.locator('footer a[href="/features/"]').click();
    await page.waitForURL(`${SITE}/features/`);
    await expect.poll(() => views(beacons)).toEqual([
      { p: "/", r: "direct" },
      { p: "/features/", r: "internal" },
    ]);
  });

  test("sets no cookie and stores nothing on the device", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/download/`);
    await page.locator(`a[href^="${STORE_LINKS["app-store"]}"]`).first().click();
    await expect.poll(() => beacons.length).toBe(2);
    await settle(page);
    expect(await context.cookies()).toEqual([]);
    const stored = await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: (await indexedDB.databases?.())?.length ?? 0,
    }));
    expect(stored).toEqual({ local: 0, session: 0, databases: 0 });
  });
});

test.describe("no beacon at all", () => {
  test("with Do Not Track on", async ({ context, page }) => {
    await context.addInitScript(() => Object.defineProperty(Navigator.prototype, "doNotTrack", { get: () => "1" }));
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/download/`);
    await page.locator(`a[href^="${STORE_LINKS["app-store"]}"]`).first().click();
    await settle(page);
    expect(beacons).toEqual([]);
  });

  test("with Global Privacy Control on", async ({ context, page }) => {
    await context.addInitScript(() => Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true }));
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/download/`);
    await page.locator(`a[href^="${STORE_LINKS["app-store"]}"]`).first().click();
    await settle(page);
    expect(beacons).toEqual([]);
  });

  for (const origin of ["http://localhost:4321", "http://127.0.0.1:4329", "https://doughnut-forge.app.example.com"])
    test(`on any other address: ${origin}`, async ({ context, page }) => {
      const { beacons } = await serveSite(context, { origin });
      await page.goto(`${origin}/download/`);
      await page.locator(`a[href^="${STORE_LINKS["app-store"]}"]`).first().click();
      await settle(page);
      expect(beacons).toEqual([]);
    });

  test("on the /go/ pages that hand over to a store", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    const [code] = readdirSync(`${SITE_DIR}go`);
    const [lang] = readdirSync(`${SITE_DIR}go/${code}`);
    await page.goto(`${SITE}/go/${code}/${lang}/`, { waitUntil: "domcontentloaded" });
    await settle(page);
    expect(beacons).toEqual([]);
    // Its forward to the store is held back (site.ts)
    expect(page.url()).toBe(`${SITE}/go/${code}/${lang}/`);
  });
});

test.describe("a store tap", () => {
  for (const [store, href] of Object.entries(STORE_LINKS))
    test(`on the ${store} badge sends one beacon naming the store`, async ({ context, page }) => {
      const { beacons } = await serveSite(context);
      await page.goto(`${SITE}/download/`);
      await page.locator(`a[href^="${href}"]`).first().click();
      await expect.poll(() => taps(beacons)).toEqual([{ s: store }]);
      await settle(page);
      expect(taps(beacons)).toEqual([{ s: store }]);
      // The store itself is never opened (support/no-stores.ts)
      expect(context.pages()).toHaveLength(1);
      expect(page.url()).toBe(`${SITE}/download/`);
    });

  test("on the fallback link to a /go/ page counts as a tap on that store", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/download/`);
    // The fallback shows only when a blocker hides the badge, so it is clicked directly
    await page.locator('[data-get="text"][data-platform="ios"] a').first().evaluate((a: HTMLAnchorElement) => a.click());
    await expect.poll(() => taps(beacons)).toEqual([{ s: "app-store" }]);
    expect(context.pages()).toHaveLength(1);
  });

  test("is not counted for any other link", async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    await page.goto(`${SITE}/download/`);
    await page.locator('footer a[href="/privacy/"]').click();
    await page.waitForURL(`${SITE}/privacy/`);
    await settle(page);
    expect(taps(beacons)).toEqual([]);
  });
});
