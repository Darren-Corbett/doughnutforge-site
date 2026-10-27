// The visitor's own platform first: a small inline script after each platform
// list moves the visitor's platform, if it is on sale, to the front, before the
// page is drawn. iPadOS calls itself a Mac, so a "Mac" with a touch screen is an
// iPad. Nothing is hidden, nothing is stored or fetched, and without the script
// (or if it fails) everyone gets the fixed mobile-first order.
import { expect, test, type Browser, type Page } from "@playwright/test";

const SAFARI_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const VISITORS = [
  { name: "iPhone", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", touch: 5, first: "ios" },
  // iPadOS asks for desktop pages and sends a Mac's user agent
  { name: "iPad", ua: SAFARI_MAC, touch: 5, first: "ios" },
  // Not on sale yet, so Android visitors get the fixed order
  { name: "Android", ua: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36", touch: 5, first: "ios" },
  { name: "Mac", ua: SAFARI_MAC, touch: 0, first: "mac" },
  { name: "Windows", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", touch: 0, first: "windows" },
  { name: "an unknown platform", ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", touch: 0, first: "ios" },
];
const CARDS = ["ios", "mac", "windows", "android", "linux"];
const BADGES = ["ios", "mac", "windows"];
const WIDTHS = [320, 1280];

/** The fixed order with one platform moved to the front */
const withFirst = (order: string[], first: string) => [first, ...order.filter((p) => p !== first)];

/**
 * A visitor on a platform: its user agent and touch points, a note of when the
 * list was reordered, and the page's layout shifts and errors
 */
const visit = async (browser: Browser, ua: string, touch: number, width: number) => {
  const context = await browser.newContext({ userAgent: ua, viewport: { width, height: 800 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript((points: number) => {
    Object.defineProperty(Navigator.prototype, "maxTouchPoints", { get: () => points });
    const w = window as unknown as { moved?: number; shift: number };
    w.shift = 0;
    const prepend = Element.prototype.prepend;
    Element.prototype.prepend = function (...nodes) {
      w.moved = performance.now();
      return prepend.apply(this, nodes);
    };
    if (PerformanceObserver.supportedEntryTypes.includes("layout-shift"))
      new PerformanceObserver((list) => list.getEntries().forEach((e) => (w.shift += (e as unknown as { value: number }).value))).observe({ type: "layout-shift", buffered: true });
  }, touch);
  return { page, errors, close: () => context.close() };
};

/** The platform of each item in a list, in page order */
const orderOf = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) => els.map((e) => e.getAttribute("data-platform")!));

for (const v of VISITORS) {
  for (const width of WIDTHS) {
    test(`${v.name} at ${width}px sees ${v.first} first`, async ({ browser }) => {
      const { page, errors, close } = await visit(browser, v.ua, v.touch, width);
      for (const path of ["/download/", "/pricing/", "/de/download/"]) {
        await page.goto(path, { waitUntil: "load" });
        // Every platform is still there; only the order changes
        expect(await orderOf(page, ".cards > [data-platform]"), `${path} cards`).toEqual(withFirst(CARDS, v.first));
      }
      await page.goto("/", { waitUntil: "load" });
      // Each badge moves with its second badge and text link, in that order
      expect(await orderOf(page, "[data-platform]"), "home badges").toEqual(withFirst(BADGES, v.first).flatMap((p) => [p, p, p]));
      // Moved before the page was first drawn, so nothing jumps
      const timing = await page.evaluate(() => ({
        moved: (window as unknown as { moved?: number }).moved,
        paint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
        shift: (window as unknown as { shift: number }).shift,
      }));
      if (timing.moved !== undefined && timing.paint !== undefined) expect(timing.moved, "reordered before the first paint").toBeLessThan(timing.paint);
      expect(timing.shift, "no layout shift").toBe(0);
      expect(errors).toEqual([]);
      await close();
    });
  }
}

test("if the platform cannot be read, the page keeps the fixed order", async ({ browser }) => {
  const { page, errors, close } = await visit(browser, SAFARI_MAC, 0, 1280);
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, "userAgent", { get: () => { throw new Error("blocked"); } }));
  await page.goto("/download/", { waitUntil: "load" });
  expect(await orderOf(page, ".cards > [data-platform]")).toEqual(CARDS);
  expect(errors).toEqual([]);
  await close();
});

test("search engines and pages without scripts get the fixed order", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: SAFARI_MAC, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/download/");
  expect(await orderOf(page, ".cards > [data-platform]")).toEqual(CARDS);
  await context.close();
});

test("a blocker that hides the badges still shows the visitor's own platform first", async ({ browser }) => {
  const { page, close } = await visit(browser, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", 0, 1280);
  await page.addInitScript(() =>
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = 'a[href^="https://apps."] { display: none !important; }';
      document.head.append(style);
    }),
  );
  await page.goto("/", { waitUntil: "load" });
  await page.locator('[data-get="art"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  expect(await orderOf(page, '[data-get="art"]:not([hidden])')).toEqual(["windows", "ios", "mac"]);
  await close();
});
