// The real build (dist/), while src/data/counter.ts has no address: nothing is
// counted and nothing says it is. No page script, no footer line, no /stats/,
// and the FAQ keeps today's answer. count-pages.json is built anyway, so the
// counter knows the pages from the day counting starts. Build first.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };

const dist = new URL("../../dist/", import.meta.url).pathname;

test("no page has the counting script or the footer line", async ({ request }) => {
  for (const path of ["/", "/features/", "/de/", "/blog/"]) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toContain("data-counter");
    expect(html, path).not.toContain("counts page views");
    expect(html, path).not.toContain('href="/stats/"');
  }
});

test("/stats/ does not exist", async ({ request }) => {
  expect((await request.get("/stats/")).status()).toBe(404);
});

test("the support FAQ keeps today's answer", async ({ request }) => {
  const html = await (await request.get("/support/")).text();
  expect(html).toContain("this website has no analytics");
  expect(html).not.toContain("anonymous daily totals");
});

test("count-pages.json lists exactly the sitemap's pages, each with its language, and the stores on sale", () => {
  const list = JSON.parse(readFileSync(`${dist}count-pages.json`, "utf8"));
  const sitemap = readFileSync(`${dist}sitemap-0.xml`, "utf8");
  const inSitemap = [...sitemap.matchAll(/<loc>https:\/\/doughnut-forge\.app([^<]*)<\/loc>/g)].map((m) => m[1]);
  expect(Object.keys(list.pages).sort()).toEqual(inSitemap.sort());
  expect(list.pages["/"]).toBe("en");
  expect(list.pages["/features/"]).toBe("en");
  expect(list.pages["/de/features/"]).toBe("de");
  expect(list.pages["/pt-br/"]).toBe("pt-BR");
  const codes = languageData.languages.map((l) => l.code);
  for (const [path, code] of Object.entries(list.pages)) expect(codes, path).toContain(code);
  expect(Object.keys(list.pages).some((p) => p.startsWith("/go/"))).toBe(false);
  expect([...list.stores].sort()).toEqual(["app-store", "mac-app-store", "microsoft-store"]);
});
