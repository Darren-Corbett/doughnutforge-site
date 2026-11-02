// scripts/check-hreflang.mjs on a small built site of its own: a page that is
// built in more than one language must have hreflang links (that is, be in
// translatedPages in src/i18n/alternates.ts). A page in English only, such as a
// blog post, needs none. Blog posts carry a lastmod in the sitemap from their own
// date (updated, else published), each blog index the newest date of the posts
// under it; pages without a date carry none.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const SITE = "https://doughnut-forge.app";

type Page = { path: string; lang: string; alternates?: { hreflang: string; path: string }[]; published?: string; modified?: string; lastmod?: string };
const html = (p: Page) =>
  `<!doctype html><html lang="${p.lang}"><head><link rel="canonical" href="${SITE}${p.path}">${
    p.published ? `<meta property="article:published_time" content="${p.published}T00:00:00.000Z">` : ""
  }${p.modified ? `<meta property="article:modified_time" content="${p.modified}T00:00:00.000Z">` : ""}${(p.alternates ?? []).map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.path}">`).join("")}</head><body></body></html>`;

/** Builds a fake dist with these pages and a matching sitemap, then runs the check on it */
const check = async (pages: Page[]) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const p of pages) {
    const file = join(dist, p.path, "index.html");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html(p));
  }
  const urls = pages
    .map((p) => `<url><loc>${SITE}${p.path}</loc>${p.lastmod ? `<lastmod>${p.lastmod}T00:00:00.000Z</lastmod>` : ""}${(p.alternates ?? []).map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.path}"/>`).join("")}</url>`)
    .join("");
  writeFileSync(join(dist, "sitemap-0.xml"), `<urlset>${urls}</urlset>`);
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-hreflang.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

const pair = (path: string) => {
  const alternates = [
    { hreflang: "en-GB", path },
    { hreflang: "de", path: `/de${path}` },
    { hreflang: "x-default", path },
  ];
  return [
    { path, lang: "en-GB", alternates },
    { path: `/de${path}`, lang: "de", alternates },
  ];
};

test("passes when every page built in two languages has hreflang, and an English-only page has none", async () => {
  const result = await check([...pair("/"), ...pair("/features/"), { path: "/blog/a-post/", lang: "en-GB" }]);
  // The five pages above, not the real dist/
  expect(result.output).toContain("check-hreflang: 5 pages");
  expect(result.output).toContain("sitemap matches");
  expect(result.code).toBe(0);
});

test("fails when a page built in two languages has no hreflang (missing from translatedPages)", async () => {
  const result = await check([...pair("/"), { path: "/roadmap/", lang: "en-GB" }, { path: "/de/roadmap/", lang: "de" }]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("roadmap/");
  expect(result.output).toContain("translatedPages");
});

const post = (slug: string, date: string, lastmod: string | null = date): Page => ({ path: `/blog/${slug}/`, lang: "en-GB", published: date, lastmod: lastmod ?? undefined });

test("passes when each post has its date as lastmod and the blog index has the newest", async () => {
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-10-30" }, post("a", "2026-10-23"), post("b", "2026-10-30")]);
  expect(result.output).toContain("sitemap matches");
  expect(result.code).toBe(0);
});

test("fails when a post has no lastmod in the sitemap", async () => {
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-10-23" }, post("a", "2026-10-23", null)]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("/blog/a/ lastmod is missing, expected 2026-10-23");
});

test("fails when the blog index lastmod is not the newest post's date", async () => {
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-10-23" }, post("a", "2026-10-23"), post("b", "2026-10-30")]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("/blog/ lastmod is 2026-10-23, expected 2026-10-30");
});

test("fails when a page without a date has a lastmod", async () => {
  const [home, de] = pair("/");
  const result = await check([{ ...home, lastmod: "2026-11-02" }, de]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("https://doughnut-forge.app/ lastmod is 2026-11-02, expected none");
});

test("passes when an updated post has its updated date as lastmod", async () => {
  const updated = { ...post("a", "2026-10-23", "2026-11-01"), modified: "2026-11-01" };
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-11-01" }, updated]);
  expect(result.output).toContain("sitemap matches");
  expect(result.code).toBe(0);
});

test("fails when an updated post keeps its published date as lastmod", async () => {
  const updated = { ...post("a", "2026-10-23"), modified: "2026-11-01" };
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-11-01" }, updated]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("/blog/a/ lastmod is 2026-10-23, expected 2026-11-01");
});

test("fails when a post has the wrong lastmod", async () => {
  const result = await check([...pair("/"), { path: "/blog/", lang: "en-GB", lastmod: "2026-10-23" }, post("a", "2026-10-23", "2026-10-30")]);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("/blog/a/ lastmod is 2026-10-30, expected 2026-10-23");
});

test("gives a translated blog index the newest date of its own posts, not the English ones", async () => {
  const [enIndex, deIndex] = pair("/blog/");
  const result = await check([
    ...pair("/"),
    { ...enIndex, lastmod: "2026-10-30" },
    post("a", "2026-10-30"),
    { ...deIndex, lastmod: "2026-10-23" },
    { path: "/de/blog/b/", lang: "de", published: "2026-10-23", lastmod: "2026-10-23" },
  ]);
  expect(result.output).toContain("sitemap matches");
  expect(result.code).toBe(0);
});
