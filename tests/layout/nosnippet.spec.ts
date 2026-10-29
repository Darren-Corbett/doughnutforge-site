// Search snippets should quote what the product is, not button labels and menus.
// Only UI chrome carries data-nosnippet: the header bar (logo name, menu, language
// switcher), the footer links, the skip link, the home page's hero buttons and
// store badges, the badge in each download and pricing card, and the "Get
// Doughnut Forge" buttons on the features page and under each post. Nothing else
// does, and never the text that describes the product. Google honours the
// attribute only on span, div and section, so links are wrapped in a span.
import { expect, test, type Page } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);

// Every element allowed to carry data-nosnippet, wherever it appears
const APPROVED = ["header > div", "footer .footer-links", "span.skip", ".hero .actions", ".platform-row", ".cards .buy", "span.cta-button"];
// On every page: the header bar, both footer link columns and the skip link
const EVERY_PAGE: Record<string, number> = { "header > div": 1, "footer .footer-links": 2, "span.skip": 1 };
const ON_PAGE: Record<string, Record<string, number>> = {
  "/": { ".hero .actions": 1, ".platform-row": 1 },
  "/download/": { ".cards .buy": 3 },
  "/pricing/": { ".cards .buy": 3 },
  "/features/": { "span.cta-button": 2 },
  "/press/": {},
  "/support/": {},
};
// Text that describes the product: never marked, and never inside a marked element
const NEVER = ["h1", ".hero .summary", ".hero .tagline", ".hero .lead", "#home-what", "main h2"];

/** Every data-nosnippet element on the page that matches none of the approved selectors */
const unapproved = (page: Page) =>
  page.locator("[data-nosnippet]").evaluateAll(
    (els, approved) => els.filter((e) => !approved.some((s) => e.matches(s))).map((e) => e.outerHTML.slice(0, 120)),
    APPROVED,
  );

const check = async (page: Page, path: string, expected: Record<string, number>) => {
  await page.goto(path);
  for (const [selector, count] of Object.entries({ ...EVERY_PAGE, ...expected })) {
    await expect(page.locator(selector), `${path} ${selector}`).toHaveCount(count);
    for (const el of await page.locator(selector).all()) await expect(el, `${path} ${selector}`).toHaveAttribute("data-nosnippet", "");
  }
  expect(await unapproved(page), `${path}: data-nosnippet outside the approved list`).toEqual([]);
  for (const selector of NEVER) {
    const marked = await page.locator(selector).evaluateAll((els) => els.filter((e) => e.closest("[data-nosnippet]")).length);
    expect(marked, `${path}: ${selector} must not carry data-nosnippet or sit inside it`).toBe(0);
  }
};

for (const lang of languages) {
  test(`data-nosnippet on UI chrome only ${lang.code}`, async ({ page }) => {
    for (const [path, expected] of Object.entries(ON_PAGE)) await check(page, `${prefix(lang)}${path}`, expected);
  });
}

// The blog is in English only: the index and one post, whose closing button is marked
test("data-nosnippet on UI chrome only, blog", async ({ page }) => {
  await check(page, "/blog/", {});
  await check(page, "/blog/offline-encryption-privacy/", { "span.cta-button": 1 });
});
