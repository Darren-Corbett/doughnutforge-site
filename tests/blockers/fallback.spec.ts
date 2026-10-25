// A visitor whose blocker hides a store badge must still reach the store. Rules
// that no list holds (a person's own rule, or a private list such as 1Blocker's)
// are simulated the ways blockers apply them: hiding the link by its address,
// the image by its description, or the badge's container; removing the link from
// the page; and hiding it a moment after load, as AdGuard's advanced rules do.
// In each case a visible link with the badge's own wording must lead to the
// store through the site's /get/ page. Without a blocker, nothing changes.
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dist } from "../support/site";

const PAGES = ["/", "/pricing/", "/download/", "/de/download/", "/es-mx/pricing/", "/ja/"];
const STORE = /^https:\/\/apps\.(apple|microsoft)\.com\//;

type Rule = { name: string; css?: string; remove?: string; delay?: number };
const RULES: Rule[] = [
  { name: "hides store links by address", css: 'a[href^="https://apps.apple.com"], a[href^="https://apps.microsoft.com"] { display: none !important; }' },
  { name: "hides badge images by their description", css: 'img[alt*="Store"] { display: none !important; }' },
  { name: "hides the badge's container", css: '*:has(> a[href^="https://apps."]) { display: none !important; }' },
  { name: "removes store links from the page", remove: 'a[href^="https://apps."]' },
  { name: "hides store links a second after load", css: 'a[href^="https://apps."] { display: none !important; }', delay: 1000 },
];

/**
 * Applies a rule the way a blocker would: once the page is parsed, before its
 * load event (an init script runs before the document exists, so a style added
 * then is lost), or a while after load
 */
const block = (page: Page, rule: Rule) =>
  page.addInitScript((r: Rule) => {
    const apply = () => {
      if (r.css) {
        const style = document.createElement("style");
        style.textContent = r.css;
        document.head.append(style);
      }
      if (r.remove) document.querySelectorAll(r.remove).forEach((e) => e.remove());
    };
    if (r.delay) addEventListener("load", () => setTimeout(apply, r.delay));
    else document.addEventListener("DOMContentLoaded", apply);
  }, rule);

/** The store badges a page is built with: link address and wording, from dist/ */
const badgesOf = (path: string) => {
  const html = readFileSync(`${dist}${path}index.html`, "utf8");
  return [...html.matchAll(/<a href="(https:\/\/apps\.[^"]+)"[^>]*><img [^>]*alt="([^"]+)"/g)].map((m) => ({ url: m[1]!.replaceAll("&amp;", "&"), alt: m[2]! }));
};

/** Links a visitor can see and tap: address, text and whether it is drawn */
const visibleLinks = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .filter((a) => {
        const r = a.getBoundingClientRect();
        const img = a.querySelector("img");
        const drawn = r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden";
        // A badge counts only if its image is drawn: its screen-reader text is not seen
        return drawn && (!img || img.getBoundingClientRect().width > 0);
      })
      .map((a) => {
        // The words a visitor sees: the whole text (Japanese has <wbr> break points), without the screen-reader note
        const seen = a.cloneNode(true) as HTMLElement;
        seen.querySelectorAll(".sr-only").forEach((e) => e.remove());
        return { href: a.getAttribute("href")!, text: (seen.textContent ?? "").trim() };
      }),
  );

for (const path of PAGES) {
  test(`${path}: without a blocker, the badges show and no fallback link does`, async ({ page }) => {
    const badges = badgesOf(path);
    expect(badges.length, "store badges on the page").toBeGreaterThan(0);
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const links = await visibleLinks(page);
    for (const b of badges) expect(links.some((l) => l.href === b.url), `${b.alt} badge shows`).toBe(true);
    expect(links.filter((l) => l.href.startsWith("/get/")), "no fallback link").toEqual([]);
  });

  for (const rule of RULES) {
    test(`${path}: a blocker that ${rule.name} still leaves a way to each store`, async ({ page }) => {
      const badges = badgesOf(path);
      await block(page, rule);
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout((rule.delay ?? 0) + 2500);
      const links = await visibleLinks(page);
      expect(links.filter((l) => STORE.test(l.href)), "the blocker hid every store link").toEqual([]);
      for (const b of badges) {
        const fallback = links.find((l) => l.href.startsWith("/get/") && l.text === b.alt);
        expect(fallback, `a visible "${b.alt}" link to /get/`).toBeTruthy();
        // The /get/ page sends the visitor on to exactly the badge's store page
        const html = readFileSync(`${dist}${fallback!.href}index.html`, "utf8");
        expect(html, "forwards at once").toContain(`<meta http-equiv="refresh" content="0; url=${b.url.replaceAll("&", "&amp;")}">`);
        expect(html, "with a link to tap if it does not").toContain(`href="${b.url.replaceAll("&", "&amp;")}"`);
        expect(html, "never indexed").toContain('<meta name="robots" content="noindex">');
      }
    });
  }
}

test("a /get/ page takes the browser to the store", async ({ page }) => {
  const [badge] = badgesOf("/download/");
  await page.route(STORE, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>store</p>" }));
  await block(page, RULES[0]!);
  await page.goto("/download/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const href = (await visibleLinks(page)).find((l) => l.href.startsWith("/get/") && l.text === badge!.alt)!.href;
  await page.goto(href);
  await page.waitForURL(badge!.url);
  expect(page.url()).toBe(badge!.url);
});

test("no /get/ page is in the sitemap", () => {
  const sitemap = readFileSync(`${dist}/sitemap-0.xml`, "utf8");
  expect(sitemap).not.toContain("/get/");
});
