// The "Built for the long term" card on the home and features pages, in every
// language: the plain line the owner chose (20 November 2026), never the store
// listing's "stays protected", which promises more than any encryption can.
import { expect, test } from "../support/browser";
import { readFileSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

// LANGS narrows the run, as in the other layout tests ("en" for English)
const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
const ui = async (code: string) => (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
const store = (code: string) => JSON.parse(readFileSync(`src/i18n/store/${code}.json`, "utf8")) as { mac: { features: { title: string; text: string }[] } };

for (const lang of languages) {
  test(`the long-term card says what the app uses, without a promise ${lang.code}`, async ({ page }) => {
    const strings = await ui(lang.code);
    const { title, text: storeText } = store(lang.code).mac.features[4]!;
    for (const path of ["/", "/features/"]) {
      await page.goto(`${prefix(lang)}${path}`);
      const card = page.locator("h3", { hasText: title }).locator("xpath=following-sibling::p[1]");
      await expect(card, path).toHaveText(strings["features.longTerm.text"]!);
      expect(await page.locator("main").innerText(), path).not.toContain(storeText);
    }
  });
}
