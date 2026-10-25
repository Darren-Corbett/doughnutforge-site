// scripts/build-id.mjs on small built sites of their own: the build ID is a hash
// of the built site's content, without build.json, so a rebuild that changed
// nothing keeps its ID and open tabs reload only when something really changed
// (src/components/FreshCheck.astro). Pages are built with a placeholder ID,
// which the script replaces in every page and writes to build.json.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const PLACEHOLDER = "__BUILD_ID__";
const page = (text: string) => `<!doctype html><html><head><meta name="build-id" content="${PLACEHOLDER}"></head><body>${text}</body></html>`;

/** A fake built site, as Astro leaves it: every page carries the placeholder */
const site = (files: Record<string, string | Buffer> = {}) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  const all: Record<string, string | Buffer> = {
    "index.html": page("Home"),
    "download/index.html": page("Download"),
    "_astro/site.abc123.css": "body{color:#14171a}",
    "icon.png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x10]),
    ...files,
  };
  for (const [path, body] of Object.entries(all)) {
    mkdirSync(join(dist, path, ".."), { recursive: true });
    writeFileSync(join(dist, path), body);
  }
  return dist;
};

const stamp = async (dist: string) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/build-id.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const idOf = (dist: string) => JSON.parse(readFileSync(join(dist, "build.json"), "utf8")).id as string;
const metaOf = (dist: string, file: string) => /<meta name="build-id" content="([^"]*)"/.exec(readFileSync(join(dist, file), "utf8"))?.[1];

test("stamps one content ID into build.json and every page, leaving no placeholder", async () => {
  const dist = site();
  const result = await stamp(dist);
  expect(result.code, result.output).toBe(0);
  const id = idOf(dist);
  expect(id).toMatch(/^[0-9a-f]{16}$/);
  expect(metaOf(dist, "index.html")).toBe(id);
  expect(metaOf(dist, "download/index.html")).toBe(id);
  for (const file of ["index.html", "download/index.html"]) expect(readFileSync(join(dist, file), "utf8")).not.toContain(PLACEHOLDER);
});

test("a rebuild that changed nothing keeps the same ID", async () => {
  const first = site();
  const second = site();
  await stamp(first);
  await stamp(second);
  expect(idOf(second)).toBe(idOf(first));
});

test("any change to a page, a stylesheet or an image gives a new ID", async () => {
  const base = site();
  await stamp(base);
  for (const change of [{ "download/index.html": page("Download now") }, { "_astro/site.abc123.css": "body{color:#000}" }, { "icon.png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x11]) }, { "new/index.html": page("New") }]) {
    const changed = site(change);
    await stamp(changed);
    expect(idOf(changed), Object.keys(change)[0]).not.toBe(idOf(base));
  }
});

test("a file moved to another path gives a new ID", async () => {
  const a = site({ "a.txt": "same" });
  const b = site({ "b.txt": "same" });
  await stamp(a);
  await stamp(b);
  expect(idOf(b)).not.toBe(idOf(a));
});

test("build.json itself is not part of the ID", async () => {
  const plain = site();
  const withOld = site({ "build.json": '{"id":"something-older"}' });
  await stamp(plain);
  await stamp(withOld);
  expect(idOf(withOld)).toBe(idOf(plain));
});

test("stamping again changes nothing", async () => {
  const dist = site();
  await stamp(dist);
  const id = idOf(dist);
  const home = readFileSync(join(dist, "index.html"), "utf8");
  expect((await stamp(dist)).code).toBe(0);
  expect(idOf(dist)).toBe(id);
  expect(readFileSync(join(dist, "index.html"), "utf8")).toBe(home);
});

test("fails when no page carries the placeholder", async () => {
  const dist = site({ "index.html": "<!doctype html><html><head></head><body>Home</body></html>", "download/index.html": "<p>x</p>" });
  const result = await stamp(dist);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build-id");
});

test("a copy of the site in another folder gets the same ID", async () => {
  const dist = site();
  await stamp(dist);
  const copy = mkdtempSync(join(tmpdir(), "copy-"));
  cpSync(site(), copy, { recursive: true });
  await stamp(copy);
  expect(idOf(copy)).toBe(idOf(dist));
});
