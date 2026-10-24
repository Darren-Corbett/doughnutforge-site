// What the tests run over: every page in the built sitemap, plus the 404 page.
// Narrow a run with PAGES (a regular expression on the path) or LANGS (a comma
// list of path prefixes, "en" for the unprefixed English pages).
import { readFileSync } from "node:fs";

const SITE = "https://doughnut-forge.app";
const root = new URL("../../", import.meta.url).pathname;

export const dist = `${root}dist`;

const sitemap = readFileSync(`${dist}/sitemap-0.xml`, "utf8");
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.replace(SITE, "")).concat("/404.html");

/** The language prefix of a path: "de" for /de/features/, "en" for /features/ */
export const langOf = (path: string) => {
  const first = path.split("/")[1] ?? "";
  return /^[a-z]{2}(-[a-z]{2})?$/.test(first) ? first : "en";
};

/** The page without its language: "/features/" for /de/features/ */
export const templateOf = (path: string) => {
  const lang = langOf(path);
  return lang === "en" ? path : path.slice(lang.length + 1);
};

const pagesFilter = process.env.PAGES ? new RegExp(process.env.PAGES) : null;
const langsFilter = process.env.LANGS?.split(",");

export const pages = all.filter(
  (p) => (!pagesFilter || pagesFilter.test(p)) && (!langsFilter || langsFilter.includes(langOf(p))),
);

// 320px is iPhone Display Zoom ("Larger Text"), a real setting: required like the rest
export const WIDTHS = [320, 360, 390, 768, 1280, 1440] as const;
/** Phone widths, where the header links must sit on one row. PHONE_WIDTHS=375,414 tries others. */
export const PHONE_WIDTHS: number[] = process.env.PHONE_WIDTHS?.split(",").map(Number) ?? [320, 360, 390, 430];
export const THEMES = ["light", "dark"] as const;
