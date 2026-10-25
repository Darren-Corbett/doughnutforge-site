// No class, id or built file name may use a word that content blockers hide or
// block on sight: private lists such as 1Blocker's and Wipr's cannot be tested
// (tests/blockers covers the public ones), so the site avoids their usual
// targets. A name fails when one of its parts, split at "-", "_" or ".", is one
// of these words: "store-banner" fails, "download" and Tailwind's
// "tracking-tight" do not.
//
//   node scripts/check-blocker-names.mjs [--dist <dir>]
import { readdirSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const WORDS = new Set(["ad", "ads", "adv", "advert", "adverts", "advertisement", "banner", "banners", "badge", "badges", "promo", "promos", "promoted", "sponsor", "sponsors", "sponsored", "popup", "popups", "social", "smartbanner", "appbanner"]);
const root = new URL("..", import.meta.url).pathname;
const dist = (parseArgs({ options: { dist: { type: "string" } } }).values.dist ?? `${root}dist`).replace(/\/?$/, "/");

const hit = (name) => name.toLowerCase().split(/[-_.]/).some((part) => WORDS.has(part));
const problems = new Set();
let names = 0;
for (const file of readdirSync(dist, { recursive: true }).map(String)) {
  // Built files: the site's own images, styles and scripts (social images are only fetched by sharing sites)
  if (file.startsWith("_astro/") && hit(file.slice(7))) problems.add(`file ${file}`);
  if (!file.endsWith(".html")) continue;
  for (const m of readFileSync(`${dist}${file}`, "utf8").matchAll(/\s(class|id)="([^"]*)"/g))
    for (const name of m[2].split(/\s+/).filter(Boolean)) {
      names++;
      if (hit(name)) problems.add(`${m[1]} "${name}" (${file})`);
    }
}
if (problems.size) {
  console.error(`check-blocker-names: content blockers hide names like these; rename them:\n  ${[...problems].slice(0, 40).join("\n  ")}`);
  process.exit(1);
}
console.log(`check-blocker-names: ${names} class and id names and every built file avoid words content blockers hide`);
