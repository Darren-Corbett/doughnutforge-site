// The roadmap, security and technical details pages, in every language: the
// first two are linked from the footer, the roadmap says nothing it must not
// (dates, finding codes, versions) and marks every item not yet shipped as
// planned, the security page sends vulnerability reports to GitHub's private
// advisories, never to public issues, and the technical details page is linked
// from the security page and the FAQ and keeps every algorithm name in English.
import { expect, test } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

// LANGS narrows the run, as in the other layout tests ("en" for English)
const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
const ADVISORIES = "https://github.com/Darren-Corbett/forge-privacy/security/advisories/new";
const SECTIONS = ["shipped", "next", "later"];
// Names that stay untranslated on the technical details page, in every language
const TECHNICAL_NAMES = ["AES-256-GCM", "X25519", "ML-KEM-768", "Ed25519", "HKDF-SHA-256", "Argon2id", "BIP-39", "aes-gcm (RustCrypto)", "BEGIN FORGE ENCLAVE"];

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
      // The identity update is out on Mac, iPhone and iPad; Windows waits for its package
      await expect(page.locator('[data-roadmap="shipped"] h3')).toContainText([await ui(lang.code, "roadmap.identity.title")]);
      await expect(page.locator('[data-roadmap="next"] h3')).toContainText([await ui(lang.code, "roadmap.identityWindows.title")]);
      // No dates, finding codes or version numbers, in any language
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/\b20\d\d\b/);
      expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(text).not.toMatch(/\b[CHML]\d+\b/);
      expect(text).not.toMatch(/\d+\.\d+\.\d+/);
      if (lang.code === "en") expect(text).not.toMatch(/severity|branch|weakness|finding|audited|verified|military/i);
    });

    // All three pages exist in every language: hreflang lists them all, and the
    // language menu goes to the same page, not each language's home page
    test(`roadmap, security and technical details hreflang and language menu ${lang.code}`, async ({ page }) => {
      for (const path of ["/roadmap/", "/security/", "/security/technical-details/"]) {
        await page.goto(`${prefix(lang)}${path}`);
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]'), `${path} x-default`).toHaveAttribute("href", `https://doughnut-forge.app${path}`);
        for (const l of languageData.languages) {
          await expect(page.locator(`link[rel="alternate"][hreflang="${l.hreflang}"]`), `${path} hreflang ${l.hreflang}`).toHaveAttribute(
            "href",
            `https://doughnut-forge.app${prefix(l)}${path}`,
          );
          await expect(page.locator(`details.lang-switch .panel a[hreflang="${l.hreflang}"]`), `${path} menu ${l.hreflang}`).toHaveAttribute("href", `${prefix(l)}${path}`);
        }
      }
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

    test(`technical details ${lang.code}`, async ({ page }) => {
      const res = await page.goto(`${prefix(lang)}/security/technical-details/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const text = await page.locator("main").innerText();
      for (const name of TECHNICAL_NAMES) expect(text, name).toContain(name);
      // The page describes the app as it is, not one release of it
      expect(text).not.toContain("0.4.46");
      // It says plainly that there has been no audit yet, and links to the plan
      expect(text).toContain(await ui(lang.code, "security.audit.text"));
      await expect(page.locator(`main a[href="${prefix(lang)}/roadmap/"]`)).toHaveCount(1);
      if (lang.code === "en") {
        // "does not guarantee" is a limit the page must state, never a promise
        expect(text).not.toMatch(/military|unbreakable|(?<!not )guarantee|verified sender|has been audited|was audited|open.source|certified|passphrase/i);
        expect(text).not.toMatch(/\bwe\b|n't\b/i);
      }
    });

    test(`technical details is linked from security and the FAQ ${lang.code}`, async ({ page }) => {
      const href = `${prefix(lang)}/security/technical-details/`;
      await page.goto(`${prefix(lang)}/security/`);
      await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
      await page.goto(`${prefix(lang)}/support/`);
      await expect(page.locator(`#faq a[href="${href}"]`)).toHaveCount(1);
    });

    test(`FAQ answers why not a messaging app ${lang.code}`, async ({ page }) => {
      await page.goto(`${prefix(lang)}/support/`);
      const question = await ui(lang.code, "faq.messaging.q");
      await expect(page.locator("#faq")).toContainText(question);
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = jsonLd.map((j) => JSON.parse(j)).find((j) => j["@type"] === "FAQPage");
      expect(faq.mainEntity.map((q: { name: string }) => q.name)).toContain(question);
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
