// Finds unfilled values (src/data/placeholder.ts) in the built site. None are
// required at launch: the site shows no company details, press contact or first
// release date, and every store ID is filled in.
// Local builds: warns and lists them. Deploy builds (--strict): fails.
// A [PENDING-...] marker (text still waiting on the app side, owner 20 November
// 2026) fails every build: it must never reach a published page.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: { strict: { type: "boolean" }, dist: { type: "string" } } });
const strict = Boolean(values.strict);
const dist = values.dist ?? new URL("../dist", import.meta.url).pathname;
const MARKER = /\[\[PLACEHOLDER: ([^\]]+)\]\]/g;
const PENDING = /\[PENDING-[A-Z0-9-]+\]/g;

const files = readdirSync(dist, { recursive: true })
  .map(String)
  .filter((f) => /\.(html|xml|json|txt|webmanifest)$/.test(f));

const found = new Map();
const pending = new Map();
const add = (map, what, file) => map.set(what, (map.get(what) ?? new Set()).add(file));
for (const file of files) {
  // Line-break markup (src/middleware.ts) may sit inside a placeholder's words; it is removed first
  const html = readFileSync(join(dist, file), "utf8").replace(/<span class="keep-word">([^<]*)<\/span>/g, "$1").replace(/<wbr>/g, "");
  for (const [, what] of html.matchAll(MARKER)) add(found, what, file);
  for (const [what] of html.matchAll(PENDING)) add(pending, what, file);
}

if (pending.size > 0) {
  console.error(`\ncheck-placeholders: ${pending.size} pending marker(s) on built pages:`);
  for (const [what, where] of pending) console.error(`  - ${what}  (${[...where].join(", ")})`);
  console.error("\nBuild stopped: a [PENDING-...] text may only sit behind a launch stage that is not reached (src/i18n/gated.ts).");
  process.exit(1);
}

if (found.size === 0) {
  console.log("check-placeholders: none found");
  process.exit(0);
}

console.log(`\ncheck-placeholders: ${found.size} value(s) still to fill in before deploying:`);
for (const [what, where] of found) console.log(`  - ${what}  (${[...where].join(", ")})`);
if (strict) {
  console.error("\nDeploy stopped: replace every placeholder in src/data/ first.");
  process.exit(1);
}
