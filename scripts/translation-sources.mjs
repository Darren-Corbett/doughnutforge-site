// Which English text each translated string was translated from.
// src/i18n/sources/<code>.json maps every translated key to two fingerprints:
//   en:   the English string it was translated from
//   text: the translation as it was when it was stamped
// A key is stale when the English has changed since; it has an unstamped edit when
// the translation changed without being stamped again. Used by
// check-translations.mjs, stamp-translations.mjs and review-sheet.mjs.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
export const SOURCES_DIR = join(SITE, "src/i18n/sources");

/** The first 12 hex characters of SHA-256 of the exact string */
export const fingerprint = (text) => createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);

export const englishOnly = (key) => /^(blog|meta\.blog|notFound|meta\.notFound|issue)\.|^nav\.blog$/.test(key);

/**
 * The keys a language translates. en-US reuses UK English for every string it
 * does not override, and an inherited string can never be stale, so for en-US
 * only the strings that differ from UK English count.
 */
export const translatedKeys = (code, ui, en) =>
  Object.keys(en).filter((k) => !englishOnly(k) && k in ui && !(code === "en-US" && ui[k] === en[k]));

export const sourcesPath = (code) => join(SOURCES_DIR, `${code}.json`);
export const loadSources = (code) => (existsSync(sourcesPath(code)) ? JSON.parse(readFileSync(sourcesPath(code), "utf8")) : {});

/** Each translated key's state against its record: ok, stale, edited (unstamped) or missing */
export const sourceState = (code, ui, en, sources = loadSources(code)) => {
  const state = { stale: [], edited: [], missing: [], orphaned: [] };
  const keys = translatedKeys(code, ui, en);
  for (const key of keys) {
    const rec = sources[key];
    if (!rec) state.missing.push(key);
    else if (rec.en !== fingerprint(en[key])) state.stale.push(key);
    else if (rec.text !== fingerprint(ui[key])) state.edited.push(key);
  }
  state.orphaned = Object.keys(sources).filter((k) => !keys.includes(k));
  return state;
};
