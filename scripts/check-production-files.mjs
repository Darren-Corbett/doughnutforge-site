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

if (errors.length) {
  console.error("check-production-files:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("check-production-files: apple-app-site-association, CNAME and .nojekyll match production");
