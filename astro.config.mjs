// @ts-check
import { defineConfig } from "astro/config";
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

export default defineConfig({
  site: "https://doughnut-forge.app",
  trailingSlash: "always",
  build: { format: "directory" },
  i18n,
  vite: {
    plugins: [tailwindcss()],
  },
});
