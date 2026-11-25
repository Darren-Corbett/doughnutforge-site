// Store card text never breaks inside a name, and never leaves one word alone on its
// last line (owner, 25 November 2026). Finnish writes a store name with a spaced
// hyphen ending, "App Store -kaupasta": the line must not break before "-kaupasta"
// (src/middleware.ts joins it with no-break spaces). Every card's text wraps "pretty", so its last
// line holds more than one word, in every language (Thai words found by the
// browser's own word segmenter).
import { expect, test } from "../support/browser";
import { each } from "../support/each";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

const languages = languageData.languages.filter((l) => !process.env.LANGS || process.env.LANGS.split(",").includes(l.path));
const prefix = (l: (typeof languages)[number]) => (l.code === "en" ? "" : `/${l.path}`);

test("Finnish: “App Store -kaupasta” stays on one line", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/fi/pricing/");
  const status = page.locator('.card[data-platform="ios"] p.status');
  await expect(status).toContainText(/App\sStore\s-kaupasta/);
  // The phrase, from "App" to the end of "-kaupasta", on one line
  const lines = await status.evaluate((el) => {
    // Text nodes with their offsets in the whole text, so the phrase may cross a span
    const nodes: { node: Text; at: number }[] = [];
    let all = "";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
      nodes.push({ node: n, at: all.length });
      all += n.textContent;
    }
    const start = all.search(/App\sStore\s-kaupasta/);
    const end = start + "App Store -kaupasta".length;
    const point = (i: number) => {
      const hit = nodes.filter((n) => n.at <= i).at(-1)!;
      return [hit.node, i - hit.at] as const;
    };
    const range = document.createRange();
    range.setStart(...point(start));
    range.setEnd(...point(end - 1));
    return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size;
  });
  expect(lines, "one line").toBe(1);
});

/** The words of an element's text and the top of each, in reading order */
const lastTwoWordTops = (el: Element, lang: string) => {
  const words: { top: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    for (const part of new Intl.Segmenter(lang, { granularity: "word" }).segment(text)) {
      if (!part.isWordLike) continue;
      const range = document.createRange();
      range.setStart(node, part.index);
      range.setEnd(node, part.index + part.segment.length);
      const rects = range.getClientRects();
      if (rects.length) words.push({ top: rects[rects.length - 1]!.top });
    }
  }
  return words.slice(-2).map((w) => Math.round(w.top));
};

for (const lang of languages) {
  test(`store cards: no word alone on the last line ${lang.code}`, async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["download/", "pricing/"]) {
        await page.goto(`${prefix(lang)}/${path}`);
        for (const status of await each(page.locator(".card p.status"))) {
          expect(await status.evaluate((e) => getComputedStyle(e).textWrap), "pretty wrapping").toBe("pretty");
          const [before, last] = await status.evaluate(lastTwoWordTops, lang.hreflang);
          if (before === undefined) continue;
          expect(last, `${width}px ${path}: “${await status.textContent()}” ends with one word alone`).toBe(before);
        }
      }
    }
  });
}
