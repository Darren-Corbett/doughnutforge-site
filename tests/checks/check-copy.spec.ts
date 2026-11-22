// scripts/check-copy.mjs on small built sites of its own: the copy lint from
// the app's copy style guide (copy-style.md, Darren 21 Nov 2026), on English
// pages. It reports and never fails the build, until the owner approves the
// fixes; then --strict fails on any finding not approved in
// scripts/copy-lint-known.json.
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
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-copy.mjs`, "--dist", dist, ...args]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const page = (lang: string, body: string, head = "") =>
  `<!doctype html><html lang="${lang}"><head><title>Doughnut Forge</title>${head}</head><body><main>${body}</main></body></html>`;

const CLEAN = `<p>On iPhone, iPad and Android, Doughnut Forge is free to download and use, including text encryption and opening anything sent to you. Encrypting files, photos and videos is a one-time purchase.</p>
  <p>Mac and Windows are paid apps, bought once in their stores.</p>
  <p>No subscription. No account. No servers.</p>
  <p>Unlock the app with Face ID.</p>`;

test("passes the approved lines", async () => {
  const result = await check({ "index.html": page("en-GB", CLEAN), "en-us/index.html": page("en-US", CLEAN) });
  expect(result.code, result.output).toBe(0);
  expect(result.output).toContain("check-copy: 0 findings on 2 English pages");
});

test("reports each rule, once per line however many pages show it", async () => {
  const bad = `<p>This powerful app is amazing!</p>
    <p>We think it's the best.</p>
    <p>Doughnut Forge is quantum-proof and unbreakable.</p>
    <p>One in-app purchase unlocks encrypting files.</p>
    <p>Free to download, and opening is free.</p>
    <p>A one-time purchase, paid once.</p>
    <p>Doughnut Forge is free to download and use.</p>
    <p>${"word ".repeat(26).trim()}.</p>`;
  const result = await check({ "index.html": page("en-GB", bad), "features/index.html": page("en-GB", bad) });
  expect(result.code, result.output).toBe(0);
  for (const rule of ["hype", "exclamation", "we", "contraction", "banned", "unlock", "free-twice", "paid-once", "platforms", "long"]) expect(result.output).toContain(`[${rule}]`);
  expect(result.output).toContain("(2 pages)");
  expect(result.output).toMatch(/check-copy: \d+ findings on 2 English pages \(report only\)/);
});

test("checks the meta description and alt text, and leaves other languages to the reviewers", async () => {
  const result = await check({
    "index.html": page("en-GB", '<img src="a.png" alt="An amazing screen">', '<meta name="description" content="We encrypt files.">'),
    "de/index.html": page("de", "<p>Wir verschlüsseln!</p>"),
  });
  expect(result.output).toContain("[hype]");
  expect(result.output).toContain("[we]");
  expect(result.output).not.toContain("Wir");
  expect(result.output).toContain("on 1 English page");
});

test("--summary prints one line", async () => {
  const result = await check({ "index.html": page("en-GB", "<p>Amazing!</p>") }, "--summary");
  expect(result.output.trim().split("\n")).toHaveLength(1);
  expect(result.output).toContain("check-copy: 2 findings on 1 English page (report only; npm run lint:copy lists them)");
});

test("--strict fails on a finding, but not on one approved in the known list", async () => {
  expect((await check({ "index.html": page("en-GB", "<p>Amazing!</p>") }, "--strict")).code).toBe(1);
  // The approved 27-word roadmap line (roadmap.md, Darren 21 Nov)
  const approved = "<p>When a contact sends you a file made with this version, and their contact card is up to date, you see their name when you open it.</p>";
  const result = await check({ "index.html": page("en-GB", approved) }, "--strict");
  expect(result.code, result.output).toBe(0);
  expect(result.output).toContain("1 approved");
});
