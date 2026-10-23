// Checks every language's site copy (src/i18n/ui/<code>.ts) against English.
// Runs in `npm run build`; any problem fails it.
//   - every language has a file, with exactly the keys English has (less the
//     English-only blog and 404 keys)
//   - every {slot} in the English string is in the translation, and no other
//   - no HTML, and no leftover marker such as TODO or [[...]]
//   - no string is left in English, unless it is listed in src/i18n/same-as-english.json
//     (words that really are the same, such as "Download" in Danish)
//
//   node scripts/check-translations.mjs [--lang de]

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const only = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : null;

const load = async (code) => (await import(pathToFileURL(join(SITE, "src/i18n/ui", `${code}.ts`)).href)).default;
const englishOnly = (key) => /^(blog|meta\.blog|notFound|meta\.notFound)\.|^nav\.blog$/.test(key);
const slots = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

const en = await load("en");
const keys = Object.keys(en).filter((k) => !englishOnly(k));
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const same = JSON.parse(readFileSync(join(SITE, "src/i18n/same-as-english.json"), "utf8"));

const problems = [];
let checked = 0;
for (const { code } of languages) {
  if (code === "en" || (only && code !== only)) continue;
  if (!existsSync(join(SITE, "src/i18n/ui", `${code}.ts`))) {
    problems.push(`${code}: no src/i18n/ui/${code}.ts`);
    continue;
  }
  const ui = await load(code);
  checked++;
  const missing = keys.filter((k) => !(k in ui));
  const extra = Object.keys(ui).filter((k) => !keys.includes(k));
  if (missing.length) problems.push(`${code}: missing ${missing.join(", ")}`);
  if (extra.length) problems.push(`${code}: not in English (or English only): ${extra.join(", ")}`);
  for (const key of keys.filter((k) => k in ui)) {
    const text = ui[key];
    if (typeof text !== "string" || !text.trim()) problems.push(`${code} ${key}: empty`);
    else if (slots(text) !== slots(en[key])) problems.push(`${code} ${key}: slots {${slots(text)}} differ from English {${slots(en[key])}}`);
    // "TODO" in capitals only: "todo" is an ordinary word in Spanish and Portuguese
    else if (/<[a-z/][^>]*>/i.test(text) || /\bTODO\b|\[\[|\]\]/.test(text)) problems.push(`${code} ${key}: contains markup or a marker`);
    // US English shares most strings with UK English on purpose
    else if (code !== "en-US" && text === en[key] && !same[code]?.includes(key)) problems.push(`${code} ${key}: still English ("${text}")`);
  }
}

if (problems.length) {
  console.error(`check-translations: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-translations: ${checked} language(s), ${keys.length} keys each, all present with matching slots`);
