// iPhone and iPad are on sale: in every language the iPhone and iPad card and
// the home page carry the App Store badge for the iPhone and iPad app, never the
// Mac app's, and the English pages no longer call that app "coming soon".
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
    await page.goto(`${prefix(lang)}/`);
    await expect(page.locator(`${IOS} img`), "home: App Store badge").toHaveCount(1);
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
