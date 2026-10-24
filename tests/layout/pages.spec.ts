// The roadmap and security pages, in every language: both are linked from the
// footer, the roadmap says nothing it must not (dates, finding codes, versions)
// and marks every item not yet shipped as planned, and the security page sends
// vulnerability reports to GitHub's private advisories, never to public issues.
import { expect, test } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

// LANGS narrows the run, as in the other layout tests ("en" for English)
const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
const ADVISORIES = "https://github.com/Darren-Corbett/forge-privacy/security/advisories/new";
const SECTIONS = ["shipped", "next", "later"];

/** One UI string in a language, falling back to English as the site does */
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  if (own[key] !== undefined) return own[key];
  return ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};

for (const lang of languages) {
  test.describe(lang.code, () => {
    test(`footer links ${lang.code}`, async ({ page }) => {
      await page.goto(`${prefix(lang)}/`);
      await expect(page.locator(`footer a[href="${prefix(lang)}/roadmap/"]`)).toHaveCount(1);
      await expect(page.locator(`footer a[href="${prefix(lang)}/security/"]`)).toHaveCount(1);
    });

    test(`roadmap ${lang.code}`, async ({ page }) => {
      const res = await page.goto(`${prefix(lang)}/roadmap/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      // Shipped, next and later only, in that order; next and later always have items
      const sections = await page.locator("[data-roadmap]").evaluateAll((els) => els.map((e) => e.getAttribute("data-roadmap")));
      expect(sections.every((s) => SECTIONS.includes(s!)), `sections: ${sections}`).toBe(true);
      expect(sections).toEqual([...sections].sort((a, b) => SECTIONS.indexOf(a!) - SECTIONS.indexOf(b!)));
      expect(sections).toContain("next");
      expect(sections).toContain("later");
      // Every item not yet shipped says it is planned, in the page language
      const planned = await ui(lang.code, "roadmap.planned");
      for (const status of ["next", "later"]) {
        const items = page.locator(`[data-roadmap="${status}"] li`);
        expect(await items.count(), `${status} items`).toBeGreaterThan(0);
        for (const item of await items.all()) await expect(item.locator("[data-planned]")).toHaveText(planned);
      }
      await expect(page.locator('[data-roadmap="shipped"] [data-planned]')).toHaveCount(0);
      // No dates, finding codes or version numbers, in any language
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/\b20\d\d\b/);
      expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(text).not.toMatch(/\b[CHML]\d+\b/);
      expect(text).not.toMatch(/\d+\.\d+\.\d+/);
      if (lang.code === "en") expect(text).not.toMatch(/severity|branch|weakness|finding|audited|verified|military/i);
    });

    test(`security ${lang.code}`, async ({ page }) => {
      const res = await page.goto(`${prefix(lang)}/security/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      // Reports go to private advisories, in a new tab, never to public issues
      const report = page.locator(`main a[href="${ADVISORIES}"]`);
      expect(await report.count()).toBeGreaterThan(0);
      for (const a of await report.all()) {
        await expect(a).toHaveAttribute("target", "_blank");
        await expect(a).toHaveAttribute("rel", /noopener/);
      }
      await expect(page.locator('main a[href*="/issues"]')).toHaveCount(0);
      // The page links to the roadmap, where the planned audit is listed
      await expect(page.locator(`main a[href="${prefix(lang)}/roadmap/"]`)).toHaveCount(1);
      if (lang.code === "en") {
        const text = await page.locator("main").innerText();
        expect(text).not.toMatch(/military|unbreakable|guarantee|verified sender|has been audited|was audited/i);
        expect(text).not.toMatch(/\bwe\b|n't\b/i);
      }
    });
  });
}

test("security.txt", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain(`Contact: ${ADVISORIES}`);
  expect(body).toContain("Policy: https://doughnut-forge.app/security/");
  expect(body).toContain("Canonical: https://doughnut-forge.app/.well-known/security.txt");
  expect(body).not.toContain("/issues");
  // RFC 9116: one Expires, in the future and no more than a year ahead
  const expires = [...body.matchAll(/^Expires: (.+)$/gm)].map((m) => Date.parse(m[1]!));
  expect(expires).toHaveLength(1);
  expect(expires[0]! > Date.now()).toBe(true);
  expect(expires[0]! - Date.now()).toBeLessThanOrEqual(366 * 24 * 3600 * 1000);
});
