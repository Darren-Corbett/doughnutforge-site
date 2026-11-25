// The site makes every language's white paper PDF from its own page text, English
// included (owner, 25 November 2026: the English PDF is no longer the app side's own
// file). Runs a copy of scripts/make-white-paper-pdf.mjs in a folder with no paper
// texts, so it stops before starting any server or browser.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;

const run = async (...args: string[]) => {
  const dir = mkdtempSync(join(tmpdir(), "wp-pdf-"));
  mkdirSync(join(dir, "scripts"));
  mkdirSync(join(dir, "src/i18n"), { recursive: true });
  mkdirSync(join(dir, "src/content/white-paper"), { recursive: true });
  copyFileSync(join(root, "scripts/make-white-paper-pdf.mjs"), join(dir, "scripts/make-white-paper-pdf.mjs"));
  copyFileSync(join(root, "src/i18n/languages.json"), join(dir, "src/i18n/languages.json"));
  symlinkSync(join(root, "node_modules"), join(dir, "node_modules"));
  try {
    await promisify(execFile)(process.execPath, [join(dir, "scripts/make-white-paper-pdf.mjs"), ...args]);
    return "";
  } catch (error) {
    return String((error as { stderr?: string }).stderr ?? error);
  }
};

test("English is made like every other language, not refused as the app side's file", async () => {
  const output = await run("--lang", "en");
  expect(output).not.toContain("app side's own file");
  expect(output).toContain("No white paper text for en");
});

test("there is no hand-over option any more", async () => {
  expect(await run("--lang", "en", "--from", "/dev/null")).toMatch(/Unknown option '--from'/);
});
