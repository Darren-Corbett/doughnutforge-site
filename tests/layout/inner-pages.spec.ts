// The inner pages read as one site with the home page (docs/design/critique-2026-10-31.md):
// Support answers before it sends anyone to GitHub, Download's tagline stands on
// its own, blog titles look like links, posts have a way back to the Blog and
// full-width lines on phones, and the Technical details cards and lists follow DESIGN.md.
import { expect, test } from "@playwright/test";
import english from "../../src/i18n/ui/en";
import de from "../../src/i18n/ui/de";

// Read as plain strings, so a key added with this test checks before the copy exists
const en = english as Record<string, string>;
const INK_BLUE = "rgb(9, 100, 156)";

for (const [prefix, strings] of [["", en], ["/de", de as Record<string, string>]] as const) {
  test(`support: the answers come first, then one blue button ${prefix || "/"}`, async ({ page }) => {
    await page.goto(`${prefix}/support/`);
    const order = await page.locator("main section[aria-labelledby]").evaluateAll((s) => s.map((e) => e.getAttribute("aria-labelledby")));
    expect(order.indexOf("support-faq"), `section order: ${order}`).toBeLessThan(order.indexOf("support-ask"));
    const ask = page.locator('section[aria-labelledby="support-ask"]');
    await expect(ask.locator(".btn-primary")).toHaveCount(1);
    await expect(ask.locator(".btn-primary")).toHaveText(strings["support.ask.question"]!);
    await expect(ask.locator(".btn-outline")).toHaveText([strings["support.ask.bug"]!, strings["support.ask.idea"]!, strings["support.ask.search"]!]);
  });

  test(`download: the tagline is the site's summary line ${prefix || "/"}`, async ({ page }) => {
    await page.goto(`${prefix}/download/`);
    await expect(page.locator(".page-hero .tagline")).toHaveText(strings["home.summary"]!);
  });
}

test("blog index: every title looks like a link, and underlines on hover and focus", async ({ page }) => {
  await page.goto("/blog/");
  const titles = page.locator(".posts h2 a");
  expect(await titles.count()).toBeGreaterThan(0);
  // An arrow after every title, hidden from screen readers so the link's name is the title
  for (const title of await titles.all()) await expect(title.locator('[aria-hidden="true"]')).toHaveText(/→/);
  const style = (a: Element) => ({ color: getComputedStyle(a).color, line: getComputedStyle(a).textDecorationLine });
  const first = titles.first();
  await first.hover();
  expect(await first.evaluate(style)).toEqual({ color: INK_BLUE, line: "underline" });
  await page.mouse.move(0, 0);
  await first.focus();
  expect(await first.evaluate(style)).toEqual({ color: INK_BLUE, line: "underline" });
});

test("blog post: a link back to the Blog above the title", async ({ page }) => {
  await page.goto("/blog/can-whatsapp-read-my-messages/");
  const back = page.locator(".page-hero a[href='/blog/']");
  await expect(back).toHaveText(en["blog.title"]!);
  // Before the heading in reading order
  expect(await back.evaluate((a) => !!(a.compareDocumentPosition(document.querySelector("h1")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

for (const width of [320, 360, 639]) {
  test(`blog post at ${width}px: the text runs the full width, with no sheet edge`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/blog/can-whatsapp-read-my-messages/");
    const sheet = await page.locator(".prose").evaluate((e) => {
      const s = getComputedStyle(e);
      return { border: s.borderInlineStartWidth, padding: s.paddingInlineStart, width: e.getBoundingClientRect().width };
    });
    expect(sheet.border).toBe("0px");
    expect(sheet.padding).toBe("0px");
    // The page's 16px gutters only
    expect(sheet.width).toBe(width - 32);
  });
}

test("blog post at 640px keeps its sheet", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await page.goto("/blog/can-whatsapp-read-my-messages/");
  expect(await page.locator(".prose").evaluate((e) => getComputedStyle(e).borderInlineStartWidth)).toBe("2px");
});

test("technical details: plain cards with a tone edge, and the normal gap after a list", async ({ page }) => {
  await page.goto("/security/technical-details/");
  for (const card of await page.locator(".glance li").all()) {
    const { background, border } = await card.evaluate((e) => ({ background: getComputedStyle(e).backgroundColor, border: getComputedStyle(e).borderTopWidth }));
    expect(background).toBe("rgb(255, 255, 255)");
    expect(border).toBe("2px");
    expect(await card.locator(".icon").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  }
  // A paragraph after a list gets the same space as one after a paragraph
  const after = page.locator(".prose :is(ul, ol) + p");
  expect(await after.count()).toBeGreaterThan(0);
  for (const p of await after.all()) expect(await p.evaluate((e) => getComputedStyle(e).marginTop)).toBe("14px");
});
