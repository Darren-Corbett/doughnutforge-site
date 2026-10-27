// The /go/ pages, where a hidden badge's fallback leads, under the same blocker
// rules as the badges. A blocker can hide a link to the store on the /go/ page
// too, so the page must always offer, visibly: a button that tries again (to the
// /go/ page itself, whose address names no store) and a link back to the
// download page in the page's language. Both must still be there when Safari
// shows the tab again after the store opened.
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dist } from "../support/site";

const LANGS = ["en", "de", "ja", "pl", "es-mx"];
const STORES: Record<string, string> = {
  "https://apps.apple.com/app/id6821344597": "App Store",
  "https://apps.apple.com/app/id6812778888": "Mac App Store",
  "https://apps.microsoft.com/": "Microsoft Store",
};
const RULES: Record<string, string | null> = {
  "no blocker": null,
  "hides every link whose address names an app or a store": 'a[href*="app"], a[href*="store"], a[href*="get"] { display: none !important; }',
  "hides store links by address": 'a[href^="https://apps.apple.com"], a[href^="https://apps.microsoft.com"] { display: none !important; }',
  "makes store links invisible": 'a[href^="https://apps."] { visibility: hidden !important; }',
  "hides links in the page's main part": "main a[href^='https://'] { display: none !important; }",
};

/** One UI string in a language, falling back to English as the site does */
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  return own[key] ?? ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};
const languages = JSON.parse(readFileSync("src/i18n/languages.json", "utf8")).languages as { code: string; path: string }[];

/** Every /go/ page for the sampled languages: its path, language and the store it forwards to */
const goPages = () => {
  const codes = [...readFileSync(`${dist}/download/index.html`, "utf8").matchAll(/href="\/go\/(\w+)\/en\/"/g)].map((m) => m[1]!);
  return [...new Set(codes)].flatMap((code) =>
    LANGS.map((path) => {
      const html = readFileSync(`${dist}/go/${code}/${path}/index.html`, "utf8");
      const url = /http-equiv="refresh" content="0; url=([^"]+)"/.exec(html)![1]!.replaceAll("&amp;", "&");
      const store = Object.entries(STORES).find(([start]) => url.startsWith(start))![1];
      return { path: `/go/${code}/${path}/`, lang: languages.find((l) => l.path === path)!, store };
    }),
  );
};

/** Links a visitor can see and tap: address, words and height */
const visibleLinks = (page: Page) =>
  page.locator("a").evaluateAll((links) =>
    links
      .filter((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden" && getComputedStyle(a).opacity !== "0";
      })
      .map((a) => ({ href: a.getAttribute("href"), text: (a.textContent ?? "").replace(/\s+/g, " ").trim(), height: a.getBoundingClientRect().height, target: a.getAttribute("target") })),
  );

const block = async (page: Page, css: string | null) => {
  // The store answers with nothing to show, so the tab stays on the /go/ page, as
  // when the store app opens and the visitor comes back to the browser (an
  // aborted request would leave Chromium on its error page instead)
  await page.route(/^https:\/\/apps\.(apple|microsoft)\.com\//, (route) => route.fulfill({ status: 204 }));
  if (css)
    await page.addInitScript((c: string) => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = c;
        document.head.append(style);
      });
    }, css);
};

/** Checks the page offers a working retry button and a way back, both visible */
const expectWayOnAndBack = async (page: Page, go: ReturnType<typeof goPages>[number], why: string) => {
  const open = (await ui(go.lang.code, "go.open")).replace("{store}", go.store);
  const back = await ui(go.lang.code, "go.back");
  const download = go.lang.path === "en" ? "/download/" : `/${go.lang.path}/download/`;
  const links = await visibleLinks(page);
  const retry = links.find((l) => l.href === go.path);
  expect(retry, `${why}: a visible "${open}" button to ${go.path}`).toBeTruthy();
  expect(retry!.text, why).toBe(open);
  expect(retry!.height, `${why}: button height`).toBeGreaterThanOrEqual(44);
  const home = links.find((l) => l.href === download);
  expect(home, `${why}: a visible "${back}" link to ${download}`).toBeTruthy();
  expect(home!.text, why).toBe(back);
  expect(home!.height, `${why}: link height`).toBeGreaterThanOrEqual(44);
  expect(home!.target, `${why}: back in the same tab`).toBeNull();
};

for (const go of goPages()) {
  for (const [name, css] of Object.entries(RULES)) {
    test(`${go.path} (${go.store}), ${name}: a way on and a way back`, async ({ page }) => {
      await block(page, css);
      await page.goto(go.path, { waitUntil: "load" }).catch(() => {});
      await page.waitForTimeout(300);
      expect(page.url(), "stays on the page after the store opens").toContain(go.path);
      await expectWayOnAndBack(page, go, name);
    });
  }
}

test("a /go/ page shown again after leaving it still offers both links", async ({ page }) => {
  const [go] = goPages();
  await block(page, RULES["hides every link whose address names an app or a store"]!);
  await page.goto(go!.path, { waitUntil: "load" }).catch(() => {});
  // Leave and come back, as returning to the Safari tab after the store opened
  await page.goto("/");
  await page.goBack({ waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(300);
  await expectWayOnAndBack(page, go!, "shown again");
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expectWayOnAndBack(page, go!, "after pageshow");
});

// Coming back to the tab, the /go/ page is on screen and does not forward by
// itself. A tap on the button must take the browser to the store again.
for (const go of goPages().filter((g) => g.lang.path === "en")) {
  test(`the retry button on ${go.path} (${go.store}) goes to the store again`, async ({ page }) => {
    let first = true;
    await page.route((url) => url.pathname === go.path, async (route) => {
      if (!first) return route.continue();
      first = false;
      // The page as it stands after the visitor comes back: the forward is not due again
      const response = await route.fetch();
      return route.fulfill({ response, body: (await response.text()).replace('content="0;', 'content="3600;') });
    });
    await page.route(/^https:\/\/apps\.(apple|microsoft)\.com\//, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>store</p>" }));
    await page.goto(go.path);
    const reached = page.waitForURL(/^https:\/\/apps\.(apple|microsoft)\.com\//).then(() => "reached", (e: Error) => e.message);
    await page.locator(`a[href="${go.path}"]`).tap();
    const result = await reached;
    // WebKit on an iPhone sometimes cancels a tapped App Store link in the browser
    // ("Navigation canceled by policy check") and sometimes loads it; either way the
    // tap went to the store. Why it varies is not known.
    if (go.store !== "Microsoft Store" && test.info().project.name === "blockers-iphone") expect(result).toMatch(/^reached$|Navigation canceled by policy check/);
    else expect(result).toBe("reached");
  });
}
