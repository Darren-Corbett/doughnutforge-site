// The live site still deploys from the repo root, and the apps rely on files
// there: /.well-known/apple-app-site-association links the Mac and iOS apps to
// password managers (webcredentials:doughnut-forge.app). Until Pages switches to
// GitHub Actions, the root copies stay, and the built site must carry the same
// files byte for byte, so the switch changes nothing for the apps.
import { existsSync, readFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const errors = [];

for (const file of [".well-known/apple-app-site-association", "CNAME"]) {
  const built = `${root}dist/${file}`;
  if (!existsSync(built)) errors.push(`dist/${file} is missing`);
  else if (existsSync(`${root}${file}`) && !readFileSync(built).equals(readFileSync(`${root}${file}`)))
    errors.push(`dist/${file} differs from the live copy at the repo root`);
}
if (!existsSync(`${root}dist/.nojekyll`)) errors.push("dist/.nojekyll is missing");

try {
  const aasa = JSON.parse(readFileSync(`${root}dist/.well-known/apple-app-site-association`, "utf8"));
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
const securityTxt = `${root}dist/.well-known/security.txt`;
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

if (errors.length) {
  console.error("check-production-files:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("check-production-files: apple-app-site-association, CNAME and .nojekyll match production; security.txt is valid");
