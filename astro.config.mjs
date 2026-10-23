// @ts-check
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import languageData from "./src/i18n/languages.json" with { type: "json" };

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
      .filter((f) => /(^|\/)[^_/][^/]*\.md$/.test(f) && /^draft:\s*false\s*$/m.test(readFileSync(`${blogDir}/${f}`, "utf8")))
      .map((f) => {
        const [lang, file] = f.split("/");
        const path = languageData.languages.find((l) => l.code === lang)?.path ?? lang;
        return `${lang === "en" ? "" : `/${path}`}/blog/${file.replace(/\.md$/, "")}/`;
      })
  : [];

/** @param {string} page */
const inSitemap = (page) => {
  const path = new URL(page).pathname;
  if (path === "/404/" || path.endsWith("/404/")) return false;
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
    sitemap({
      filter: inSitemap,
      // Alternate-language links between the same page in each language (Phase 3)
      i18n: {
        defaultLocale: "en",
        locales: Object.fromEntries(languageData.languages.map((l) => [l.path, l.hreflang])),
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
