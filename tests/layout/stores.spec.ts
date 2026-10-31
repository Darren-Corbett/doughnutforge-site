// iPhone and iPad are on sale, and lead: in every language the iPhone and iPad
// card and the home page carry the App Store badge for the iPhone and iPad app,
// never the Mac app's, and the English pages no longer call that app "coming soon".
import { expect, test } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
const IOS = 'a[href="https://apps.apple.com/app/id6821344597"]';
const MAC = 'a[href="https://apps.apple.com/app/id6812778888"]';

for (const lang of languages) {
  test(`iPhone and iPad badge ${lang.code}`, async ({ page }) => {
    for (const path of ["/download/", "/pricing/"]) {
      await page.goto(`${prefix(lang)}${path}`);
      const card = page.locator(".card", { has: page.locator(".name", { hasText: "iPhone" }) });
      await expect(card.locator(`${IOS} img`), `${path}: App Store badge`).toHaveCount(1);
      await expect(card.locator(MAC), `${path}: not the Mac app`).toHaveCount(0);
      await expect(page.locator(`.card:has(${MAC}) .name`), `${path}: the Mac card keeps the Mac app`).toHaveText("Mac");
    }
    // The device names on the Download cards, in order
    await page.goto(`${prefix(lang)}/download/`);
    const names = await page.locator(".card.on-sale .name").allTextContents();
    await page.goto(`${prefix(lang)}/`);
    await expect(page.locator(`${IOS} img`), "home: App Store badge").toHaveCount(1);
    // Each home badge sits under its device's name, as on the Download cards, so
    // the App Store and Mac App Store badges cannot be mixed up
    await expect(page.locator(".platform-row .name"), "home: badge names").toHaveText(names);
    await expect(page.locator(".platform-row li", { has: page.locator(IOS) }).locator(".name"), "home: iPhone badge name").toHaveText(names[0]!);
    await expect(page.locator(".platform-row li", { has: page.locator(MAC) }).locator(".name"), "home: Mac badge name").toHaveText("Mac");
  });
}

test("English pages do not call the iPhone and iPad app coming soon", async ({ page }) => {
  const pages = ["/", "/download/", "/pricing/", "/press/", "/support/", "/blog/offline-encryption-privacy/", "/blog/share-encrypted-files/"];
  for (const path of pages) {
    await page.goto(path);
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const text = `${await page.title()}\n${description}\n${await page.locator("main").innerText()}`;
    const sentences = text.split(/(?<=[.!?:])\s+|\n+/);
    expect(sentences.filter((s) => /iPhone|iPad/.test(s) && /coming soon/i.test(s)), path).toEqual([]);
  }
  await page.goto("/download/");
  await expect(page).toHaveTitle(/iPhone/);
});

// Mobile first: on sale before coming soon, each group in the order iPhone and
// iPad, Android, Mac, Windows (src/data/stores.ts). Linux is not named until it is coming. This is the order
// without any script, and what search engines see.
const ON_SALE = ["ios", "mac", "windows"];
const COMING = ["android"];
const STORE_ORDER = [/apps\.apple\.com\/app\/id6821344597/, /apps\.apple\.com\/app\/id6812778888/, /apps\.microsoft\.com/];

for (const lang of languages) {
  test(`mobile-first platform order ${lang.code}`, async ({ page }) => {
    for (const path of ["/download/", "/pricing/"]) {
      // The served HTML, before any script runs
      const html = await (await page.request.get(`${prefix(lang)}${path}`)).text();
      // The cards only, not the badges inside them
      const order = [...html.matchAll(/<li[^>]*data-platform="(\w+)"/g)].map((m) => m[1]);
      expect(order, `${path}: card order`).toEqual([...ON_SALE, ...COMING]);
    }
    const home = await (await page.request.get(`${prefix(lang)}/`)).text();
    const badges = [...home.matchAll(/<a href="(https:\/\/apps\.[^"]+)"/g)].map((m) => m[1]!);
    expect(badges.length, "home: badges").toBe(3);
    badges.forEach((href, i) => expect(href, `home badge ${i + 1}`).toMatch(STORE_ORDER[i]!));
    // Titles and descriptions name the phone platforms first, in every language
    await page.goto(`${prefix(lang)}/download/`);
    const title = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content"))!;
    expect(title.indexOf("iPhone"), `title: ${title}`).toBeLessThan(title.indexOf("Mac"));
    expect(description.indexOf("iPhone"), `description: ${description}`).toBeLessThan(description.indexOf("Mac"));
    expect(description, "download description").toContain("Android");
    expect(description, "download description").not.toContain("Linux");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect([ld].flat().find((d) => d["@type"] === "SoftwareApplication").operatingSystem).toBe("iOS, iPadOS, macOS, Windows");
    // The FAQ answers are in closed <details>, so the text is read, not what is shown
    await page.goto(`${prefix(lang)}/support/`);
    expect(await page.locator("main").textContent(), "support page").not.toContain("Linux");
  });
}

test("press fact sheet lists phones first", async ({ page }) => {
  await page.goto("/press/");
  const fact = (term: string) => page.locator(".facts div", { has: page.locator("dt", { hasText: term }) }).locator("dd");
  await expect(fact("Available for")).toHaveText("iPhone and iPad, Mac and Windows");
  await expect(fact("Coming soon")).toHaveText("Android");
});

// Copy covers phones and tablets too: no English page says the app works only
// on "your computer", and no page offers folders on a phone (the iPhone and iPad
// app encrypts files, photos, videos and text, not folders)
test("English copy does not assume a computer", async ({ page }) => {
  // The blog post carries the blog's call to action
  const pages = ["/", "/features/", "/pricing/", "/press/", "/support/", "/blog/offline-encryption-privacy/"];
  for (const path of pages) {
    await page.goto(path);
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const text = `${description}\n${await page.locator("main").innerText()}`;
    // "On your own computer or phone" covers both
    expect(text, path).not.toMatch(/on your (own )?computer(?! or phone)/i);
    expect(text, path).not.toMatch(/folders[^.]*iPhone|iPhone[^.]*folders/i);
  }
  await page.goto("/support/");
  await expect(page.locator("main")).toContainText("If I buy it on one platform, do I also get it on another?");
  await expect(page.locator("main")).toContainText("buying on a computer does not include iPhone and iPad");
});

// Cards in a row are uniform: each badge sits at the bottom of its card, so the
// badges line up however long the text above them is, in every language
for (const lang of languages) {
  test(`store badges line up ${lang.code}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const path of ["/download/", "/pricing/"]) {
      await page.goto(`${prefix(lang)}${path}`);
      const bottoms = await page
        .locator(".cards .on-sale")
        .evaluateAll((cards) => cards.map((c) => Math.round(c.getBoundingClientRect().bottom - c.querySelector(".buy")!.getBoundingClientRect().bottom)));
      expect(bottoms.length, `${path}: cards on sale`).toBe(3);
      expect(new Set(bottoms).size, `${path}: gap under each badge ${bottoms}`).toBe(1);
    }
  });
}
