// scripts/check-blocker-names.mjs on small built sites of its own: no class, id
// or built file name may use a word that content blockers hide or block on
// sight ("badge", "banner", "ad", "promo", "sponsor", "popup", "social"),
// because private lists such as 1Blocker's and Wipr's cannot be tested.
// Tailwind's "tracking-*" (letter spacing) is fine: no rule hides it (tests/blockers).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

const check = async (files: Record<string, string>) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dist, path, ".."), { recursive: true });
    writeFileSync(join(dist, path), body);
  }
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-blocker-names.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const page = (body: string) => `<!doctype html><html><head></head><body>${body}</body></html>`;

test("passes with ordinary names, Tailwind's tracking-* and words that only contain a target", async () => {
  const result = await check({
    "index.html": page('<div class="buy tracking-tight cards" id="pricing-where"><a class="download">x</a></div>'),
    "_astro/app-icon.abc123.webp": "x",
    "_astro/loader.abc123.css": "x",
  });
  expect(result.output).toContain("check-blocker-names");
  expect(result.code).toBe(0);
});

for (const [what, files, name] of [
  ["a class", { "index.html": page('<div class="card badge">x</div>') }, "badge"],
  ["a class part", { "index.html": page('<div class="store-banner">x</div>') }, "store-banner"],
  ["an id", { "index.html": page('<div id="promo">x</div>') }, "promo"],
  ["an ad class", { "de/index.html": page('<div class="top ad-slot">x</div>') }, "ad-slot"],
  ["a built file", { "index.html": page("x"), "_astro/sponsor.abc123.png": "x" }, "sponsor.abc123.png"],
] as const) {
  test(`fails on a blocker target word in ${what}`, async () => {
    const result = await check(files as Record<string, string>);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain(name);
  });
}
