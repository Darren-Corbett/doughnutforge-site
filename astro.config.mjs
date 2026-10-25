// @ts-check
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import languageData from "./src/i18n/languages.json" with { type: "json" };
import review from "./src/i18n/review.json" with { type: "json" };
import { alternatesFor } from "./src/i18n/alternates.ts";
import { assetFileNames } from "./scripts/asset-names.mjs";

// Every app language gets its own URL tree from the start, so URLs never change
// when a language goes live. English (UK) is the default and lives at "/".
const locales = languageData.languages.map((l) => (l.code === l.path ? l.code : { path: l.path, codes: [l.code] }));

// Astro types locales as literal tuples; this list comes from JSON, so the type is asserted here.
/** @type {any} */
const i18n = {
  defaultLocale: "en",
  locales,
  routing: { prefixDefaultLocale: false },
};

// Published blog posts by URL: a post is published once its front matter says
// `draft: false`. Drafts and an empty blog index stay out of the sitemap.
const blogDir = "./src/content/blog";
const published = existsSync(blogDir)
  ? readdirSync(blogDir, { recursive: true })
      .map(String)
      .filter((f) => /(^|\/)[^_/][^/]*\.mdx?$/.test(f) && /^draft:\s*false\s*$/m.test(readFileSync(`${blogDir}/${f}`, "utf8")))
      .map((f) => {
        const [lang, file] = f.split("/");
        const path = languageData.languages.find((l) => l.code === lang)?.path ?? lang;
        return `${lang === "en" ? "" : `/${path}`}/blog/${file.replace(/\.mdx?$/, "")}/`;
      })
  : [];

// A page's language and its path without the language folder: "/de/features/" -> de, "features/"
/** @param {string} pathname */
const splitPath = (pathname) => {
  const [first = "", ...rest] = pathname.replace(/^\/+/, "").split("/");
  const lang = languageData.languages.find((l) => l.code !== "en" && l.path === first);
  return lang ? { code: lang.code, page: rest.join("/") } : { code: "en", page: pathname.replace(/^\/+/, "") };
};
// Draft translations are built but not indexed (src/i18n/review.json)
/** @type {Record<string, { status: string }>} */
const reviewStatus = review;
const reviewed = (/** @type {string} */ code) => reviewStatus[code]?.status === "reviewed";

/** @param {string} page */
const inSitemap = (page) => {
  const path = new URL(page).pathname;
  if (!reviewed(splitPath(path).code)) return false;
  if (path === "/404/" || path.endsWith("/404/")) return false;
  // The pages that forward to a store when a blocker hides its badge (src/pages/get/)
  if (path.startsWith("/get/")) return false;
  if (/\/blog\/$/.test(path)) return published.length > 0;
  if (/\/blog\/.+/.test(path)) return published.includes(path);
  return true;
};

export default defineConfig({
  site: "https://doughnut-forge.app",
  trailingSlash: "always",
  build: { format: "directory" },
  i18n,
  integrations: [
    mdx(),
    sitemap({
      filter: inSitemap,
      // Alternate-language links: exactly the hreflang list in each page's <head>
      // (src/i18n/alternates.ts), so only reviewed languages, plus x-default
      serialize: (item) => {
        const { code, page } = splitPath(new URL(item.url).pathname);
        const links = alternatesFor(code, page).map((a) => ({ url: a.href, lang: a.hreflang }));
        return { ...item, links: links.length ? links : undefined };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // The same names in every build of the same commit (scripts/asset-names.mjs)
    build: { rolldownOptions: { output: { assetFileNames } } },
  },
});
