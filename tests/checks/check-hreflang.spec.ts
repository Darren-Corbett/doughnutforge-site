// scripts/check-hreflang.mjs on a small built site of its own: a page that is
// built in more than one language must have hreflang links (that is, be in
// translatedPages in src/i18n/alternates.ts). A page in English only, such as a
// blog post, needs none.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const SITE = "https://doughnut-forge.app";

type Page = { path: string; lang: string; alternates?: { hreflang: string; path: string }[] };
const html = (p: Page) =>
  `<!doctype html><html lang="${p.lang}"><head><link rel="canonical" href="${SITE}${p.path}">${(p.alternates ?? [])
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.path}">`)
    .join("")}</head><body></body></html>`;

/** Builds a fake dist with these pages and a matching sitemap, then runs the check on it */
const check = async (pages: Page[]) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const p of pages) {
    const file = join(dist, p.path, "index.html");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html(p));
  }
  const urls = pages
    .map((p) => `<url><loc>${SITE}${p.path}</loc>${(p.alternates ?? []).map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.path}"/>`).join("")}</url>`)
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
