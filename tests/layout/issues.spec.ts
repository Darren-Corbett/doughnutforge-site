// The support page's links to the issue forms, and the Answered questions and
// Known issues pages built from the labelled issues (src/data/issues.json, or
// ISSUES_FILE when the build used another file). With no issues, the links and
// pages do not exist. Issue pages show the title, question and answer only:
// no usernames, avatars or links to anyone's profile.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import { dist } from "../support/site";

type Item = { number: number; slug: string; title: string; question: string; answer: string; url: string };
const root = new URL("../../", import.meta.url).pathname;
const issues = JSON.parse(readFileSync(process.env.ISSUES_FILE ?? `${root}src/data/issues.json`, "utf8")) as Record<"answered" | "known", Item[]>;
const LISTS = { answered: "support/answered/", known: "support/known-issues/" } as const;

// LANGS narrows the run, as in the other layout tests ("en" for English)
const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
const FORM = (template: string) => `https://github.com/Darren-Corbett/forge-privacy/issues/new?template=${template}`;
const sitemap = readFileSync(`${dist}/sitemap-0.xml`, "utf8");

for (const lang of languages) {
  test(`support page links ${lang.code}`, async ({ page }) => {
    await page.goto(`${prefix(lang)}/support/`);
    const main = page.locator("main");
    // The three forms, never a blank issue or the plain chooser
    for (const t of ["bug_report.yml", "question.yml", "feature_idea.yml"]) await expect(main.locator(`a[href="${FORM(t)}"]`)).toHaveCount(1);
    await expect(main.locator('a[href$="/issues/new"], a[href$="/issues/new/choose"]')).toHaveCount(0);
    // Security problems go to private reporting, not an issue
    await expect(main.locator(`a[href="${prefix(lang)}/security/#report"]`)).toHaveCount(1);
    // Answered questions and Known issues only when there is something to show
    for (const [list, path] of Object.entries(LISTS)) {
      const href = `${prefix(lang)}/${path}`;
      await expect(main.locator(`a[href="${href}"]`), `${list} link`).toHaveCount(issues[list as keyof typeof LISTS].length ? 1 : 0);
      expect(sitemap.includes(`https://doughnut-forge.app${href}<`), `${list} in the sitemap`).toBe(issues[list as keyof typeof LISTS].length > 0);
    }
  });

  for (const [list, path] of Object.entries(LISTS)) {
    const items = issues[list as keyof typeof LISTS];
    if (!items.length) continue;
    test(`${list} list ${lang.code}`, async ({ page }) => {
      const res = await page.goto(`${prefix(lang)}/${path}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      // Every issue is listed by its title, linking to its one page (in English)
      for (const item of items) await expect(page.locator(`main a[href="/${path}${item.slug}/"]`)).toHaveText(item.title);
    });
  }
}

for (const [list, path] of Object.entries(LISTS)) {
  for (const item of issues[list as keyof typeof LISTS]) {
    test(`issue page ${path}${item.slug}/`, async ({ page }) => {
      const res = await page.goto(`/${path}${item.slug}/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(item.title);
      // The question and the answer, each paragraph as written
      for (const [part, text] of [["question", item.question], ["answer", item.answer]] as const) {
        const block = page.locator(`[data-issue="${part}"]`);
        for (const para of text.split(/\n{2,}/)) await expect(block).toContainText(para.trim());
      }
      // Nothing about any person: no @handles, images or GitHub links but the issue's own
      const main = page.locator("main");
      expect(await main.innerText()).not.toMatch(/@[A-Za-z0-9-]+/);
      await expect(main.locator("img")).toHaveCount(0);
      const github = await main.locator('a[href^="https://github.com/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      expect(github).toEqual([item.url]);
      await expect(main.locator(`a[href="${item.url}"]`)).toHaveAttribute("target", "_blank");
    });
  }
}
