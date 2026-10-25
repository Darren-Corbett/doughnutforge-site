// Two builds of the same commit must be byte for byte the same, apart from the
// build ID. The build ID is a hash of the built site (scripts/build-id.mjs), so
// a build that differs each time gives every deploy a new ID, and open tabs
// reload for nothing (src/components/FreshCheck.astro). Run it after changing
// astro.config.mjs, package.json, scripts/ or src/assets/.
//
//   node scripts/check-reproducible.mjs                (builds twice, then compares)
//   node scripts/check-reproducible.mjs --compare a b  (compares two built sites)
//
// It names every file that differs, or that only one build has, so the cause
// can be found (an asset named differently each time shows as two names).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { files, META, PLACEHOLDER } from "./build-id.mjs";

/** A built file's bytes, with any build ID put back to the placeholder */
const body = (dist, file) => {
  const bytes = readFileSync(join(dist, file));
  return file.endsWith(".html") ? Buffer.from(bytes.toString("utf8").replace(META, `<meta name="build-id" content="${PLACEHOLDER}"`)) : bytes;
};

/** Every file the two built sites disagree on */
export const differences = (a, b) => {
  const inA = new Set(files(a));
  const inB = new Set(files(b));
  const out = [];
  for (const f of inA) {
    if (!inB.has(f)) out.push(`only in the first build: ${f}`);
    else if (!body(a, f).equals(body(b, f))) out.push(`differs: ${f}`);
  }
  for (const f of inB) if (!inA.has(f)) out.push(`only in the second build: ${f}`);
  return out;
};

const { values, positionals } = parseArgs({ options: { compare: { type: "boolean" } }, allowPositionals: true });
let [a, b] = positionals;
if (!values.compare) {
  const root = new URL("..", import.meta.url).pathname;
  [a, b] = [1, 2].map((n) => {
    const out = mkdtempSync(join(tmpdir(), `build-${n}-`));
    console.log(`check-reproducible: build ${n} into ${out}`);
    execFileSync("npx", ["astro", "build", "--outDir", out], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
    return out;
  });
}
const found = differences(a, b);
if (found.length) {
  console.error(`check-reproducible: the two builds differ in ${found.length} file(s):\n  ${found.slice(0, 50).join("\n  ")}`);
  process.exit(1);
}
console.log(`check-reproducible: the two builds are the same (${files(a).length} files)`);
