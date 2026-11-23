// A key held until a launch stage (src/i18n/gated.ts) shows its earlier text
// (src/i18n/before/<code>.json) until then. When the earlier text is already the
// new text, the page changes before its stage, or the stage changes nothing: on
// 23 November 2026 English would have shown a new Security line before 3.0 that
// way. Runs in `npm run build`; any such key fails it, unless it is listed in
// src/i18n/held-same.json with a one-line reason. An entry that is no longer
// needed fails too, so the list stays short (Darren, 23 November 2026).
//
//   node scripts/check-held-text.mjs [--root <repo>]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const root = parseArgs({ options: { root: { type: "string" } } }).values.root ?? new URL("..", import.meta.url).pathname;
const i18n = join(root, "src/i18n");
const load = async (path) => import(pathToFileURL(path).href);
const json = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {});

const { gated } = await load(join(i18n, "gated.ts"));
const en = (await load(join(i18n, "ui/en.ts"))).default;
const same = json(join(i18n, "held-same.json"));

const problems = [];
const listed = new Set(Object.entries(same).flatMap(([code, keys]) => Object.keys(keys).map((key) => `${code} ${key}`)));
let held = 0;
for (const file of readdirSync(join(i18n, "before")).filter((f) => f.endsWith(".json"))) {
  const code = file.slice(0, -5);
  const before = json(join(i18n, "before", file));
  const own = (await load(join(i18n, "ui", `${code}.ts`))).default;
  for (const [key, earlier] of Object.entries(before)) {
    if (!(key in gated)) continue;
    held++;
    // en-US shows UK English for every string it does not set itself
    const now = own[key] ?? en[key];
    const reason = same[code]?.[key];
    listed.delete(`${code} ${key}`);
    if (reason !== undefined) {
      if (!reason.trim()) problems.push(`${code} ${key}: src/i18n/held-same.json needs a one-line reason`);
      else if (earlier !== now) problems.push(`${code} ${key}: listed in src/i18n/held-same.json, but its texts now differ: remove the entry`);
    } else if (earlier === now) problems.push(`${code} ${key}: its earlier text in src/i18n/before/${file} is already the new text, so it would change before the "${gated[key]}" stage`);
  }
}

for (const entry of listed) problems.push(`${entry}: listed in src/i18n/held-same.json, but not a held string: remove the entry`);

if (problems.length) {
  console.error(`check-held-text:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-held-text: ${held} held strings, each with earlier text that differs from its new text`);
