// No content blocker on a phone may hide or block anything on the site. Every
// page, as Safari on an iPhone (WebKit) and as Chrome on Android (Chromium),
// against every public list phone browsers use (tests/blockers/lists.ts): no
// hiding rule may match any element, no network rule may match any request, no
// script may be injected, and every request stays on the site, so domain-based
// tracker lists (Firefox, Edge, DuckDuckGo) have nothing to block either.
// Downloads the lists, so it runs only when asked: `npm run test:blockers`.
import { expect, test, type Page } from "@playwright/test";
import { Request } from "@ghostery/adblocker";
import { loadLists, type Loaded } from "./lists";
import { pages } from "../support/site";

// One engine per browser: the pages run in order in one worker
test.describe.configure({ mode: "serial" });

/** Splits a selector list at commas outside brackets, parentheses and quotes */
const splitSelectors = (list: string) => {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    const c = list[i]!;
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out.filter(Boolean);
};

/** What the blockers would do to the page now open: hidden elements, injected scripts, extended rules */
const blockedOn = async (page: Page, url: string) => {
  const dom = await page.evaluate(() => ({
    classes: [...new Set([...document.querySelectorAll("[class]")].flatMap((e) => [...e.classList]))],
    ids: [...document.querySelectorAll("[id]")].map((e) => e.id),
    hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")!),
  }));
  const { styles, scripts, extended } = loaded.engine.getCosmeticsFilters({
    url,
    hostname: "doughnut-forge.app",
    domain: "doughnut-forge.app",
    ...dom,
    getBaseRules: true,
    getInjectionRules: true,
    getExtendedRules: true,
    getRulesFromHostname: true,
    getRulesFromDOM: true,
  });
  // Every selector the blockers would style (hide), tried on the page
  const selectors = [...styles.matchAll(/([^{}]+)\{[^}]*\}/g)].flatMap((m) => splitSelectors(m[1]!));
  const hidden = await page.evaluate((sels) => {
    const out: string[] = [];
    for (const s of sels) {
      let found: Element[] = [];
      try {
        found = [...document.body.querySelectorAll(s)];
      } catch {
        continue;
      }
      for (const e of found) out.push(`${s} hides <${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ""} ${(e.getAttribute("href") ?? e.getAttribute("alt") ?? e.className ?? "").toString().slice(0, 60)}>`);
    }
    return out;
  }, selectors);
  return { hidden, scripts, extended, selectors: selectors.length };
};

let loaded: Loaded;
test.beforeAll(async () => {
  test.setTimeout(15 * 60_000);
  loaded = await loadLists();
  expect(loaded.lists.length, "lists downloaded").toBeGreaterThan(100);
});

// The check itself must work: a class a list is known to hide is found
test("the check finds an element a list hides", async ({ page }) => {
  await page.setContent('<!doctype html><body><a class="icon--app-store" href="#">x</a></body>');
  const { hidden, selectors } = await blockedOn(page, "https://doughnut-forge.app/");
  expect(selectors, "hiding rules loaded").toBeGreaterThan(1000);
  expect(hidden.join("\n")).toContain(".icon--app-store");
});

for (const path of pages) {
  test(`${path}`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const requests: { url: string; type: string }[] = [];
    page.on("request", (r) => requests.push({ url: r.url(), type: r.resourceType() }));
    await page.goto(path, { waitUntil: "load" });

    // The live address, so domain rules for doughnut-forge.app apply too
    const url = `https://doughnut-forge.app${path}`;
    const { hidden, scripts, extended } = await blockedOn(page, url);
    const why = (rule: string) => `${rule}\n      from: ${loaded.whereIs(rule.split(" hides ")[0]!).slice(0, 4).join("; ") || "unknown list"}`;
    expect(hidden.map(why), `${path}: elements a blocker would hide`).toEqual([]);
    expect(scripts, `${path}: scripts a blocker would inject`).toEqual([]);
    expect(extended.map((e) => JSON.stringify(e)), `${path}: extended hiding rules that apply`).toEqual([]);

    for (const r of requests) {
      expect(new URL(r.url).origin, `${path}: every request stays on the site`).toBe(origin);
      const { match, filter } = loaded.engine.match(Request.fromRawDetails({ url: r.url.replace(origin, "https://doughnut-forge.app"), sourceUrl: url, type: r.type as never }));
      expect(match ? `${r.url} blocked by ${filter?.toString()}` : null, `${path}: requests a blocker would block`).toBeNull();
    }
  });
}
