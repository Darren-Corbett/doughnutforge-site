// The white paper page (src/views/WhitePaperPage.astro): one h1, an overview
// first, each "How this is checked" note folded away, and a PDF of the same text
// to download, served from this site.
import { readdirSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import { expect, test } from "../support/browser";

test("white paper: overview first, notes folded away, PDF from this site", async ({ page }) => {
  await page.goto("/security/white-paper/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main h2").first()).toHaveText("Overview");
  const notes = page.locator("main details.checked");
  expect(await notes.count()).toBeGreaterThan(5);
  for (const note of await notes.all()) expect(await note.getAttribute("open")).toBeNull();
  await expect(notes.first().locator("summary")).toHaveText("How this is checked");
  const pdf = page.locator('a[href="/security/white-paper/doughnut-forge-white-paper-en.pdf"]');
  await expect(pdf).toHaveCount(1);
  const res = await page.request.get("/security/white-paper/doughnut-forge-white-paper-en.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("application/pdf");
});

test("white paper: opening a note shows how that section is checked", async ({ page }) => {
  await page.goto("/security/white-paper/");
  const note = page.locator("main details.checked").first();
  await note.locator("summary").click();
  await expect(note).toHaveAttribute("open", "");
  await expect(note.locator("p").first()).toBeVisible();
});

// Line-break markup (src/middleware.ts) is HTML, so it must never reach SVG text:
// a <span> there pushes the labels out of the drawing
test("white paper: diagram labels stay inside the drawing", async ({ page }) => {
  await page.goto("/security/white-paper/");
  const svg = page.locator("figure.diagram svg").first();
  await expect(svg.locator("span")).toHaveCount(0);
  await expect(svg.locator("text").first()).toHaveText("24 recovery words");
  const box = (await svg.boundingBox())!;
  for (const rect of await svg.locator("rect").all()) {
    const r = (await rect.boundingBox())!;
    expect(r.y + r.height, "box inside the drawing").toBeLessThanOrEqual(box.y + box.height + 1);
  }
});

test("white paper: no sideways scrolling on a 360px phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/security/white-paper/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

// Every language links to the white paper from the footer, Security and
// Technical details: to its own translation once there is one, otherwise to the
// English paper, marked as English (hreflang), as the footer does for the blog
const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const translated = new Set(readdirSync("src/content/white-paper").map((f) => f.replace(/\.md$/, "")));
for (const lang of languages)
  test(`white paper linked from footer, Security and Technical details ${lang.code}`, async ({ page }) => {
    const base = lang.code === "en" ? "" : `/${lang.path}`;
    const own = translated.has(lang.code);
    const href = `${own ? base : ""}/security/white-paper/`;
    for (const path of ["/security/", "/security/technical-details/"]) {
      await page.goto(`${base}${path}`);
      const links = page.locator(`main a[href="${href}"], footer a[href="${href}"]`);
      expect(await links.count(), `${path}: links to ${href}`).toBeGreaterThanOrEqual(2);
      for (const link of await links.all()) {
        await expect(link).toHaveText(/\S/);
        if (!own) await expect(link).toHaveAttribute("hreflang", "en");
      }
    }
  });
