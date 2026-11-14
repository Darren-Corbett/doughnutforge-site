// scripts/check-android-claims.mjs on small built sites of its own: Android does
// not keep the app's files unreadable while the phone is locked, so no block of
// English text (paragraph, list item, heading) that names Android may say so, or
// name iOS "Complete data protection" (docs/android-release-plan.md, "Must not
// claim for Android"). The iPhone and iPad line may, in its own block.
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
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-android-claims.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const page = (lang: string, body: string) => `<!doctype html><html lang="${lang}"><head><title>Doughnut Forge</title></head><body><main>${body}</main></body></html>`;

const IOS = "<li><strong>iPhone and iPad:</strong> password, or Face ID or Touch ID if you turn it on. The app's files use iOS Complete data protection.</li>";
const ANDROID = "<li><strong>Android:</strong> password, or fingerprint or face unlock if you turn it on.</li>";

test("passes when the iPhone and iPad line and the Android line are separate blocks", async () => {
  const result = await check({ "index.html": page("en-GB", `<ul>${IOS}${ANDROID}</ul>`) });
  expect(result.output).toContain("check-android-claims");
  expect(result.code).toBe(0);
});

for (const claim of ["The app's files use Complete data protection.", "Files stay unreadable while the phone is locked.", "Your files are unreadable while locked."])
  test(`fails when a block naming Android says: ${claim}`, async () => {
    const result = await check({ "security/index.html": page("en-GB", `<p>On Android, too. ${claim}</p>`) });
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("security/index.html");
  });

test("checks US English pages too", async () => {
  const result = await check({ "en-us/index.html": page("en-US", "<h2>Android: complete data protection</h2>") });
  expect(result.code).not.toBe(0);
});

test("leaves other languages to the translation review", async () => {
  const result = await check({ "de/index.html": page("de", "<p>Android: Complete data protection</p>") });
  expect(result.code).toBe(0);
});
