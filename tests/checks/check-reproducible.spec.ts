// scripts/check-reproducible.mjs on small built sites of their own: two builds
// of the same commit must be byte for byte the same (apart from the build ID),
// or the content build ID changes on every deploy and open tabs reload for
// nothing. The script names every file that differs, so the cause is findable.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const page = (id: string, text: string) => `<!doctype html><html><head><meta name="build-id" content="${id}"></head><body>${text}</body></html>`;

/** A fake built site */
const site = (files: Record<string, string>) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dist, path, ".."), { recursive: true });
    writeFileSync(join(dist, path), body);
  }
  return dist;
};

const compare = async (a: string, b: string) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-reproducible.mjs`, "--compare", a, b]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

const base = { "index.html": page("__BUILD_ID__", "Home"), "_astro/site.abc.css": "body{}" };

test("two identical builds pass", async () => {
  const result = await compare(site(base), site(base));
  expect(result.code, result.output).toBe(0);
});

test("a different build ID alone is not a difference", async () => {
  const result = await compare(site(base), site({ ...base, "index.html": page("1234abcd1234abcd", "Home"), "build.json": '{"id":"x"}' }));
  expect(result.code, result.output).toBe(0);
});

test("a file whose bytes differ fails, and is named", async () => {
  const result = await compare(site(base), site({ ...base, "_astro/site.abc.css": "body{color:red}" }));
  expect(result.code).toBe(1);
  expect(result.output).toContain("_astro/site.abc.css");
});

test("an asset that changed its name fails, and both names are given", async () => {
  const { "_astro/site.abc.css": css, ...rest } = base;
  const result = await compare(site(base), site({ ...rest, "_astro/site.xyz.css": css }));
  expect(result.code).toBe(1);
  expect(result.output).toContain("_astro/site.abc.css");
  expect(result.output).toContain("_astro/site.xyz.css");
});
