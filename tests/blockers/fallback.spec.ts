// A visitor whose blocker hides a store badge must still reach the store. No
// blocker's rules are assumed: blockers hide badges in ways no one can predict
// (AdGuard's defaults hid the Mac badge on an iPhone, and no published list
// explains it), so each way a badge can be hidden is simulated: hidden, made
// zero size or invisible, its image hidden by its description or its request
// blocked, its container hidden, removed from the page, or hidden a moment after
// load. In each case a second branded badge, the same official artwork under a
// neutral name, must show in its place and lead to the store through the site's
// /go/ page. Only if that is hidden too does the plain text link show. Without a
// blocker, nothing changes.
import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dist } from "../support/site";
import { BOTH, block, RULES } from "./simulations";

const PAGES = ["/", "/pricing/", "/download/", "/de/download/", "/es-mx/pricing/", "/ja/"];
const STORE = /^https:\/\/apps\.(apple|microsoft)\.com\//;
/** Words blockers look for in a store badge's address, file, description or names */
const STORE_WORDS = /apple|microsoft|google|play|store|badge|itunes|download|(^|[^a-z])app([^a-z]|$)/i;

/** The store badges a page is built with: link address, wording and image file, from dist/ */
const badgesOf = (path: string) => {
  const html = readFileSync(`${dist}${path}index.html`, "utf8");
  return [...html.matchAll(/<a href="(https:\/\/apps\.[^"]+)"[^>]*><img src="([^"]+)"[^>]*alt="([^"]+)"/g)].map((m) => ({
    url: m[1]!.replaceAll("&amp;", "&"),
    src: m[2]!,
    alt: m[3]!,
  }));
};

type Seen = { href: string; text: string; name: string; img: string | null; target: string | null; names: string };

/**
 * Links a visitor can see and tap: address, the words seen, the name a screen
 * reader hears, and the image drawn (its address), if any
 */
const visibleLinks = (page: Page): Promise<Seen[]> =>
  page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .filter((a) => {
        const r = a.getBoundingClientRect();
        const img = a.querySelector("img");
        let shown = true;
        for (let e: Element | null = a; e; e = e.parentElement) if (getComputedStyle(e).opacity === "0") shown = false;
        const onPage = r.right + scrollX > 0 && r.bottom + scrollY > 0;
        const drawn = shown && onPage && r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden";
        // A badge counts only if its image is drawn and did not fail: its screen-reader text is not seen
        return drawn && (!img || (img.getBoundingClientRect().width > 0 && !(img.complete && img.naturalWidth === 0)));
      })
      .map((a) => {
        // The words a visitor sees: the whole text (Japanese has <wbr> break points), without the screen-reader note
        const seen = a.cloneNode(true) as HTMLElement;
        seen.querySelectorAll(".sr-only").forEach((e) => e.remove());
        const img = a.querySelector("img");
        // Every attribute on the link, its image and what holds it (address, file, classes, data), for the naming test
        const names = [a, img, a.parentElement]
          .filter((e): e is Element => Boolean(e))
          .flatMap((e) => [...e.attributes].map((x) => `${x.name}=${x.value}`))
          .join(" ");
        const alt = img?.getAttribute("alt") ?? "";
        return {
          href: a.getAttribute("href")!,
          text: (seen.textContent ?? "").replace(/\s+/g, " ").trim(),
          name: `${alt} ${a.textContent ?? ""}`.replace(/\s+/g, " ").trim(),
          img: img ? img.getAttribute("src") : null,
          target: a.getAttribute("target"),
          names,
        };
      }),
  );

/** The "(opens in a new tab)" note in the page's language, as the official badge carries it */
const newTabNote = (page: Page) => page.locator('a[href^="https://apps."] .sr-only').first().textContent();

/**
 * Opens a page and scrolls to its badges, as a visitor would, so the lazy
 * images there load (the official ones, then any second badge shown in their
 * place), then waits for the fallback's last check
 */
const visit = async (page: Page, path: string, wait: number) => {
  // The first badge, or fallback, that takes up space on the page
  const toBadges = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('a[href^="https://apps."], [data-get]')].find((e) => e.getClientRects().length)?.scrollIntoView({ block: "center" }),
    );
  await page.goto(path, { waitUntil: "load" });
  await toBadges();
  await page.waitForTimeout(500);
  // Again, once a second badge has taken the first one's place
  await toBadges();
  await page.waitForTimeout(wait);
};

const sha = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

for (const path of PAGES) {
  test(`${path}: without a blocker, the badges show and no fallback does`, async ({ page }) => {
    const badges = badgesOf(path);
    expect(badges.length, "store badges on the page").toBeGreaterThan(0);
    await visit(page, path, 2500);
    const links = await visibleLinks(page);
    for (const b of badges) expect(links.some((l) => l.href === b.url), `${b.alt} badge shows`).toBe(true);
    expect(links.filter((l) => l.href.startsWith("/go/")), "no second badge and no text link").toEqual([]);
  });

  for (const rule of RULES) {
    test(`${path}: a blocker that ${rule.name} gets a second branded badge to each store`, async ({ page }) => {
      const badges = badgesOf(path);
      await block(page, rule);
      await visit(page, path, (rule.delay ?? 0) + 4500);
      const note = rule.remove ? null : await newTabNote(page);
      const links = await visibleLinks(page);
      expect(links.filter((l) => STORE.test(l.href)), "the blocker hid every store link").toEqual([]);
      for (const b of badges) {
        const second = links.find((l) => l.href.startsWith("/go/") && l.img && l.name.startsWith(b.alt));
        expect(second, `a second "${b.alt}" badge, drawn, to /go/`).toBeTruthy();
        expect(second!.target, "opens in a new tab").toBe("_blank");
        if (note) expect(second!.name, "a screen reader hears the wording and the new-tab note").toBe(`${b.alt} ${note}`);
        // The same official artwork, byte for byte, under a name blockers do not look for
        expect(sha(`${dist}${second!.img}`), "the official artwork, unaltered").toBe(sha(`${dist}${b.src}`));
        expect(second!.names, "no attribute names a store: address, file, classes or data").not.toMatch(STORE_WORDS);
        expect(links.filter((l) => l.href === second!.href && !l.img), "no text link while the badge shows").toEqual([]);
        // The /go/ page sends the visitor on to exactly the badge's store page
        const html = readFileSync(`${dist}${second!.href}index.html`, "utf8");
        expect(html, "forwards at once").toContain(`<meta http-equiv="refresh" content="0; url=${b.url.replaceAll("&", "&amp;")}">`);
        // A link straight to the store can be hidden too, so the button to tap tries this page again
        expect(html, "with a button to tap if it does not").toContain(`href="${second!.href}"`);
        expect(html, "never indexed").toContain('<meta name="robots" content="noindex">');
      }
    });
  }

  for (const rule of BOTH) {
    test(`${path}: a blocker that ${rule.name} still leaves a text link to each store`, async ({ page }) => {
      const badges = badgesOf(path);
      await block(page, rule);
      await visit(page, path, 4500);
      const links = await visibleLinks(page);
      for (const b of badges) {
        const text = links.find((l) => l.href.startsWith("/go/") && !l.img && l.text === b.alt);
        expect(text, `a visible "${b.alt}" text link to /go/`).toBeTruthy();
        expect(text!.target, "opens in a new tab").toBe("_blank");
        expect(text!.names, "no attribute names a store").not.toMatch(STORE_WORDS);
      }
    });
  }
}

test("the text link marks only the badge's English wording as English", async ({ page }) => {
  // Polish has no Mac App Store badge of its own, so the wording is English; the new-tab note is Polish
  await page.goto("/pl/download/", { waitUntil: "load" });
  const links = page.locator('[data-get] a').filter({ hasText: "Mac App Store" });
  expect(await links.count(), "a second badge and a text link").toBe(2);
  for (const link of await links.all()) {
    expect(await link.getAttribute("lang"), "the link itself keeps the page language").toBeNull();
    await expect(link.locator('[lang="en"]'), "the wording is marked English").toHaveText("Download on the Mac App Store");
    const note = link.locator(".sr-only").last();
    expect(await note.evaluate((e) => e.closest("[lang]")?.getAttribute("lang")), "the note is read in Polish").toBe("pl");
  }
});

test("a /go/ page has a main, one h1 and links at least 44px tall", async ({ page }) => {
  const goPages = ["/download/", "/de/download/"].flatMap((path) =>
    [...readFileSync(`${dist}${path}index.html`, "utf8").matchAll(/href="(\/go\/[^"]+)"/g)].map((m) => `${m[1]!.slice(1)}index.html`),
  );
  expect(goPages.length, "fallback links on the download pages").toBeGreaterThan(0);
  for (const file of new Set(goPages)) {
    // Without the forward, so the page itself can be measured
    const html = readFileSync(`${dist}/${file}`, "utf8").replace(/<meta http-equiv="refresh"[^>]*>/, "");
    await page.setContent(html);
    await expect(page.locator("main"), file).toHaveCount(1);
    await expect(page.locator("h1"), file).toHaveCount(1);
    const links = await page.locator("main a").all();
    expect(links.length, `${file}: a button on and a link back`).toBe(2);
    for (const link of links) expect((await link.boundingBox())!.height, `${file}: link height`).toBeGreaterThanOrEqual(44);
  }
});

test("the iPhone and iPad artwork is built for the second badge", () => {
  // When iOS goes on sale (src/data/stores.ts), its second badge must already exist
  const built = new Set(readdirSync(`${dist}/s`).map((f) => f.replace(/\.svg$/, "")));
  for (const file of readdirSync("src/assets/badges/app-store")) {
    const hash = sha(`src/assets/badges/app-store/${file}`).slice(0, 12);
    expect(built.has(hash), `app-store/${file} as /s/${hash}.svg`).toBe(true);
  }
});

test("a /go/ page takes the browser to each store", async ({ page }) => {
  const badges = badgesOf("/download/");
  // Mac, Windows, and iPhone and iPad
  expect(badges.map((b) => b.url)).toContain("https://apps.apple.com/app/id6821344597");
  await page.route(STORE, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>store</p>" }));
  await block(page, RULES[0]!);
  for (const badge of badges) {
    await page.goto("/download/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const href = (await visibleLinks(page)).find((l) => l.href.startsWith("/go/") && l.name.startsWith(badge.alt))!.href;
    await page.goto(href);
    await page.waitForURL(badge.url);
    expect(page.url()).toBe(badge.url);
  }
});

test("no /go/ page and no second badge file is in the sitemap", () => {
  const sitemap = readFileSync(`${dist}/sitemap-0.xml`, "utf8");
  expect(sitemap).not.toContain("/go/");
  expect(sitemap).not.toContain("/s/");
});
