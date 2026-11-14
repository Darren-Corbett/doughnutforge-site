// scripts/check-white-paper.mjs on small sites of their own. The white paper is
// public, so nothing from the app's private notes may reach it: no source file,
// function or test names, no finding codes, no draft markers, no notes for the
// author. And each language's PDF must be the one made from that language's
// current text (scripts/make-white-paper-pdf.mjs records both fingerprints).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const TEXT = "---\ntitle: Security white paper\n---\n\n## 1. Design principles\n\n**In short.** Everything happens on the device.\n";
const PDF = "%PDF-1.7 white paper";
const PAGE = "<!doctype html><html lang=\"en-GB\"><body><main><h2>1. Design principles</h2></main></body></html>";

/** A repo with one language's white paper text, its record, and a built site */
const site = ({ text = TEXT, pdf = PDF as string | null, page = PAGE, record = { en: { source: sha(TEXT), pdf: sha(PDF) } } as object } = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "wp-"));
  const write = (path: string, body: string) => {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), body);
  };
  write("src/content/white-paper/en.md", text);
  write("src/data/white-paper-pdfs.json", JSON.stringify(record));
  write("dist/security/white-paper/index.html", page);
  if (pdf !== null) write("dist/security/white-paper/doughnut-forge-white-paper-en.pdf", pdf);
  return dir;
};

const check = async (dir: string) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-white-paper.mjs`, "--root", dir, "--dist", join(dir, "dist")]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

test("passes on a clean paper with its current PDF", async () => {
  const result = await check(site());
  expect(result.output).toContain("check-white-paper");
  expect(result.code).toBe(0);
});

for (const [what, leak] of [
  ["a source path", "See src-tauri/src/crypto/v3/format.rs."],
  ["a Rust file", "The reader (reader.rs) checks it."],
  ["a test name", "engine3_format_test checks the layout."],
  ["an internal source line", "> Source: the plan."],
  ["a draft marker", "Shown as unknown sender **[PENDING: step 10]**."],
  ["a finding code", "The shared seed (C16) is used twice."],
  ["the notes for the author", "## Notes for the author"],
  ["the internal spec", "See TECH-SPEC-INTERNAL.md."],
])
  test(`fails on ${what} in the text`, async () => {
    const text = `${TEXT}\n${leak}\n`;
    const result = await check(site({ text, record: { en: { source: sha(text), pdf: sha(PDF) } } }));
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("en.md");
  });

test("fails on a leak in the built page too", async () => {
  const result = await check(site({ page: PAGE.replace("</main>", "<p>pq_kat_test</p></main>") }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("security/white-paper/index.html");
});

test("fails when a language has no PDF", async () => {
  const result = await check(site({ pdf: null }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("doughnut-forge-white-paper-en.pdf");
});

test("fails when the text changed after its PDF was made", async () => {
  const result = await check(site({ text: `${TEXT}\nOne more sentence.\n` }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("make-white-paper-pdf");
});

test("fails when the PDF is not the one that was made", async () => {
  const result = await check(site({ pdf: "%PDF-1.7 something else" }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("make-white-paper-pdf");
});
