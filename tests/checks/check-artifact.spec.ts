// scripts/check-artifact.mjs on small sites of its own: the archive the deploy
// uploads to GitHub Pages must hold every built file, dotfiles included. On
// launch day the upload left out .well-known/ (its name starts with a dot) and
// the apps' apple-app-site-association was missing for 42 minutes; this check
// runs before the deploy, so such an archive never goes live.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

const exec = async (args: string[]) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-artifact.mjs`, ...args]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

/** A built site with a page, a nested page, .nojekyll and .well-known/ */
const site = () => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  mkdirSync(join(dist, ".well-known"));
  mkdirSync(join(dist, "de"));
  writeFileSync(join(dist, ".well-known/apple-app-site-association"), "{}");
  writeFileSync(join(dist, ".nojekyll"), "");
  writeFileSync(join(dist, "index.html"), "<p>home</p>");
  writeFileSync(join(dist, "de/index.html"), "<p>start</p>");
  return dist;
};

/** Packs the given paths of a site the way upload-pages-artifact does (tar, paths starting "./") */
const pack = async (dist: string, paths: string[]) => {
  const tar = join(mkdtempSync(join(tmpdir(), "artifact-")), "artifact.tar");
  await run("tar", ["-cf", tar, "-C", dist, ...paths]);
  return tar;
};

test("passes when the archive holds every built file", async () => {
  const dist = site();
  const result = await exec(["--tar", await pack(dist, ["."]), "--dist", dist]);
  expect(result.output).toContain("4 files");
  expect(result.code).toBe(0);
});

test("fails, naming each one, when the archive leaves out dotfiles", async () => {
  const dist = site();
  const result = await exec(["--tar", await pack(dist, ["./index.html", "./de"]), "--dist", dist]);
  expect(result.code).toBe(1);
  expect(result.output).toContain(".well-known/apple-app-site-association");
  expect(result.output).toContain(".nojekyll");
  expect(result.output).not.toContain("de/index.html");
});

test("fails when the archive cannot be read", async () => {
  const dist = site();
  const result = await exec(["--tar", join(dist, "missing.tar"), "--dist", dist]);
  expect(result.code).toBe(1);
});
