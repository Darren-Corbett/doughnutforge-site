// The /go/ handoff pages, where a hidden badge's fallback leads. On arrival the
// page shows the opening moment while it forwards to the store; when the visitor
// comes back (Safari shows the tab again, the tab comes back into view, or the
// store did not open) it shows the way on (the store badge, or a plain button if
// that is hidden) and a way back to the download page. Under every blocker
// simulation, without JavaScript, and with reduced motion.
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dist } from "../support/site";
import { BOTH, block, RULES, type Rule } from "./simulations";

const LANGS = ["en", "de", "ja", "pl", "es-mx", "th"];
const STORES: Record<string, { name: string; platform: string }> = {
  "https://apps.apple.com/app/id6821344597": { name: "App Store", platform: "iPhone" },
  "https://apps.apple.com/app/id6812778888": { name: "Mac App Store", platform: "Mac" },
  "https://apps.microsoft.com/": { name: "Microsoft Store", platform: "Windows" },
};
const STORE = /^https:\/\/apps\.(apple|microsoft)\.com\//;
const NONE: Rule = { name: "no blocker" };

/** One UI string in a language, falling back to English as the site does */
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  return own[key] ?? ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};
const languages = JSON.parse(readFileSync("src/i18n/languages.json", "utf8")).languages as { code: string; path: string }[];

/** The /go/ pages for the sampled languages: path, language and the store it forwards to */
const goPages = () => {
  const codes = [...readFileSync(`${dist}/download/index.html`, "utf8").matchAll(/href="\/go\/(\w+)\/en\/"/g)].map((m) => m[1]!);
  return [...new Set(codes)].flatMap((code) =>
    LANGS.map((path) => {
      const html = readFileSync(`${dist}/go/${code}/${path}/index.html`, "utf8");
      const url = /http-equiv="refresh" content="0; url=([^"]+)"/.exec(html)![1]!.replaceAll("&amp;", "&");
      const store = Object.entries(STORES).find(([start]) => url.startsWith(start))![1];
      return { path: `/go/${code}/${path}/`, lang: languages.find((l) => l.path === path)!, ...store };
    }),
  );
};
type Go = ReturnType<typeof goPages>[number];

/** Links a visitor can see and tap: address, words, whether its image is drawn, height */
const visibleLinks = (page: Page) =>
  page.locator("a").evaluateAll((links) =>
    links
      .filter((a) => {
        const r = a.getBoundingClientRect();
        let shown = r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden";
        for (let e: Element | null = a; e; e = e.parentElement) if (getComputedStyle(e).opacity === "0") shown = false;
        return shown;
      })
      .map((a) => {
        const img = a.querySelector("img");
        const seen = a.cloneNode(true) as HTMLElement;
        seen.querySelectorAll(".sr-only").forEach((e) => e.remove());
        return {
          href: a.getAttribute("href"),
          text: (seen.textContent ?? "").replace(/\s+/g, " ").trim(),
          drawn: Boolean(img && img.getBoundingClientRect().width > 0 && img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility !== "hidden"),
          height: a.getBoundingClientRect().height,
          target: a.getAttribute("target"),
        };
      }),
  );

/**
 * Serves the /go/ pages with their forward an hour away, so the page stays as the
 * visitor sees it while the store opens and after coming back. A real forward
 * would leave the tab, and a stand-in store answer leaves Chromium with a
 * navigation that never finishes. The forward itself is tested in
 * fallback.spec.ts ("a /go/ page takes the browser to each store").
 */
const stayOnPage = (page: Page) =>
  page.route(
    (url) => url.pathname.startsWith("/go/"),
    async (route) => {
      const response = await route.fetch();
      return route.fulfill({ response, body: (await response.text()).replace('content="0;', 'content="3600;') });
    },
  );

const arrive = (page: Page, path: string) => page.goto(path, { waitUntil: "load" });

/** Safari shows the tab again after the visitor comes back from the store */
const comeBack = (page: Page) => page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));

/** The visible way on (the badge, or the plain button if the badge is hidden) and the way back */
const expectWayOnAndBack = async (page: Page, go: Go, why: string) => {
  const open = (await ui(go.lang.code, "go.open")).replace("{store}", go.name);
  const back = await ui(go.lang.code, "go.back");
  const download = go.lang.path === "en" ? "/download/" : `/${go.lang.path}/download/`;
  const links = await visibleLinks(page);
  const on = links.filter((l) => l.href === go.path && (l.drawn || l.text === open));
  expect(on.length, `${why}: one visible way on to ${go.path}, the badge or "${open}" (${JSON.stringify(links)})`).toBe(1);
  expect(on[0]!.height, `${why}: way on height`).toBeGreaterThanOrEqual(44);
  const home = links.find((l) => l.href === download);
  expect(home, `${why}: a visible "${back}" button to ${download}`).toBeTruthy();
  expect(home!.text, why).toBe(back);
  expect(home!.height, `${why}: back button height`).toBeGreaterThanOrEqual(44);
  expect(home!.target, `${why}: back in the same tab`).toBeNull();
};

for (const go of goPages()) {
  test(`${go.path} (${go.name}) says what it does, in its language`, async ({ page }) => {
    await stayOnPage(page);
    await arrive(page, go.path);
    await comeBack(page);
    const main = page.locator("main");
    await expect(main.locator("[data-go=label]")).toContainText(go.platform);
    await expect(main.locator("h1")).toHaveText(await ui(go.lang.code, "button.getApp"));
    await expect(main.locator("[data-go=line]")).toHaveText((await ui(go.lang.code, "go.tap")).replace("{store}", go.name));
    await expect(main.locator("[data-go=reassure] li")).toHaveText([await ui(go.lang.code, "home.pricing.title"), await ui(go.lang.code, "go.offline")]);
    // A small footer: the logo, home in the same language
    const home = go.lang.path === "en" ? "/" : `/${go.lang.path}/`;
    await expect(page.locator(`footer a[href="${home}"]`)).toHaveCount(1);
  });

  for (const rule of [NONE, ...RULES, ...BOTH]) {
    test(`${go.path} (${go.name}), a blocker that ${rule.name}: a way on and a way back`, async ({ page }) => {
      await block(page, rule);
      await stayOnPage(page);
      await arrive(page, go.path);
      await page.waitForTimeout((rule.delay ?? 0) + 300);
      await comeBack(page);
      await page.waitForTimeout(1500);
      await expectWayOnAndBack(page, go, rule.name);
    });
  }
}

test.describe("states", () => {
  const go = () => goPages()[0]!;

  test("on arrival: the opening moment, while it forwards", async ({ page }) => {
    await stayOnPage(page);
    await arrive(page, go().path);
    await expect(page.locator("[data-go=progress]")).toBeVisible();
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(`main a[href="${go().path}"]`).first()).toBeHidden();
    await expect(page.locator("[data-go=back]")).toBeHidden();
  });

  test("Safari shows the tab again: the way on and the way back", async ({ page }) => {
    await stayOnPage(page);
    await arrive(page, go().path);
    await comeBack(page);
    await expect(page.locator("[data-go=progress]")).toBeHidden();
    await expectWayOnAndBack(page, go(), "pageshow");
  });

  test("the tab comes back into view: the way on and the way back", async ({ page }) => {
    await stayOnPage(page);
    await arrive(page, go().path);
    await page.evaluate(() => {
      for (const state of ["hidden", "visible"]) {
        Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      }
    });
    await expectWayOnAndBack(page, go(), "visibilitychange");
  });

  test("the store did not open: the way on and the way back after a few seconds", async ({ page }) => {
    await stayOnPage(page);
    await arrive(page, go().path);
    await page.waitForTimeout(4000);
    await expectWayOnAndBack(page, go(), "timeout");
  });

  test("leaving and coming back: the way on and the way back", async ({ page }) => {
    await block(page, RULES[0]!);
    await stayOnPage(page);
    await arrive(page, go().path);
    await page.goto("/");
    await page.goBack({ waitUntil: "load" });
    await comeBack(page);
    await page.waitForTimeout(1500);
    await expectWayOnAndBack(page, go(), "back and forth");
  });

  test("reduced motion: the progress bar does not move", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await stayOnPage(page);
    await arrive(page, go().path);
    const moving = await page.locator("[data-go=progress]").evaluate((e) => {
      const after = getComputedStyle(e, "::after");
      return after.animationName !== "none" && parseFloat(after.animationDuration) > 0.01;
    });
    expect(moving).toBe(false);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the page shows the way on and the way back at once", async ({ page }) => {
    const go = goPages()[0]!;
    await stayOnPage(page);
    await arrive(page, go.path);
    await expect(page.locator("[data-go=progress]")).toBeHidden();
    await expectWayOnAndBack(page, go, "no JavaScript");
  });
});

// Coming back to the tab, the page does not forward by itself again. A tap on the
// way on must take the browser to the store.
for (const go of goPages().filter((g) => g.lang.path === "en")) {
  test(`the badge on ${go.path} (${go.name}) goes to the store again`, async ({ page }) => {
    let first = true;
    await page.route((url) => url.pathname === go.path, async (route) => {
      if (!first) return route.continue();
      first = false;
      // The page as it stands after the visitor comes back: the forward is not due again
      const response = await route.fetch();
      return route.fulfill({ response, body: (await response.text()).replace('content="0;', 'content="3600;') });
    });
    await page.route(STORE, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>store</p>" }));
    await page.goto(go.path);
    await comeBack(page);
    const reached = page.waitForURL(STORE).then(() => "reached", (e: Error) => e.message);
    await page.locator(`main a[href="${go.path}"]:visible`).first().tap();
    const result = await reached;
    // WebKit on an iPhone sometimes cancels a tapped App Store link in the browser
    // ("Navigation canceled by policy check") and sometimes loads it; either way the
    // tap went to the store. Why it varies is not known.
    if (go.name !== "Microsoft Store" && test.info().project.name === "blockers-iphone") expect(result).toMatch(/^reached$|Navigation canceled by policy check/);
    else expect(result).toBe("reached");
  });
}
