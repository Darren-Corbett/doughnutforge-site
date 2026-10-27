// What people click and press: the language menu, the FAQ, keyboard focus, the
// store badges in every language, and the 404 page.
import { expect, test } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import alts from "../../src/assets/badges/alt.json" with { type: "json" };
import sameAsEnglish from "../../src/i18n/same-as-english.json" with { type: "json" };

const languages = languageData.languages;
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);
// What screen readers hear after a store badge's name (the owner's wording)
const NEW_TAB_EN = "(opens in a new tab)";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Apple's Mac and iPhone and iPad apps share a host, so their links differ only by app ID
const IOS_APP = "https://apps.apple.com/app/id6821344597";
const storeOf = (href: string): keyof typeof alts =>
  href === IOS_APP ? "app-store" : new URL(href).host === "apps.apple.com" ? "mac-app-store" : "microsoft-store";
// The link each store should get (as src/data/stores.ts storeUrl builds it):
// Apple with no country code, Microsoft in the page language
const LINK: Record<string, (hreflang: string) => RegExp> = {
  "mac-app-store": () => /^https:\/\/apps\.apple\.com\/app\/id\d+$/,
  "app-store": () => /^https:\/\/apps\.apple\.com\/app\/id\d+$/,
  "microsoft-store": (hl) => new RegExp(`^https://apps\\.microsoft\\.com/detail/\\w+\\?hl=${hl}$`),
};

for (const lang of languages) {
  test.describe(lang.code, () => {
    test(`language menu ${lang.code}`, async ({ page }) => {
      await page.goto(`${prefix(lang)}/features/`);
      const menu = page.locator("details.lang-switch");
      const summary = menu.locator("summary");
      await summary.click();
      await expect(menu).toHaveAttribute("open", "");
      await expect(menu.locator(".panel")).toBeVisible();
      // Every language links to the same page, the current one is marked
      const links = menu.locator(".panel a");
      await expect(links).toHaveCount(languages.length);
      for (const l of languages) await expect(menu.locator(`.panel a[hreflang="${l.hreflang}"]`)).toHaveAttribute("href", `${prefix(l)}/features/`);
      await expect(menu.locator(`.panel a[aria-current="true"]`)).toHaveAttribute("hreflang", lang.hreflang);
      // Escape closes it and puts focus back on its button
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(summary).toBeFocused();
      // A click outside closes it too
      await summary.click();
      await page.locator("main h1").click();
      await expect(menu).not.toHaveAttribute("open", "");
      // On an English-only page (a blog post) each language goes to its home page
      await page.goto("/blog/share-encrypted-files/");
      await expect(page.locator(`details.lang-switch .panel a[hreflang="${lang.hreflang}"]`)).toHaveAttribute("href", `${prefix(lang)}/`);
    });

    test(`store badges ${lang.code}`, async ({ page }) => {
      for (const path of ["/", "/download/", "/pricing/"]) {
        await page.goto(`${prefix(lang)}${path}`);
        const badges = page.locator('a[href*="apps.apple.com"], a[href*="apps.microsoft.com"], a[href*="play.google.com"]');
        expect(await badges.count(), `${path}: store badges`).toBeGreaterThan(0);
        for (const a of await badges.all()) {
          const href = (await a.getAttribute("href"))!;
          const store = storeOf(href);
          const img = a.locator("img");
          const alt = (await img.getAttribute("alt"))!;
          const altText = alts[store] as Record<string, string>;
          // The language's own badge, or the English one marked as English
          if (altText[lang.code]) expect.soft(alt, `${path} ${store}: own badge`).toBe(altText[lang.code]);
          else {
            expect.soft(alt, `${path} ${store}: English badge`).toBe(altText.en);
            expect.soft(await img.getAttribute("lang"), `${path} ${store}: English badge marked lang=en`).toBe("en");
          }
          expect.soft(href, `${path} ${store}: link`).toMatch(LINK[store]!(lang.hreflang));
          // Store links open in a new tab, and say so to screen readers in the page language
          expect.soft(await a.getAttribute("target"), `${path} ${store}: opens in a new tab`).toBe("_blank");
          expect.soft(await a.getAttribute("rel"), `${path} ${store}: rel`).toBe("noopener noreferrer");
          const hint = a.locator(".sr-only");
          await expect.soft(hint, `${path} ${store}: says it opens in a new tab`).toHaveCount(1);
          if ((await hint.count()) === 1) {
            const text = (await hint.textContent())!.trim();
            expect.soft(text, `${path} ${store}: new-tab text`).not.toBe("");
            if (lang.code === "en" || lang.code === "en-US") expect.soft(text, `${path} ${store}: English new-tab text`).toBe(NEW_TAB_EN);
            else if (!(sameAsEnglish as Record<string, string[]>)[lang.code]?.includes("a11y.newTab"))
              expect.soft(text, `${path} ${store}: new-tab text is translated`).not.toBe(NEW_TAB_EN);
            await expect.soft(a, `${path} ${store}: link name is the badge, then the new-tab text`).toHaveAccessibleName(new RegExp(`^${escape(alt)}\\s*${escape(text)}$`));
          }
          await img.scrollIntoViewIfNeeded();
          await expect.soft(img, `${path} ${store}: badge image loads`).toHaveJSProperty("complete", true);
          expect.soft(await img.evaluate((i: HTMLImageElement) => i.naturalWidth), `${path} ${store}: badge has pixels`).toBeGreaterThan(0);
        }
      }
    });
  });
}

test("FAQ answers open and close", async ({ page }) => {
  await page.goto("/support/");
  const items = page.locator("main details");
  expect(await items.count()).toBeGreaterThan(3);
  for (const d of await items.all()) {
    await d.locator("summary").click();
    await expect(d).toHaveAttribute("open", "");
    await expect(d.locator(":scope > :not(summary)").first()).toBeVisible();
    await d.locator("summary").click();
    await expect(d).not.toHaveAttribute("open", "");
  }
});

for (const path of ["/", "/features/", "/pricing/", "/download/", "/support/", "/privacy/", "/press/", "/legal/", "/blog/", "/blog/share-encrypted-files/"]) {
  test(`keyboard focus ${path}`, async ({ page, browserName }) => {
    await page.goto(path);
    // Safari moves focus to links only with Option-Tab unless the user turns on "Press Tab to highlight each item"
    const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
    const seen = new Set<string>();
    const missing: string[] = [];
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press(key);
      const f = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        if (!e || e === document.body) return null;
        const s = getComputedStyle(e);
        const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2) || s.boxShadow !== "none";
        const b = e.getBoundingClientRect();
        return { id: `${e.tagName} ${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 40)} ${e.getAttribute("href") ?? ""}`, ring, onScreen: b.width > 0 && b.height > 0 };
      });
      if (!f || seen.has(f.id)) break;
      seen.add(f.id);
      if (!f.ring || !f.onScreen) missing.push(`${f.id} (ring ${f.ring}, on screen ${f.onScreen})`);
    }
    expect(seen.size, "focus moves through the page").toBeGreaterThan(5);
    // The skip link comes first
    expect([...seen][0]).toMatch(/^A .*#main/);
    expect(missing, "every focused element shows a visible ring").toEqual([]);
  });
}

test("404 page", async ({ page }) => {
  const res = await page.goto("/no-such-page/");
  expect(res!.status()).toBe(404);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
  // One 404.html answers every unknown address, so it has no address of its own to share
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});
