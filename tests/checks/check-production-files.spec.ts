// scripts/check-production-files.mjs on a small built site of its own: every
// page carries the build's ID (a build-id meta), and /build.json holds the same
// ID, so an open tab can tell it is out of date (src/components/FreshCheck.astro).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

/** Builds a fake dist with the production files, a home page and (optionally) build.json, then runs the check on it */
const check = async ({ meta, json }: { meta?: string; json?: string }) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  mkdirSync(join(dist, ".well-known"));
  copyFileSync(`${root}public/.well-known/apple-app-site-association`, join(dist, ".well-known/apple-app-site-association"));
  copyFileSync(`${root}public/.well-known/security.txt`, join(dist, ".well-known/security.txt"));
  copyFileSync(`${root}public/CNAME`, join(dist, "CNAME"));
  writeFileSync(join(dist, ".nojekyll"), "");
  const tag = meta === undefined ? "" : `<meta name="build-id" content="${meta}">`;
  writeFileSync(join(dist, "index.html"), `<!doctype html><html><head>${tag}</head><body></body></html>`);
  if (json !== undefined) writeFileSync(join(dist, "build.json"), json);
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-production-files.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

test("passes when build.json and the home page carry the same build ID", async () => {
  const result = await check({ meta: "abc123-x", json: '{"id":"abc123-x"}' });
  expect(result.output).toContain("build ID");
  expect(result.code).toBe(0);
});

test("fails when build.json is missing", async () => {
  const result = await check({ meta: "abc123-x" });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build.json");
});

test("fails when the home page has no build ID", async () => {
  const result = await check({ json: '{"id":"abc123-x"}' });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build-id");
});

test("fails when the IDs differ", async () => {
  const result = await check({ meta: "abc123-x", json: '{"id":"other"}' });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("build.json");
});
