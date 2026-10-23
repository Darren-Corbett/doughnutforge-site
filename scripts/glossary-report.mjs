// For review: where each app term (src/i18n/glossary/<code>.json) appears in a
// language's site copy, next to where the English term appears. A report, not a
// check: Finnish, Hungarian and other languages inflect the terms, so a missing
// exact match is a prompt to look, not an error.
//
//   node scripts/glossary-report.mjs [--langs de,fi | all]

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const langArg = args.includes("--langs") ? args[args.indexOf("--langs") + 1] : "all";
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const load = async (code) => (await import(pathToFileURL(join(SITE, "src/i18n/ui", `${code}.ts`)).href)).default;
const en = await load("en");

// Only short terms; the "(sentence)" entries are whole app sentences, checked by the reviewer
for (const lang of languages.filter((l) => l.code !== "en" && (langArg === "all" || langArg.split(",").includes(l.code)))) {
  const ui = await load(lang.code);
  const { terms } = JSON.parse(readFileSync(join(SITE, "src/i18n/glossary", `${lang.code}.json`), "utf8"));
  console.log(`\n${lang.name} (${lang.code})`);
  for (const [term, { text }] of Object.entries(terms).filter(([t]) => !t.includes("(sentence)"))) {
    const enKeys = Object.keys(ui).filter((k) => en[k]?.toLowerCase().includes(term.toLowerCase()));
    if (!enKeys.length) continue;
    const stem = text.toLowerCase().slice(0, Math.max(4, Math.ceil(text.length * 0.7)));
    const found = enKeys.filter((k) => ui[k].toLowerCase().includes(stem));
    const mark = found.length === enKeys.length ? "ok  " : "LOOK";
    console.log(`  ${mark} "${term}" = "${text}": in ${found.length} of ${enKeys.length} keys${found.length < enKeys.length ? ` (check ${enKeys.filter((k) => !found.includes(k)).join(", ")})` : ""}`);
  }
}
