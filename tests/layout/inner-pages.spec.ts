// The inner pages read as one site with the home page (docs/design/critique-2026-10-31.md):
// Support answers before it sends anyone to GitHub, Download's tagline stands on
// its own, blog titles look like links, posts have a way back to the Blog and
// full-width lines on phones, the Technical details cards and lists follow DESIGN.md,
// Security puts its facts before the researchers' reporting section, and the
// Roadmap's groups are tone-ruled rows without a "Planned" pill on every item.
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

  test(`security: the facts and the missing audit as blue rows, then a quiet reporting section ${prefix || "/"}`, async ({ page }) => {
    await page.goto(`${prefix}/security/`);
    const facts = page.locator("main .row");
    await expect(facts.locator("h2")).toHaveText(["device", "servers", "quantum", "keys", "audit"].map((id) => strings[`security.${id}.title`]!));
    for (const row of await facts.all()) expect(await row.evaluate((e) => getComputedStyle(e).borderTopColor)).toBe("rgb(29, 161, 242)");
    // No loud button: the reporting action is for researchers, not everyday visitors
    await expect(page.locator("main .btn-primary")).toHaveCount(0);
    await expect(page.locator("#report ~ * .btn-outline")).toHaveText(new RegExp(strings["security.report.button"]!));
    await expect(facts.last().locator("p")).toHaveText(`${strings["security.audit.text"]} ${strings["security.audit.link"]}`);
    const headings = await page.locator("main h2").evaluateAll((hs) => hs.map((h) => h.id || h.textContent));
    expect(headings.indexOf("report"), `heading order: ${headings}`).toBe(headings.length - 1);
  });

  test(`security at 768px: no fact heading is smaller than the subheadings ${prefix || "/"}`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1000 });
    await page.goto(`${prefix}/security/`);
    for (const h of await page.locator("main .row h2").all()) expect(await h.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(19);
  });

  test(`download: the tagline is the site's summary line ${prefix || "/"}`, async ({ page }) => {
    await page.goto(`${prefix}/download/`);
    await expect(page.locator(".page-hero .tagline")).toHaveText(strings["home.summary"]!);
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`roadmap: tone-ruled groups, Later ruled in Night Line in dark mode, no lines between items (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/roadmap/");
    await expect(page.locator("main .prose")).toHaveCount(0);
    const rule = (status: string) => page.locator(`[data-roadmap="${status}"]`).evaluate((e) => [getComputedStyle(e).borderTopWidth, getComputedStyle(e).borderTopColor]);
    expect(await rule("shipped")).toEqual(["3px", "rgb(0, 186, 124)"]);
    expect(await rule("next")).toEqual(["3px", "rgb(29, 161, 242)"]);
    expect(await rule("later")).toEqual(["3px", scheme === "dark" ? "rgb(56, 68, 77)" : "rgb(203, 213, 225)"]);
    // The group rule is the only rule, so Later never reads as one more item under Next
    const between = page.locator("[data-roadmap] li + li");
    expect(await between.count()).toBeGreaterThan(0);
    for (const li of await between.all()) expect(await li.evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe("0px");
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

for (const [name, path] of [["blog post", "/blog/can-whatsapp-read-my-messages/"], ["privacy", "/privacy/"], ["legal", "/legal/"]]) for (const width of [320, 360, 639]) {
  test(`${name} at ${width}px: the text runs the full width, with no sheet edge`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
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

test("technical details: blue-ruled facts and sections like Security, no sheets, the full width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/security/technical-details/");
  // At a glance: four facts under a blue rule, no boxes and no feature tones
  for (const fact of await page.locator(".glance li").all()) {
    const style = await fact.evaluate((e) => ({ rule: [getComputedStyle(e).borderTopWidth, getComputedStyle(e).borderTopColor], side: getComputedStyle(e).borderInlineStartWidth, background: getComputedStyle(e).backgroundColor }));
    expect(style).toEqual({ rule: ["3px", "rgb(29, 161, 242)"], side: "0px", background: "rgba(0, 0, 0, 0)" });
  }
  // Every section is a blue-ruled row with its heading beside the text, on the page itself
  const sections = page.locator("main section[aria-labelledby]:has(a[href='#toc'])");
  expect(await sections.count()).toBe(8);
  for (const section of await sections.all()) {
    expect(await section.evaluate((e) => [getComputedStyle(e).borderTopWidth, getComputedStyle(e).borderTopColor])).toEqual(["3px", "rgb(29, 161, 242)"]);
    const [head, body] = await section.evaluate((e) => [e.querySelector("h2")!.getBoundingClientRect(), e.querySelector(".prose")!.getBoundingClientRect()].map((r) => ({ left: r.left, top: r.top })));
    expect(body.left).toBeGreaterThan(head.left);
  }
  await expect(page.locator("main .prose").first()).toHaveCSS("border-top-width", "0px");
  // The contents and "Back to contents" links stand alone, so each is a full tap target
  for (const link of await page.locator('nav[aria-labelledby="toc"] a, main a[href="#toc"]').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  // The rows reach the right of the 72rem column, as on Security
  const right = await sections.first().evaluate((e) => e.getBoundingClientRect().right);
  expect(right).toBeGreaterThan(1100);
  // A paragraph after a list gets the same space as one after a paragraph
  const after = page.locator(".prose :is(ul, ol) + p");
  expect(await after.count()).toBeGreaterThan(0);
  for (const p of await after.all()) expect(await p.evaluate((e) => getComputedStyle(e).marginTop)).toBe("14px");
});

// Stage 3 of the critique: the smaller page notes

test("blog index at 1024px: posts in two columns", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/blog/");
  const lefts = await page.locator(".posts > li").evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().left)));
  expect(new Set(lefts).size, `item lefts: ${lefts}`).toBe(2);
});

test("blog index below 1024px: one column", async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 900 });
  await page.goto("/blog/");
  const lefts = await page.locator(".posts > li").evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().left)));
  expect(new Set(lefts).size).toBe(1);
});

test("press kit: iPhone and iPad screenshots in separate groups, two across on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/press/");
  const groups = page.locator(".shot-group");
  await expect(groups.locator("h3")).toHaveText(["iPhone", "iPad"]);
  const hrefs = (i: number) => groups.nth(i).locator("li a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect((await hrefs(0)).every((h) => h!.startsWith("/press/iphone-"))).toBe(true);
  expect((await hrefs(1)).every((h) => h!.startsWith("/press/ipad-"))).toBe(true);
  const tops = await groups.nth(0).locator("li").evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().top)));
  expect(tops[0]).toBe(tops[1]);
});

test("press kit at 1280px: each device's screenshots fill one row", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/press/");
  await expect(page.locator(".shot-group")).toHaveCount(2);
  for (const group of await page.locator(".shot-group").all()) {
    const tops = await group.locator("li").evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().top)));
    expect(new Set(tops).size, `row tops: ${tops}`).toBe(1);
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`home: the Android line is a secondary supporting line (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const note = page.locator("#download p", { hasText: /Android/ }).last();
    expect(await note.evaluate((e) => getComputedStyle(e).color)).toBe(scheme === "dark" ? "rgb(203, 213, 225)" : "rgb(71, 85, 105)");
  });
}

test("support: the link after the FAQ starts a new group, 28px below its rule", async ({ page }) => {
  await page.goto("/support/");
  const gap = await page.locator(".faq").evaluate((faq) => faq.nextElementSibling!.getBoundingClientRect().top - faq.getBoundingClientRect().bottom);
  expect(gap).toBe(28);
});

test("download in dark mode: space above and below every store badge", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/download/");
  for (const card of await page.locator("li.card.on-sale").all()) {
    const space = await card.evaluate((c) => {
      const img = c.querySelector(".buy img")!.getBoundingClientRect();
      const text = c.querySelector(".status")!.getBoundingClientRect();
      return { above: img.top - text.bottom, below: c.getBoundingClientRect().bottom - img.bottom };
    });
    expect(space.above).toBeGreaterThanOrEqual(28);
    expect(space.below).toBeGreaterThanOrEqual(30);
  }
});

test("/go/: the reassurance dots are green and blue, not a feature's violet", async ({ page }) => {
  const path = "/go/ef9771/en/";
  // The forward an hour away, so the page stays as the visitor sees it
  await page.route(path, async (route) => {
    const response = await route.fetch();
    return route.fulfill({ response, body: (await response.text()).replace('content="0;', 'content="3600;') });
  });
  await page.goto(path, { waitUntil: "load" });
  const dots = await page.locator(".reassure .dot").evaluateAll((ds) => ds.map((d) => getComputedStyle(d).backgroundColor));
  expect(dots).toEqual(["rgb(0, 186, 124)", "rgb(29, 161, 242)"]);
});

test("home in German at 320px: \"Nutzt\" does not sit alone on its line", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/de/");
  const tops = await page.locator(".extras p").first().evaluate((p) => {
    // The top of the first and of the second word, wherever the middleware split the text
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const words: number[] = [];
    for (let node = walker.nextNode(); node && words.length < 2; node = walker.nextNode()) {
      for (const m of node.textContent!.matchAll(/\S+/g)) {
        if (words.length === 2) break;
        const range = document.createRange();
        range.setStart(node, m.index!);
        range.setEnd(node, m.index! + 1);
        words.push(Math.round(range.getBoundingClientRect().top));
      }
    }
    return words;
  });
  expect(tops[0]).toBe(tops[1]);
});

for (const scheme of ["light", "dark"] as const) {
  test(`features: the link after the FAQ looks like a link and starts a new group (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/features/");
    const link = page.locator(".faq-more a");
    expect(await link.evaluate((a) => [getComputedStyle(a).color, getComputedStyle(a).textDecorationLine])).toEqual([scheme === "dark" ? "rgb(76, 181, 245)" : INK_BLUE, "underline"]);
    const gap = await page.locator(".faq").evaluate((faq) => faq.nextElementSibling!.getBoundingClientRect().top - faq.getBoundingClientRect().bottom);
    expect(gap).toBe(28);
  });
}

test("privacy on a phone: the publisher line passes contrast on the page itself", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/privacy/");
  expect(await page.locator(".publisher").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(71, 85, 105)");
});
