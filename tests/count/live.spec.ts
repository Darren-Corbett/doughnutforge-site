// The real build (dist/), with the counter's live address: every page counts,
// and every language has the footer line, /stats/ and the FAQ answer that say
// so. count-pages.json lists exactly the sitemap's pages. Build first.
import { readFileSync } from "node:fs";
import { expect, test } from "../support/browser";

const dist = new URL("../../dist/", import.meta.url).pathname;
const COUNTER = "https://doughnut-forge-counter.doughnutforge.workers.dev";
const languages = JSON.parse(readFileSync("src/i18n/languages.json", "utf8")).languages as { code: string; path: string }[];
const prefix = (path: string) => (path === "en" ? "" : `/${path}`);
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  return own[key] ?? ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};
const text = (html: string) =>
  html
    .replace(/<span class="keep-word">([^<]*)<\/span>/g, "$1")
    .replace(/<wbr>/g, "")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

for (const { code, path } of languages)
  test(`${code}: the page script, the footer line, /stats/ and the FAQ answer`, async ({ request }) => {
    const home = text(await (await request.get(`${prefix(path)}/`)).text());
    expect(home).toContain(`data-counter="${COUNTER}"`);
    expect(home).toContain(await ui(code, "stats.footer"));
    expect(home).toContain(`href="${prefix(path)}/stats/"`);
    const stats = await request.get(`${prefix(path)}/stats/`);
    expect(stats.status()).toBe(200);
    expect(text(await stats.text())).toContain(await ui(code, "stats.title"));
    const support = text(await (await request.get(`${prefix(path)}/support/`)).text());
    expect(support).toContain(await ui(code, "faq.data.a"));
  });

test("the English FAQ answer says what the website keeps", async () => {
  const en = (await import("../../src/i18n/ui/en.ts")).default as Record<string, string>;
  expect(en["faq.data.a"]).toContain("This website keeps only anonymous daily totals of page views");
  expect(en["faq.data.a"]).not.toContain("this website has no analytics");
});

test("count-pages.json lists exactly the sitemap's pages, each with its language, and the stores on sale", () => {
  const list = JSON.parse(readFileSync(`${dist}count-pages.json`, "utf8"));
  const sitemap = readFileSync(`${dist}sitemap-0.xml`, "utf8");
  const inSitemap = [...sitemap.matchAll(/<loc>https:\/\/doughnut-forge\.app([^<]*)<\/loc>/g)].map((m) => m[1]);
  expect(Object.keys(list.pages).sort()).toEqual(inSitemap.sort());
  expect(list.pages["/"]).toBe("en");
  expect(list.pages["/de/features/"]).toBe("de");
  expect(list.pages["/pt-br/"]).toBe("pt-BR");
  for (const { code, path } of languages) expect(list.pages[`${prefix(path)}/stats/`], code).toBe(code);
  const codes = languages.map((l) => l.code);
  for (const [page, code] of Object.entries(list.pages)) expect(codes, page).toContain(code);
  expect(Object.keys(list.pages).some((p) => p.startsWith("/go/"))).toBe(false);
  expect([...list.stores].sort()).toEqual(["app-store", "mac-app-store", "microsoft-store"]);
});
