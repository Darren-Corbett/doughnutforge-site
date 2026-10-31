// Every page, in every language, at every audit width and in both themes:
// nothing reaches past the screen edge (so the page never pans sideways), the
// header links sit on one row on phones, every image loads, text fits its box,
// and no two links cover each other. The language menu and the FAQ answers are
// opened and measured too.
import { expect, test, type Page } from "@playwright/test";
import { record } from "../support/findings";
import { installMeasures, measure } from "../support/measure";
import { langOf, pages, PHONE_WIDTHS, templateOf, THEMES, WIDTHS } from "../support/site";

const settle = (page: Page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

for (const path of pages) {
  test(path, async ({ page }, info) => {
    const phone = info.project.name === "webkit-iphone";
    const widths = phone ? PHONE_WIDTHS : WIDTHS;
    const lang = langOf(path);
    const template = templateOf(path);
    let failures = 0;
    const fail = async (check: string, width: number, theme: string, detail: unknown, key: string, highlight?: string) => {
      failures++;
      info.annotations.push({ type: check, description: `${width}px ${theme}: ${JSON.stringify(detail)}` });
      await record(page, info, { check, page: path, lang, width, theme, detail, key: `${check}|${template}|${key}` }, highlight);
    };

    await page.addInitScript(installMeasures);
    await page.goto(path);
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of widths) {
        await page.setViewportSize({ width, height: phone ? 844 : 900 });
        // Start each width from the top left. Under load, WebKit on the iPhone
        // profile can keep a sideways offset from the previous width after
        // shrinking the screen, which shifts every box and reads as a pan.
        // The far-right scroll below still catches a page that can really pan.
        await page.evaluate(() => scrollTo(0, 0));
        await settle(page);

        // 1. Nothing wider than the screen, so the page cannot pan sideways
        const wide = await measure(page, "wideElements");
        for (const w of wide) await fail("wider-than-viewport", width, theme, w, w.selector, w.selector);
        const scroll = await measure(page, "sidewaysScroll");
        if (scroll.scrollWidth > scroll.clientWidth || scroll.scrollX > 0 || scroll.visualLeft > 0 || (phone && scroll.innerWidth > width))
          await fail("horizontal-pan", width, theme, scroll, "page");

        // 2. All four header links on one row on phones
        if (width <= 430) {
          const nav = await measure(page, "navRows");
          if (nav.rows > 1) await fail("nav-wraps", width, theme, nav, "nav", "header nav");
        }

        // 3. Text fits its box; no word is wider than its column
        for (const t of await measure(page, "overflowingText")) await fail(t.clips ? "text-clipped" : "text-overflows", width, theme, t, t.selector);

        // 4. Links and buttons never cover each other
        for (const o of await measure(page, "overlappingControls")) await fail("controls-overlap", width, theme, o, `${o.a}|${o.b}`);

        // 5. Every image loads (images change with width through srcset)
        if (width === 390 || width === 1280) {
          await measure(page, "scrollThrough");
          for (const img of await measure(page, "brokenImages")) await fail("image-not-loaded", width, theme, img, img.src.replace(/\.[\w-]+\.(\w+)$/, ".$1"), `img[src="${img.src}"]`);
        }

        // 6. The language menu, open, stays on the screen
        if (width <= 430 || width === 768) {
          await page.locator("details.lang-switch summary").click();
          await settle(page);
          const panel = await measure(page, "wideElements");
          for (const w of panel) await fail("open-language-menu-too-wide", width, theme, w, w.selector, w.selector);
          const s = await measure(page, "sidewaysScroll");
          if (s.scrollWidth > s.clientWidth || s.scrollX > 0 || (phone && s.innerWidth > width)) await fail("horizontal-pan-language-menu", width, theme, s, "menu");
          await page.keyboard.press("Escape");
          await expect(page.locator("details.lang-switch")).not.toHaveAttribute("open", "");
        }
      }
    }

    // 7. The FAQ answers, open, still fit
    if (template === "/support/") {
      await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => ((d as HTMLDetailsElement).open = true)));
      for (const theme of THEMES) {
        await page.emulateMedia({ colorScheme: theme });
        for (const width of [widths[0]!, widths.at(-1)!]) {
          await page.setViewportSize({ width, height: 900 });
          await settle(page);
          for (const w of await measure(page, "wideElements")) await fail("faq-open-too-wide", width, theme, w, w.selector, w.selector);
          for (const t of await measure(page, "overflowingText")) await fail("faq-open-text-overflows", width, theme, t, t.selector);
        }
      }
    }

    expect(failures, `${failures} layout problem(s) on ${path}; run with AUDIT_DIR to see them`).toBe(0);
  });
}
