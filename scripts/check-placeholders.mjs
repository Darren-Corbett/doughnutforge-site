// Finds unfilled values (src/data/placeholder.ts) in the built site. None are
// required at launch: the site shows no company details, press contact or first
// release date, and every store ID is filled in.
// Local builds: warns and lists them. Deploy builds (--strict): fails.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const dist = new URL("../dist", import.meta.url).pathname;
const MARKER = /\[\[PLACEHOLDER: ([^\]]+)\]\]/g;

const files = readdirSync(dist, { recursive: true })
  .map(String)
  .filter((f) => /\.(html|xml|json|txt|webmanifest)$/.test(f));

const found = new Map();
for (const file of files) {
  // Line-break markup (src/middleware.ts) may sit inside a placeholder's words; it is removed first
  const html = readFileSync(join(dist, file), "utf8").replace(/<span class="keep-word">([^<]*)<\/span>/g, "$1").replace(/<wbr>/g, "");
  for (const [, what] of html.matchAll(MARKER)) {
    found.set(what, (found.get(what) ?? new Set()).add(file));
  }
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
