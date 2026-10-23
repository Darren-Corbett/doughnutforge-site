// Copies the privacy policy, word for word, out of the forge-privacy page into
// src/content/legal/privacy/<lang>.json. Runs on a developer machine only, and
// never writes to forge-privacy. Download the page at a known commit first:
//
//   curl -fsSL https://raw.githubusercontent.com/Darren-Corbett/forge-privacy/<sha>/index.html -o <dir>/index.html
//   node scripts/extract-privacy.mjs <dir>/index.html --sha <sha> [--langs en,de | all] [--check]
//
// The page holds every language in a script (string tables plus link tokens such
// as [[gh]]...[[/gh]]). That script is run in a sandbox with stand-ins for the
// browser, and the finished tables are read back. English also appears in the
// page's static HTML; the two copies are compared and any difference is reported.
//
// --check writes nothing: it compares the page with the committed JSON instead.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const file = args[0];
if (!file || !existsSync(file)) {
  console.error("Usage: node scripts/extract-privacy.mjs <forge-privacy index.html> --sha <commit> [--langs en|all] [--check]");
  process.exit(1);
}
const sha = arg("--sha", "unknown");
const check = args.includes("--check");
const SITE = new URL("..", import.meta.url).pathname;
const OUT = join(SITE, "src/content/legal/privacy");

const html = readFileSync(file, "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
if (!script.includes("TRANSLATIONS")) throw new Error("No TRANSLATIONS table found in the page script.");

// Stand-ins for the few browser objects the page script touches when it runs
const sandbox = {
  URLSearchParams,
  window: { location: { search: "" } },
  navigator: { language: "en" },
  document: {
    querySelectorAll: () => [],
    getElementById: () => ({ value: "" }),
    documentElement: { lang: "" },
  },
};
vm.createContext(sandbox);
vm.runInContext(`${script}\n;globalThis.__out = { LINKS, TRANSLATIONS, enStrings };`, sandbox, { timeout: 2000 });
const { LINKS, TRANSLATIONS, enStrings } = sandbox.__out;

// "[[gh]]" -> the URL in '<a href="URL">'
const links = Object.fromEntries(
  Object.entries(LINKS).map(([token, tag]) => {
    const href = /href="([^"]+)"/.exec(tag)?.[1];
    if (!href) throw new Error(`Link token ${token} has no href`);
    return [token, href];
  }),
);

// The keys, in page order, as the static HTML has them
const staticCopy = Object.fromEntries(
  [...html.matchAll(/<(\w+)[^>]*\sdata-i18n="(\w+)"[^>]*>([\s\S]*?)<\/\1>/g)].map(([, , key, inner]) => [key, inner.trim()]),
);
const keys = Object.keys(staticCopy);

// Turn link tokens into the same <a> tags the page's own render() makes
const render = (text) =>
  text
    .replace(/\[\[(\w+)\]\]/g, (_, token) => `<a href="${links[token]}">`)
    .replace(/\[\[\/(\w+)\]\]/g, "</a>");
const squash = (s) => s.replace(/\s+/g, " ").trim();

let problems = 0;

// 1. The two English copies inside the forge-privacy page must agree
for (const key of keys) {
  if (squash(render(enStrings[key] ?? TRANSLATIONS.en[key] ?? "")) !== squash(staticCopy[key])) {
    problems++;
    console.log(`forge-privacy's static HTML and its English table differ at "${key}":`);
    console.log(`  html:  ${squash(staticCopy[key])}`);
    console.log(`  table: ${squash(render(TRANSLATIONS.en[key] ?? ""))}`);
  }
}

const langsArg = arg("--langs", "en");
const langs = langsArg === "all" ? Object.keys(TRANSLATIONS) : langsArg.split(",");

for (const lang of langs) {
  const table = TRANSLATIONS[lang];
  if (!table) throw new Error(`forge-privacy has no strings for ${lang}`);
  const strings = {};
  for (const key of keys) {
    // A key missing from a language falls back to English, as on forge-privacy
    const value = table[key] ?? enStrings[key];
    if (typeof value !== "string") throw new Error(`${lang} has no "${key}"`);
    strings[key] = value;
  }
  const data = { _source: `forge-privacy@${sha} index.html`, links, strings };
  const path = join(OUT, `${lang}.json`);

  if (check) {
    // 2. The committed copy must match the page, key by key and character by character
    const committed = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
    if (!committed) {
      problems++;
      console.log(`${lang}: no committed ${path}`);
      continue;
    }
    for (const key of keys) {
      if (committed.strings[key] !== strings[key]) {
        problems++;
        console.log(`${lang} "${key}" differs from forge-privacy:\n  site:   ${committed.strings[key]}\n  source: ${strings[key]}`);
      }
    }
    for (const [token, href] of Object.entries(links)) {
      if (committed.links[token] !== href) {
        problems++;
        console.log(`${lang} link ${token} differs: site ${committed.links[token]}, source ${href}`);
      }
    }
  } else {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
    console.log(`wrote src/content/legal/privacy/${lang}.json (${keys.length} keys)`);
  }
}

if (check) {
  console.log(problems ? `\n${problems} difference(s) from forge-privacy@${sha}` : `0 differences from forge-privacy@${sha} (${langs.join(", ")}, ${keys.length} keys)`);
}
process.exit(problems ? 1 : 0);
