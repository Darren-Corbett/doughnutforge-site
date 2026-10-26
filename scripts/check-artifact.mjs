// The archive the deploy uploads to GitHub Pages must hold every built file,
// dotfiles included. On launch day the upload left out .well-known/ (its name
// starts with a dot), and the apps' apple-app-site-association was missing from
// the live site for 42 minutes. The deploy runs this on the uploaded archive,
// before deploying, so an incomplete one never goes live.
//
//   node scripts/check-artifact.mjs --tar <artifact.tar> [--dist <dir>]
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { parseArgs } from "node:util";

const root = new URL("..", import.meta.url).pathname;
const { values } = parseArgs({ options: { tar: { type: "string" }, dist: { type: "string" } } });
const dist = (values.dist ?? `${root}dist`).replace(/\/?$/, "/");
if (!values.tar) {
  console.error("check-artifact: give the archive with --tar");
  process.exit(1);
}

let listing;
try {
  listing = execFileSync("tar", ["-tf", values.tar], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
} catch (e) {
  console.error(`check-artifact: cannot read ${values.tar}: ${e.message}`);
  process.exit(1);
}
const packed = new Set(listing.split("\n").map((p) => p.replace(/^\.\//, "")).filter(Boolean));
const built = readdirSync(dist, { recursive: true })
  .map(String)
  .filter((f) => statSync(`${dist}${f}`).isFile());
const missing = built.filter((f) => !packed.has(f));
if (missing.length) {
  console.error(`check-artifact: the archive leaves out ${missing.length} built file(s):\n  ${missing.slice(0, 40).join("\n  ")}`);
  process.exit(1);
}
console.log(`check-artifact: the archive holds all ${built.length} files built, dotfiles included`);
