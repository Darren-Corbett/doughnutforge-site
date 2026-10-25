// Every social preview image a built page names must exist in dist/.
// Runs in every build; any missing image fails it. Pages that only forward to a
// store (src/pages/get/) are never shared, so they have none.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(new URL("..", import.meta.url).pathname, "dist");
const missing = new Set();
let pages = 0;
for (const file of readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join(dist, file), "utf8");
  if (html.includes('<meta http-equiv="refresh"')) continue;
  const url = /<meta property="og:image" content="https:\/\/doughnut-forge\.app([^"]+)"/.exec(html)?.[1];
  pages++;
  if (!url) missing.add(`${file}: no og:image`);
  else if (!existsSync(join(dist, decodeURIComponent(url)))) missing.add(`${file}: ${url}`);
}
if (missing.size) {
  console.error(`check-og: ${missing.size} missing image(s)\n  ${[...missing].join("\n  ")}`);
  process.exit(1);
}
console.log(`check-og: ${pages} pages, every preview image exists`);
