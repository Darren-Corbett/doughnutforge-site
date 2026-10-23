// Records which English text a translation was made from (src/i18n/sources/<code>.json),
// so check-translations.mjs can flag it once the English changes.
//
// Run it only after the strings have been translated AND passed the independent
// reviewer. Never run it just to silence the check.
//
//   node scripts/stamp-translations.mjs --lang de --keys faq.backup.a,home.tagline
//   node scripts/stamp-translations.mjs --lang de --all-keys
//   node scripts/stamp-translations.mjs --lang all --all-keys        (baseline)
//
// A stale key whose translation has not changed since it was last stamped is
// refused: either retranslate it, or, if the English change does not affect the
// translation (a typo fix in English, say), pass --confirm-unchanged.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { fingerprint, loadSources, SOURCES_DIR, sourcesPath, translatedKeys } from "./translation-sources.mjs";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const langArg = arg("--lang");
const keysArg = arg("--keys");
const allKeys = args.includes("--all-keys");
const confirmUnchanged = args.includes("--confirm-unchanged");
if (!langArg || (!keysArg && !allKeys)) {
  console.error("usage: stamp-translations.mjs --lang <code|all> (--keys a,b | --all-keys) [--confirm-unchanged]");
  process.exit(2);
}

const load = async (code) => (await import(pathToFileURL(join(SITE, "src/i18n/ui", `${code}.ts`)).href)).default;
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const codes = langArg === "all" ? languages.map((l) => l.code).filter((c) => c !== "en") : [langArg];
const en = await load("en");

mkdirSync(SOURCES_DIR, { recursive: true });
const refused = [];
for (const code of codes) {
  const ui = await load(code);
  const keys = translatedKeys(code, ui, en);
  // With --lang all, a key a language does not translate (en-US inherits most of
  // UK English) is skipped; for a single language it is a mistake
  const asked = allKeys ? keys : keysArg.split(",");
  const wanted = langArg === "all" ? asked.filter((k) => keys.includes(k)) : asked;
  const unknown = wanted.filter((k) => !keys.includes(k));
  if (unknown.length) {
    console.error(`${code}: not translated keys: ${unknown.join(", ")}`);
    process.exit(1);
  }
  const sources = loadSources(code);
  for (const key of wanted) {
    const rec = sources[key];
    const stale = rec && rec.en !== fingerprint(en[key]);
    if (stale && rec.text === fingerprint(ui[key]) && !confirmUnchanged) {
      refused.push(`${code} ${key}`);
      continue;
    }
    sources[key] = { en: fingerprint(en[key]), text: fingerprint(ui[key]) };
  }
  // Keys that are no longer translated (removed, or now inherited by en-US) drop out
  const sorted = Object.fromEntries(Object.keys(sources).filter((k) => keys.includes(k)).sort().map((k) => [k, sources[k]]));
  writeFileSync(sourcesPath(code), JSON.stringify(sorted, null, 2) + "\n");
  console.log(`${code}: stamped ${wanted.length - refused.filter((r) => r.startsWith(`${code} `)).length} key(s)`);
}
if (refused.length) {
  console.error(
    `refused ${refused.length} stale key(s) whose translation is unchanged (retranslate, or pass --confirm-unchanged):\n  ${refused.join("\n  ")}`,
  );
  process.exit(1);
}
