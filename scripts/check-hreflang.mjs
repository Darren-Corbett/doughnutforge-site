// Checks the language links of the built site. Runs after `astro build`; any
// problem fails the build.
//   - an indexable page has a canonical to itself; a noindex page has none
//   - each hreflang list includes the page itself and x-default
//   - every hreflang target is a built, indexable page with the same list (both ways)
//   - no draft (noindex) page appears in any hreflang list or in the sitemap
//   - the sitemap lists every indexable page, with the same alternates as its <head>
//   - a page built in more than one language has hreflang links: it is listed in
//     translatedPages (src/i18n/alternates.ts). Only English-only pages, such as
//     blog posts, may have none.
//
//   node scripts/check-hreflang.mjs [--report <file.json>] [--dist <dir>]

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://doughnut-forge.app";
const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const dist = args.includes("--dist") ? args[args.indexOf("--dist") + 1] : join(SITE, "dist");
const reportFile = args.includes("--report") ? args[args.indexOf("--report") + 1] : null;

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const pages = new Map();
for (const file of readdirSync(dist, { recursive: true }).map(String)) {
  if (!file.endsWith("index.html")) continue;
  const html = readFileSync(join(dist, file), "utf8");
  const head = html.slice(0, html.indexOf("</head>"));
  const url = `${SITE_URL}/${file.replace(/index\.html$/, "")}`;
  pages.set(url, {
    lang: /<html[^>]*\slang="([^"]+)"/.exec(html)?.[1],
    noindex: /<meta name="robots" content="[^"]*noindex/.test(head),
    canonical: attr(/<link rel="canonical"[^>]*>/.exec(head)?.[0] ?? "", "href"),
    alternates: [...head.matchAll(/<link rel="alternate" hreflang[^>]*>/g)].map(([tag]) => ({
      hreflang: attr(tag, "hreflang"),
      href: attr(tag, "href"),
    })),
  });
}

const problems = [];
const key = (list) =>
  list
    .map((a) => `${a.hreflang} ${a.href}`)
    .sort()
    .join("\n");

for (const [url, page] of pages) {
  if (page.noindex) {
    if (page.canonical) problems.push(`${url}: noindex page has a canonical`);
    if (page.alternates.length) problems.push(`${url}: noindex page has hreflang links`);
    continue;
  }
  if (page.canonical !== url) problems.push(`${url}: canonical is ${page.canonical ?? "missing"}`);
  if (!page.alternates.length) continue;
  if (!page.alternates.some((a) => a.href === url && a.hreflang === page.lang)) problems.push(`${url}: hreflang list does not include itself (${page.lang})`);
  if (!page.alternates.some((a) => a.hreflang === "x-default")) problems.push(`${url}: no x-default`);
  const seen = new Set();
  for (const a of page.alternates) {
    if (seen.has(a.hreflang)) problems.push(`${url}: hreflang ${a.hreflang} appears twice`);
    seen.add(a.hreflang);
    const target = pages.get(a.href);
    if (!target) problems.push(`${url}: hreflang ${a.hreflang} points to ${a.href}, which was not built`);
    else if (target.noindex) problems.push(`${url}: hreflang ${a.hreflang} points to a noindex page ${a.href}`);
    else if (key(target.alternates) !== key(page.alternates)) problems.push(`${url}: ${a.href} does not link back with the same list`);
  }
}

// A page built in more than one language must have hreflang links. Without them
// it is missing from translatedPages, and its language menu sends readers to
// each language's home page instead of the same page.
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const folders = new Set(languages.filter((l) => l.code !== "en").map((l) => l.path));
const pageOf = (url) => {
  const [first = "", ...rest] = url.slice(SITE_URL.length + 1).split("/");
  return folders.has(first) ? rest.join("/") : [first, ...rest].join("/");
};
const builtIn = new Map();
for (const url of pages.keys()) builtIn.set(pageOf(url), (builtIn.get(pageOf(url)) ?? 0) + 1);
const unlisted = new Set();
for (const [url, page] of pages) {
  const name = pageOf(url);
  if (!page.noindex && !page.alternates.length && builtIn.get(name) > 1) unlisted.add(name);
}
for (const name of unlisted)
  problems.push(`"${name}" is built in ${builtIn.get(name)} languages but has no hreflang links: add it to translatedPages in src/i18n/alternates.ts`);

// The sitemap
const sitemapFile = join(dist, "sitemap-0.xml");
const inSitemap = new Map();
if (!existsSync(sitemapFile)) problems.push("dist/sitemap-0.xml is missing");
else {
  for (const [, body] of readFileSync(sitemapFile, "utf8").matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(body)[1];
    inSitemap.set(
      loc,
      [...body.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map(([, hreflang, href]) => ({ hreflang, href })),
    );
  }
  for (const [loc, links] of inSitemap) {
    const page = pages.get(loc);
    if (!page) problems.push(`sitemap: ${loc} was not built`);
    else if (page.noindex) problems.push(`sitemap: ${loc} is a noindex page`);
    else if (key(links) !== key(page.alternates)) problems.push(`sitemap: ${loc} alternates differ from the page's hreflang`);
  }
  for (const [url, page] of pages) {
    if (!page.noindex && !inSitemap.has(url)) problems.push(`sitemap: indexable page ${url} is missing`);
  }
}

const indexable = [...pages.values()].filter((p) => !p.noindex);
const languagesIndexed = [...new Set(indexable.map((p) => p.lang))].sort();
const summary = {
  pages: pages.size,
  indexable: indexable.length,
  noindex: pages.size - indexable.length,
  languagesIndexed,
  sitemapUrls: inSitemap.size,
  problems,
};
if (reportFile) writeFileSync(reportFile, JSON.stringify({ ...summary, detail: Object.fromEntries(pages) }, null, 2));

if (problems.length) {
  console.error(`check-hreflang: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `check-hreflang: ${pages.size} pages, ${indexable.length} indexable in ${languagesIndexed.join(", ")}, ${summary.noindex} noindex; sitemap matches`,
);
