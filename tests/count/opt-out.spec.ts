// The opt-out on /stats/: one click stores a single flag in localStorage, and the
// page script sends nothing while it is there. If storage cannot be read or
// written, nothing is counted at all. In every language.
import { readFileSync } from "node:fs";
import { expect, test } from "../support/browser";
import { serveSite, SITE, type Beacon } from "./site";

const languages = JSON.parse(readFileSync("src/i18n/languages.json", "utf8")).languages as { code: string; path: string }[];
const prefix = (path: string) => (path === "en" ? "" : `/${path}`);

/** One UI string in a language, falling back to English as the site does */
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  return own[key] ?? ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};

const settle = (page: import("@playwright/test").Page) => page.waitForTimeout(750);
const STORE = 'a[href^="https://apps.apple.com/app/id6821344597"]';
const button = (page: import("@playwright/test").Page) => page.locator("[data-optout] button");

test("after opting out, no page sends anything, not even a store tap", async ({ context, page }) => {
  const { beacons } = await serveSite(context);
  await page.goto(`${SITE}/stats/`);
  await expect.poll(() => beacons.length).toBe(1);
  await page.getByRole("button", { name: "Do not count my visits" }).click();
  await expect(page.locator("[data-optout]")).toContainText("Visits from this browser are not counted.");
  await expect(page.getByRole("button", { name: "Count my visits again" })).toBeVisible();
  await page.goto(`${SITE}/download/`);
  await page.locator(STORE).first().click();
  await settle(page);
  expect(beacons).toHaveLength(1);
});

test("after opting back in, beacons resume", async ({ context, page }) => {
  const { beacons } = await serveSite(context);
  await page.goto(`${SITE}/stats/`);
  await page.getByRole("button", { name: "Do not count my visits" }).click();
  await page.getByRole("button", { name: "Count my visits again" }).click();
  await expect(page.locator("[data-optout]")).toContainText("Visits from this browser are counted.");
  const before = beacons.length;
  await page.goto(`${SITE}/features/`);
  await expect.poll(() => beacons.length).toBe(before + 1);
  expect(JSON.parse(beacons.at(-1)!.body!)).toEqual({ p: "/features/", r: "direct" });
});

test("the choice is the one thing stored: a single flag in localStorage, no cookie", async ({ context, page }) => {
  await serveSite(context);
  await page.goto(`${SITE}/stats/`);
  await page.getByRole("button", { name: "Do not count my visits" }).click();
  const stored = await page.evaluate(() => ({ local: Object.keys(localStorage), session: sessionStorage.length }));
  expect(stored.local).toHaveLength(1);
  expect(stored.session).toBe(0);
  expect(await context.cookies()).toEqual([]);
  await page.getByRole("button", { name: "Count my visits again" }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("the choice is remembered on the next visit to /stats/", async ({ context, page }) => {
  await serveSite(context);
  await page.goto(`${SITE}/stats/`);
  await page.getByRole("button", { name: "Do not count my visits" }).click();
  await page.goto(`${SITE}/stats/`);
  await expect(page.getByRole("button", { name: "Count my visits again" })).toBeVisible();
});

test("when the browser blocks storage, nothing is counted and /stats/ says so", async ({ context, page }) => {
  await context.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    }),
  );
  const { beacons } = await serveSite(context);
  await page.goto(`${SITE}/`);
  await page.goto(`${SITE}/stats/`);
  await settle(page);
  expect(beacons).toEqual([]);
  await expect(page.locator("[data-optout]")).toContainText("Visits from this browser are not counted, because it does not let this site remember your choice.");
  await expect(button(page)).toBeHidden();
});

test("when storing the choice fails, nothing is counted from then on", async ({ context, page }) => {
  const { beacons } = await serveSite(context);
  await page.goto(`${SITE}/stats/`);
  await expect.poll(() => beacons.length).toBe(1);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
    Storage.prototype.getItem = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
  });
  await button(page).click();
  await expect(page.locator("[data-optout]")).toContainText("Visits from this browser are not counted, because it does not let this site remember your choice.");
  // A store tap on this page would be counted if storage were readable
  await page.evaluate(() => {
    const a = Object.assign(document.createElement("a"), { href: "https://apps.apple.com/app/id6821344597", textContent: "store" });
    document.body.append(a);
    a.click();
  });
  await settle(page);
  expect(beacons).toHaveLength(1);
});

for (const { code, path } of languages)
  test(`the opt-out works in ${code}`, async ({ context, page }) => {
    const { beacons } = await serveSite(context);
    const stats = `${SITE}${prefix(path)}/stats/`;
    await page.goto(stats);
    await expect(page.locator("h1")).toHaveText(await ui(code, "stats.title"));
    await expect(button(page)).toHaveText(await ui(code, "stats.optout.off"));
    await button(page).click();
    await expect(button(page)).toHaveText(await ui(code, "stats.optout.on"));
    await expect(page.locator("[data-optout]")).toContainText(await ui(code, "stats.optout.notCounted"));
    const counted: Beacon[] = [...beacons];
    await page.goto(`${SITE}${prefix(path)}/`);
    await settle(page);
    expect(beacons).toEqual(counted);
    await page.goto(stats);
    await button(page).click();
    await expect(button(page)).toHaveText(await ui(code, "stats.optout.off"));
  });
