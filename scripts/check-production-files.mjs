// The live site still deploys from the repo root, and the apps rely on files
// there: /.well-known/apple-app-site-association links the Mac and iOS apps to
// password managers (webcredentials:doughnut-forge.app). Until Pages switches to
// GitHub Actions, the root copies stay, and the built site must carry the same
// files byte for byte, so the switch changes nothing for the apps.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { contentId, PLACEHOLDER } from "./build-id.mjs";

const root = new URL("..", import.meta.url).pathname;
// --dist <dir> and --assets <dir> check another built site and its assets (tests/checks)
const args = parseArgs({ options: { dist: { type: "string" }, assets: { type: "string" } } }).values;
const dist = (args.dist ?? `${root}dist`).replace(/\/?$/, "/");
const assets = (args.assets ?? `${root}src/assets`).replace(/\/?$/, "/");
const errors = [];

for (const file of [".well-known/apple-app-site-association", "CNAME"]) {
  const built = `${dist}${file}`;
  if (!existsSync(built)) errors.push(`dist/${file} is missing`);
  else if (existsSync(`${root}${file}`) && !readFileSync(built).equals(readFileSync(`${root}${file}`)))
    errors.push(`dist/${file} differs from the live copy at the repo root`);
}
if (!existsSync(`${dist}.nojekyll`)) errors.push("dist/.nojekyll is missing");

try {
  const aasa = JSON.parse(readFileSync(`${dist}.well-known/apple-app-site-association`, "utf8"));
  const apps = aasa.webcredentials?.apps ?? [];
  for (const id of ["J74UEFCGU7.com.darrencorbett.doughnutforge", "J74UEFCGU7.com.darrencorbett.doughnutforge.mobile"])
    if (!apps.includes(id)) errors.push(`apple-app-site-association no longer lists ${id}`);
} catch (e) {
  errors.push(`apple-app-site-association is not valid JSON: ${e.message}`);
}

// security.txt (RFC 9116): reports go to GitHub's private vulnerability
// reporting. Expires is one year ahead at most; the build fails 30 days before
// it lapses, so it is renewed in time (the dated reminder is in docs/HANDOVER.md).
const DAY = 24 * 3600 * 1000;
const securityTxt = `${dist}.well-known/security.txt`;
if (!existsSync(securityTxt)) errors.push("dist/.well-known/security.txt is missing");
else {
  const txt = readFileSync(securityTxt, "utf8");
  for (const line of [
    "Contact: https://github.com/Darren-Corbett/forge-privacy/security/advisories/new",
    "Policy: https://doughnut-forge.app/security/",
    "Canonical: https://doughnut-forge.app/.well-known/security.txt",
  ])
    if (!txt.split("\n").includes(line)) errors.push(`security.txt has no "${line}" line`);
  const expires = [...txt.matchAll(/^Expires: (.+)$/gm)].map((m) => Date.parse(m[1]));
  const renew = "set Expires in public/.well-known/security.txt to one year from today, and move the reminder in docs/HANDOVER.md";
  if (expires.length !== 1 || Number.isNaN(expires[0])) errors.push("security.txt needs exactly one valid Expires date");
  else if (expires[0] - Date.now() < 30 * DAY) errors.push(`security.txt expires on ${new Date(expires[0]).toISOString().slice(0, 10)}: ${renew}`);
  else if (expires[0] - Date.now() > 366 * DAY) errors.push("security.txt Expires is more than a year ahead (RFC 9116 advises a year at most)");
}

// The build ID: /build.json and the pages must agree, or open tabs would reload
// for nothing, or never (src/components/FreshCheck.astro). It must be the hash
// of the content (scripts/build-id.mjs, run after everything that writes to
// dist/), so it changes exactly when the site does.
const html = readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith(".html"));
const unstamped = html.filter((f) => readFileSync(`${dist}${f}`, "utf8").includes(`<meta name="build-id" content="${PLACEHOLDER}"`));
if (unstamped.length) errors.push(`still the placeholder build ID (run scripts/build-id.mjs last): ${unstamped.slice(0, 5).join(", ")}`);
const pageId = existsSync(`${dist}index.html`) ? /<meta name="build-id" content="([^"]+)"/.exec(readFileSync(`${dist}index.html`, "utf8"))?.[1] : undefined;
if (!pageId) errors.push("dist/index.html has no build-id meta");
if (!existsSync(`${dist}build.json`)) errors.push("dist/build.json is missing");
else {
  let id;
  try {
    id = JSON.parse(readFileSync(`${dist}build.json`, "utf8")).id;
  } catch (e) {
    errors.push(`dist/build.json is not valid JSON: ${e.message}`);
  }
  if (pageId && id !== undefined && id !== pageId) errors.push(`dist/build.json says ${id}, but the home page is build ${pageId}`);
  else if (id !== undefined && id !== contentId(dist)) errors.push(`the build ID ${id} is not the hash of the content (${contentId(dist)}): did something write to dist/ after scripts/build-id.mjs?`);
}

// Astro keeps one file for identical SVGs and names it after whichever it read
// first, so two builds of the same commit could differ and the build ID change
// for nothing. Keep one copy (src/components/StoreBadge.astro does for badges).
const svgs = {};
for (const f of readdirSync(assets, { recursive: true }).map(String).filter((f) => f.endsWith(".svg")).sort()) {
  const key = readFileSync(`${assets}${f}`).toString("base64");
  if (svgs[key]) errors.push(`${f} is identical to ${svgs[key]}: keep one (Astro would name the shared file after either, by chance)`);
  else svgs[key] = f;
}

if (errors.length) {
  console.error("check-production-files:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("check-production-files: apple-app-site-association, CNAME and .nojekyll match production; security.txt is valid; build.json and the pages share the build ID");
