// Links, in the built site and live. Uses the network: run with `npm run test:links`.
// - every internal link and image in dist/ points at a file that exists, and
//   every #fragment at an id on its page
// - every external link answers (each distinct URL fetched once)
// - the live feed, sitemap, robots.txt, apple-app-site-association and 404
// - the old forge-privacy page sends every ?lang= to the right new page
import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import { dist } from "../support/site";

const LIVE = "https://doughnut-forge.app";
const languages = languageData.languages;

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = `${dir}/${f}`;
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
const files = htmlFiles(dist);
const urlOf = (file: string) => file.slice(dist.length).replace(/index\.html$/, "");
const attrs = (html: string) => [...html.matchAll(/\s(?:href|src)="([^"]+)"|\ssrcset="([^"]+)"/g)].flatMap((m) => (m[1] ? [m[1]] : m[2]!.split(",").map((s) => s.trim().split(/\s+/)[0]!)));
const ids = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!));
const decode = (s: string) => s.replaceAll("&amp;", "&");

/** The file in dist/ that a site path serves, or null */
const served = (path: string) => {
  const clean = decodeURI(path.split(/[?#]/)[0]!);
  for (const c of [clean, `${clean}index.html`, `${clean}/index.html`]) if (existsSync(dist + c) && statSync(dist + c).isFile()) return dist + c;
  return null;
};

test("internal links, images and fragments resolve in the build", () => {
  const broken: string[] = [];
  const idsByUrl = new Map(files.map((f) => [urlOf(f), ids(readFileSync(f, "utf8"))]));
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const here = urlOf(file);
    for (let ref of attrs(html).map(decode)) {
      if (ref.startsWith(LIVE)) ref = ref.slice(LIVE.length) || "/";
      if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
      const [path, fragment] = ref.split("#");
      const target = path ? new URL(path, `http://x${here}`).pathname : here;
      if (path && !served(target)) broken.push(`${here}: ${ref}`);
      else if (fragment && !idsByUrl.get(target.endsWith("/") ? target : `${target}/`)?.has(fragment) && !idsByUrl.get(target)?.has(fragment)) broken.push(`${here}: #${fragment} not found`);
    }
  }
  expect([...new Set(broken)]).toEqual([]);
});

// Sites that answer 403 to every automated request (bot protection), so a 403
// says nothing about the link. Each was opened in a browser before it was used:
// Sky News, 30 October 2026, for the post on WhatsApp (docs/BLOG-CLAIMS.md 6.12).
const BOT_BLOCKED = ["https://news.sky.com/"];
test("external links answer", async ({ request }) => {
  test.setTimeout(5 * 60_000);
  const urls = new Set<string>();
  for (const file of files)
    for (const ref of attrs(readFileSync(file, "utf8")).map(decode))
      if (/^https?:/.test(ref) && !ref.startsWith(LIVE) && !ref.startsWith(MICROSOFT) && !BOT_BLOCKED.some((site) => ref.startsWith(site))) urls.add(ref);
  const results: { url: string; status: number | string; final?: string }[] = [];
  const queue = [...urls].sort();
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        try {
          const res = await request.get(url, { maxRedirects: 10, timeout: 30_000, headers: { "Accept-Language": "en-GB,en;q=0.9" } });
          results.push({ url, status: res.status(), final: res.url() !== url ? res.url() : undefined });
        } catch (e) {
          results.push({ url, status: String(e).slice(0, 120) });
        }
      }
    }),
  );
  results.sort((a, b) => a.url.localeCompare(b.url));
  test.info().attach("external-links.json", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
  console.log(results.map((r) => `${r.status}  ${r.url}${r.final ? `  -> ${r.final}` : ""}`).join("\n"));
  expect(results.filter((r) => typeof r.status !== "number" || r.status >= 400)).toEqual([]);
});

// The Microsoft Store answers 403 to plain HTTP clients and to about half of
// headless browser visits (bot protection), so a 403 here says nothing about
// the link. Each language's link is opened in a browser: a page that loads must
// be the app's page. If every visit is blocked the test is skipped, not passed.
const MICROSOFT = "https://apps.microsoft.com/";
// Apple sells the Mac and the iPhone and iPad apps under different IDs, and a
// link with either ID opens a page: Apple's own lookup says which app each is
test("App Store links open each platform's own app", async ({ request }) => {
  const APPS = {
    "6812778888": { kind: "mac-software", devices: [] },
    "6821344597": { kind: "software", devices: [/^iPhone/, /^iPad/] },
  };
  const urls = new Set<string>();
  for (const file of files) for (const ref of attrs(readFileSync(file, "utf8")).map(decode)) if (ref.startsWith("https://apps.apple.com/")) urls.add(ref);
  // No country code, so Apple opens the visitor's own storefront
  expect([...urls].sort()).toEqual(Object.keys(APPS).map((id) => `https://apps.apple.com/app/id${id}`));
  for (const [id, want] of Object.entries(APPS)) {
    const { results } = await (await request.get(`https://itunes.apple.com/lookup?id=${id}`)).json();
    expect(results[0]?.kind, `id${id} is a ${want.kind} app`).toBe(want.kind);
    for (const device of want.devices) expect(results[0].supportedDevices.some((d: string) => device.test(d)), `id${id} runs on ${device}`).toBe(true);
  }
});

test("Microsoft Store links open the app's page", async ({ page }) => {
  test.setTimeout(5 * 60_000);
  const urls = new Set<string>();
  for (const file of files) for (const ref of attrs(readFileSync(file, "utf8")).map(decode)) if (ref.startsWith(MICROSOFT)) urls.add(ref);
  expect(urls.size).toBe(languages.length);
  let opened = 0;
  for (const url of urls) {
    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    const status = res?.status() ?? 0;
    console.log(`${status === 403 ? "403 (blocked as a bot)" : status}  ${url}  -> ${page.url()}`);
    if (status === 403) continue;
    expect.soft(status, url).toBeLessThan(400);
    await expect.soft(page.locator("h1").first(), url).toContainText("Doughnut Forge", { timeout: 20_000 });
    opened++;
  }
  test.skip(opened === 0, "The Microsoft Store blocked every visit as a bot: check one link by hand");
});

test.describe("live site", () => {
  test("home and download pages are the current build", async ({ request }) => {
    for (const path of ["/", "/download/"]) {
      const live = await (await request.get(`${LIVE}${path}`)).text();
      expect(live, `${path} is not the old placeholder`).not.toContain("Coming soon.</p>");
      expect(live, `${path} is the new site`).toContain('<link rel="canonical"');
      const built = readFileSync(served(path)!, "utf8");
      const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);
      console.log(`${path}: live ${hash(live)}, this build ${hash(built)}${hash(live) === hash(built) ? " (same)" : " (differs: the build may be newer or older than the deploy)"}`);
    }
  });

  test("feed, sitemap and robots.txt", async ({ request }) => {
    const rss = await request.get(`${LIVE}/rss.xml`);
    expect(rss.status()).toBe(200);
    expect(rss.headers()["content-type"]).toMatch(/xml/);
    const feed = await rss.text();
    expect(feed).toContain("<rss");
    for (const link of [...feed.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]!)) expect((await request.get(link)).status(), link).toBe(200);

    const index = await request.get(`${LIVE}/sitemap-index.xml`);
    expect(index.status()).toBe(200);
    const sitemaps = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(sitemaps.length).toBeGreaterThan(0);
    for (const s of sitemaps) {
      const locs = [...(await (await request.get(s)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
      // The live sitemap lists the same pages as this build's
      expect(locs.length, s).toBe([...readFileSync(`${dist}/sitemap-0.xml`, "utf8").matchAll(/<loc>/g)].length);
      // Spot-check one page per language rather than fetching every page
      for (const loc of locs.filter((l) => /\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?features\/$/.test(l))) expect((await request.get(loc)).status(), loc).toBe(200);
    }

    const robots = await request.get(`${LIVE}/robots.txt`);
    expect(robots.status()).toBe(200);
    const text = await robots.text();
    expect(text).toContain("Sitemap: https://doughnut-forge.app/sitemap-index.xml");
    expect(text).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test("apple-app-site-association", async ({ request }) => {
    const res = await request.get(`${LIVE}/.well-known/apple-app-site-association`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    console.log(`content-type: ${res.headers()["content-type"]}`);
    const aasa = JSON.parse(await res.text());
    expect(aasa.webcredentials.apps).toEqual(expect.arrayContaining(["J74UEFCGU7.com.darrencorbett.doughnutforge", "J74UEFCGU7.com.darrencorbett.doughnutforge.mobile"]));
  });

  test("unknown pages answer 404 with the site's 404 page", async ({ request }) => {
    const res = await request.get(`${LIVE}/no-such-page-${Date.now()}/`);
    expect(res.status()).toBe(404);
    const html = await res.text();
    expect(html).toContain("<title>Page not found | Doughnut Forge</title>");
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
  });
});

test.describe("forge-privacy redirects", () => {
  const OLD = "https://darren-corbett.github.io/forge-privacy";

  test("the old page carries a canonical link, a meta refresh and a visible link", async ({ request }) => {
    for (const url of [OLD, `${OLD}/`, `${OLD}/index.html`]) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
      const html = await res.text();
      expect(html).toContain('<link rel="canonical" href="https://doughnut-forge.app/privacy/">');
      expect(html).toContain('<meta http-equiv="refresh" content="0; url=https://doughnut-forge.app/privacy/">');
      expect(html).toContain('<a href="https://doughnut-forge.app/privacy/">');
    }
  });

  for (const lang of [...languages.map((l) => l.code), "PT-br", "", "xx"]) {
    test(`?lang=${lang || "(none)"}`, async ({ page }) => {
      const l = languages.find((x) => x.code.toLowerCase() === lang.toLowerCase());
      const expected = `${LIVE}/${l && l.code !== "en" ? `${l.path}/` : ""}privacy/`;
      await page.goto(`${OLD}/${lang ? `?lang=${lang}` : ""}`);
      await page.waitForURL(expected, { timeout: 15_000 });
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }
});
