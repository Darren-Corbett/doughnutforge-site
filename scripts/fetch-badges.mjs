// Downloads the official store badge for each site language into
// src/assets/badges/<store>/<code>.svg, unaltered. Runs on a developer machine
// only; the files are committed. No build script and no deploy ever runs this or
// calls a store's site: the site serves its own copies.
//
//   node scripts/fetch-badges.mjs [--stores app-store,mac-app-store,microsoft-store]
//
// A language the store has no badge for is left out (the page then shows the
// English badge, marked as English). A store that answers an unknown language with
// its English badge is detected by comparing with that English badge.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const args = process.argv.slice(2);
const only = args.includes("--stores") ? args[args.indexOf("--stores") + 1].split(",") : null;

// Each store's own locale name for a site language
const APPLE = {
  en: "en-gb", "en-US": "en-us", fr: "fr-fr", de: "de-de", es: "es-es", "es-MX": "es-mx", it: "it-it", nl: "nl-nl",
  sv: "sv-se", da: "da-dk", fi: "fi-fi", no: "no-no", pl: "pl-pl", cs: "cs-cz", hu: "hu-hu", ro: "ro-ro", ru: "ru-ru",
  el: "el-gr", uk: "uk-ua", "pt-BR": "pt-br", tr: "tr-tr", ja: "ja-jp", "zh-CN": "zh-cn", "zh-TW": "zh-tw", ko: "ko-kr",
  hi: "hi-in", id: "id-id", ms: "ms-my", th: "th-th", vi: "vi-vn",
};
// Microsoft has one Spanish badge: it serves Spain and Mexico alike
const MICROSOFT = { en: "en-gb", "en-US": "en-us", "es-MX": "es", "pt-BR": "pt-br", "zh-CN": "zh-cn", "zh-TW": "zh-tw", no: "nb" };

const STORES = {
  "app-store": { english: "en-us", url: (loc) => `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/${loc}`, locale: (c) => APPLE[c] },
  "mac-app-store": { english: "en-us", url: (loc) => `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-mac-app-store/black/${loc}`, locale: (c) => APPLE[c] },
  "microsoft-store": { english: "en-us", url: (loc) => `https://get.microsoft.com/images/${loc}%20dark.svg`, locale: (c) => MICROSOFT[c] ?? c.toLowerCase() },
};

const get = async (url) => {
  const res = await fetch(url);
  const type = res.headers.get("content-type") ?? "";
  return res.ok && type.includes("svg") ? await res.text() : null;
};

const sources = {};
for (const [store, s] of Object.entries(STORES)) {
  if (only && !only.includes(store)) continue;
  const english = await get(s.url(s.english));
  if (!english) throw new Error(`${store}: the English badge did not download from ${s.url(s.english)}`);
  mkdirSync(join(SITE, "src/assets/badges", store), { recursive: true });
  const got = [];
  const missing = [];
  for (const { code } of languages) {
    const loc = s.locale(code);
    const svg = loc && (await get(s.url(loc)));
    // English (UK and US) uses the English badge; other languages only a badge of their own
    if (!svg || (svg === english && !code.startsWith("en"))) {
      missing.push(code);
      continue;
    }
    writeFileSync(join(SITE, "src/assets/badges", store, `${code}.svg`), svg);
    got.push(code);
    sources[`${store}/${code}.svg`] = s.url(loc);
  }
  console.log(`${store}: ${got.length} badges (${got.join(", ")})${missing.length ? `; none for ${missing.join(", ")}` : ""}`);
}

const file = join(SITE, "src/assets/badges/sources.json");
const previous = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
writeFileSync(file, JSON.stringify({ ...previous, ...sources, _fetched: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");
console.log("wrote src/assets/badges/sources.json");
