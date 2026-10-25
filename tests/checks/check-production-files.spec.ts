// scripts/check-production-files.mjs on a small built site of its own: every
// page carries the build's ID (a build-id meta), /build.json holds the same ID,
// and that ID is the hash of the built site's content (scripts/build-id.mjs), so
// an open tab can tell it is out of date (src/components/FreshCheck.astro).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const PLACEHOLDER = "__BUILD_ID__";

const exec = async (script: string, dist: string) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/${script}`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

/** A fake dist with the production files and a home page carrying the placeholder ID, stamped unless told not to */
const site = async ({ stamped = true } = {}) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  mkdirSync(join(dist, ".well-known"));
  copyFileSync(`${root}public/.well-known/apple-app-site-association`, join(dist, ".well-known/apple-app-site-association"));
  copyFileSync(`${root}public/.well-known/security.txt`, join(dist, ".well-known/security.txt"));
  copyFileSync(`${root}public/CNAME`, join(dist, "CNAME"));
  writeFileSync(join(dist, ".nojekyll"), "");
  writeFileSync(join(dist, "index.html"), `<!doctype html><html><head><meta name="build-id" content="${PLACEHOLDER}"></head><body></body></html>`);
  if (stamped) expect((await exec("build-id.mjs", dist)).code).toBe(0);
  return dist;
};
const check = (dist: string) => exec("check-production-files.mjs", dist);
const read = (dist: string, file: string) => readFileSync(join(dist, file), "utf8");

test("passes when build.json and the home page carry the content ID", async () => {
  const result = await check(await site());
  expect(result.output).toContain("build ID");
  expect(result.code).toBe(0);
});

test("fails when build.json is missing", async () => {
  const result = await check(await site({ stamped: false }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build.json");
});

test("fails when a page still has the placeholder", async () => {
  const dist = await site();
  writeFileSync(join(dist, "other.html"), `<meta name="build-id" content="${PLACEHOLDER}">`);
  const result = await check(dist);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("other.html");
});

test("fails when the home page has no build ID", async () => {
  const dist = await site();
  writeFileSync(join(dist, "index.html"), "<!doctype html><html><head></head><body></body></html>");
  const result = await check(dist);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build-id");
});

test("fails when the IDs differ", async () => {
  const dist = await site();
  writeFileSync(join(dist, "build.json"), '{"id":"0000000000000000"}');
  const result = await check(dist);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build.json");
});

test("fails when the ID is not the hash of the content", async () => {
  // The site changed after it was stamped, so its ID would not change when it should
  const dist = await site();
  writeFileSync(join(dist, "CNAME"), `${read(dist, "CNAME")}\n`);
  const result = await check(dist);
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("content");
});
