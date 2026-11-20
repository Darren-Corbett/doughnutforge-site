// scripts/check-placeholders.mjs on small built sites of its own: a [PENDING-...]
// marker (text still waiting on the app side, owner 20 November 2026) must never
// reach a published page, so every build fails on one, not only the deploy build.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

const check = async (files: Record<string, string>, ...args: string[]) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dist, path, ".."), { recursive: true });
    writeFileSync(join(dist, path), body);
  }
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-placeholders.mjs`, "--dist", dist, ...args]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const page = (head: string, body: string) => `<!doctype html><html lang="en"><head><title>Doughnut Forge</title>${head}</head><body><main>${body}</main></body></html>`;

test("a page with no markers passes", async () => {
  const { code } = await check({ "index.html": page("", "<p>No subscription.</p>") });
  expect(code).toBe(0);
});

test("a pending marker in page text fails every build, not only the deploy", async () => {
  const { code, output } = await check({ "pricing/index.html": page("", "<p>[PENDING-PRICING] Free to download.</p>") });
  expect(code).toBe(1);
  expect(output).toContain("PENDING-PRICING");
  expect(output).toContain("pricing/index.html");
});

test("a pending marker split by line-break markup still fails", async () => {
  const body = '<p>[PENDING-<span class="keep-word">ANDROID</span>-<wbr>PERMISSION]</p>';
  const { code, output } = await check({ "download/index.html": page("", body) });
  expect(code).toBe(1);
  expect(output).toContain("PENDING-ANDROID-PERMISSION");
});

test("a pending marker in an attribute or a data file fails", async () => {
  expect((await check({ "index.html": page('<meta name="description" content="[PENDING-WHITEPAPER-PDF]">', "<p>Hello</p>") })).code).toBe(1);
  expect((await check({ "index.html": page("", "<p>Hello</p>"), "build.json": '{"note":"[PENDING-PRICING]"}' })).code).toBe(1);
});

test("an unfilled value still only warns outside the deploy build", async () => {
  const files = { "index.html": page("", "<p>[[PLACEHOLDER: press email]]</p>") };
  expect((await check(files)).code).toBe(0);
  expect((await check(files, "--strict")).code).toBe(1);
});
