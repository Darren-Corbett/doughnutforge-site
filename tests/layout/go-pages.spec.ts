// Every /go/ handoff page, in every language and for every store, in both its
// states (opening and come back), fits a 320px phone: nothing wider than the
// screen, no sideways panning, no word wider than its box (words never break),
// and no controls covering each other. The pages are not in the sitemap, so the
// site-wide layout test does not reach them.
import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { installMeasures, measure } from "../support/measure";
import { dist } from "../support/site";

const goPages = readdirSync(`${dist}/go`).flatMap((code) => readdirSync(`${dist}/go/${code}`).map((lang) => `/go/${code}/${lang}/`));
const settle = (page: Page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

test("every store and language has a /go/ page", () => {
  expect(goPages.length).toBe(3 * 30);
});

for (const path of goPages) {
  test(`${path} fits a phone in both states`, async ({ page }) => {
    await page.addInitScript(installMeasures);
    // The forward an hour away, so the page stays as the visitor sees it
    await page.route(path, async (route) => {
      const response = await route.fetch();
      return route.fulfill({ response, body: (await response.text()).replace('content="0;', 'content="3600;') });
    });
    await page.goto(path, { waitUntil: "load" });
    const problems: unknown[] = [];
    for (const state of ["opening", "back"]) {
      if (state === "back") await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 700 });
        await settle(page);
        const tag = `${state} ${width}px`;
        for (const w of await measure(page, "wideElements")) problems.push({ tag, wide: w });
        const s = await measure(page, "sidewaysScroll");
        if (s.scrollWidth > s.clientWidth || s.scrollX > 0) problems.push({ tag, pans: s });
        for (const t of await measure(page, "overflowingText")) problems.push({ tag, text: t });
        for (const o of await measure(page, "overlappingControls")) problems.push({ tag, overlap: o });
      }
    }
    expect(problems).toEqual([]);
  });
}
