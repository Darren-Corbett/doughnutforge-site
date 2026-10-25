// The build ID: a hash of the built site's content, without build.json, so a
// rebuild that changed nothing keeps its ID and open tabs reload only when
// something really changed (src/components/FreshCheck.astro). Pages are built
// with a placeholder in their build-id meta; this replaces it in every page and
// writes the ID to build.json. Run after everything else that writes to dist/.
//
//   node scripts/build-id.mjs [--dist <dir>]
//
// The hash covers every file's path and bytes, with each page's build-id put
// back to the placeholder, so stamping again changes nothing.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// The same placeholder as src/data/build.ts
export const PLACEHOLDER = "__BUILD_ID__";
const META = /<meta name="build-id" content="[^"]*"/;
const meta = (id) => `<meta name="build-id" content="${id}"`;

/** Every file in the built site but build.json, as sorted paths with "/" */
const files = (dist) =>
  readdirSync(dist, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => relative(dist, join(e.parentPath, e.name)).split(sep).join("/"))
    .filter((f) => f !== "build.json")
    .sort();

/** The content ID of a built site, stamped or not */
export const contentId = (dist) => {
  const hash = createHash("sha256");
  for (const file of files(dist)) {
    let body = readFileSync(join(dist, file));
    if (file.endsWith(".html")) body = Buffer.from(body.toString("utf8").replace(META, meta(PLACEHOLDER)));
    hash.update(`${file}\0${body.length}\0`).update(body);
  }
  return hash.digest("hex").slice(0, 16);
};

/** Writes the content ID into every page's build-id meta and into build.json */
export const stamp = (dist) => {
  const pages = files(dist).filter((f) => f.endsWith(".html") && META.test(readFileSync(join(dist, f), "utf8")));
  if (!pages.length) throw new Error("no page has a build-id meta (src/components/FreshCheck.astro)");
  const id = contentId(dist);
  for (const page of pages) {
    const file = join(dist, page);
    const html = readFileSync(file, "utf8");
    const stamped = html.replace(META, meta(id));
    if (stamped !== html) writeFileSync(file, stamped);
  }
  writeFileSync(join(dist, "build.json"), JSON.stringify({ id }));
  return { id, pages: pages.length };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL("..", import.meta.url).pathname;
  const dist = parseArgs({ options: { dist: { type: "string" } } }).values.dist ?? `${root}dist`;
  try {
    const { id, pages } = stamp(dist);
    console.log(`build-id: ${id}, the hash of the built site's content, in build.json and ${pages} pages`);
  } catch (e) {
    console.error(`build-id: ${e.message}`);
    process.exit(1);
  }
}
