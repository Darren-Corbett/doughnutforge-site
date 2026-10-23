// Lists, per store, which site languages have their own official badge and
// which fall back to English.  npm run badges
import { existsSync, readFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const { languages } = JSON.parse(readFileSync(`${root}src/i18n/languages.json`, "utf8"));
const stores = ["mac-app-store", "app-store", "microsoft-store", "google-play"];

for (const store of stores) {
  const has = (code) => existsSync(`${root}src/assets/badges/${store}/${code}.svg`);
  const own = languages.filter((l) => has(l.code)).map((l) => l.code);
  const fallback = languages.filter((l) => !has(l.code)).map((l) => l.code);
  console.log(`\n${store}${has("en") ? "" : "  (no en.svg: no badge can be shown)"}`);
  console.log(`  own badge (${own.length}): ${own.join(", ") || "none"}`);
  console.log(`  falls back to English (${fallback.length}): ${fallback.join(", ") || "none"}`);
}
