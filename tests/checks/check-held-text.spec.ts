// scripts/check-held-text.mjs on small sites of their own. A key held until a
// launch stage (src/i18n/gated.ts) shows its earlier text (src/i18n/before/) until
// then. If the earlier text is the same as the new one, the page changes early,
// or the stage changes nothing: on 23 November 2026 English showed a new Security
// line before 3.0 that way. Genuine cases go in src/i18n/held-same.json, each with
// a one-line reason (Darren, 23 November 2026; review the list after a month).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

type Strings = Record<string, string>;
const OLD = "Not audited yet";
const NEW = "No independent audit";

/** A site with English, German and en-US strings, one held key, and its earlier texts */
const site = ({
  en = { "security.audit.title": NEW } as Strings,
  de = { "security.audit.title": "Kein unabhängiges Audit" } as Strings,
  enUS = {} as Strings,
  before = { en: { "security.audit.title": OLD }, de: { "security.audit.title": "Noch kein Audit" }, "en-US": { "security.audit.title": OLD } } as Record<string, Strings>,
  same = {} as Record<string, Strings>,
} = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "held-"));
  const write = (path: string, body: string) => {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), body);
  };
  write("src/i18n/gated.ts", `export const gated = { "security.audit.title": "live3" };\n`);
  for (const [code, strings] of Object.entries({ en, de, "en-US": enUS })) write(`src/i18n/ui/${code}.ts`, `export default ${JSON.stringify(strings)};\n`);
  for (const [code, strings] of Object.entries(before)) write(`src/i18n/before/${code}.json`, JSON.stringify(strings));
  write("src/i18n/held-same.json", JSON.stringify(same));
  return dir;
};

const check = async (dir: string) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-held-text.mjs`, "--root", dir]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

test("passes when every held key's earlier text differs from its new text", async () => {
  const result = await check(site());
  expect(result.output).toContain("check-held-text");
  expect(result.code).toBe(0);
});

test("fails when English's earlier text is already the new text", async () => {
  const result = await check(site({ before: { en: { "security.audit.title": NEW }, de: { "security.audit.title": "Noch kein Audit" }, "en-US": { "security.audit.title": OLD } } }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("en security.audit.title");
});

test("fails for a translation too", async () => {
  const result = await check(site({ before: { en: { "security.audit.title": OLD }, de: { "security.audit.title": "Kein unabhängiges Audit" }, "en-US": { "security.audit.title": OLD } } }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("de security.audit.title");
});

test("en-US compares with the English it inherits when it has no text of its own", async () => {
  const result = await check(site({ before: { en: { "security.audit.title": OLD }, de: { "security.audit.title": "Noch kein Audit" }, "en-US": { "security.audit.title": NEW } } }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("en-US security.audit.title");
});

test("a listed exception with a reason passes", async () => {
  const result = await check(
    site({
      before: { en: { "security.audit.title": OLD }, de: { "security.audit.title": "Kein unabhängiges Audit" }, "en-US": { "security.audit.title": OLD } },
      same: { de: { "security.audit.title": "German already had the new wording" } },
    }),
  );
  expect(result.code).toBe(0);
});

test("an exception without a reason fails", async () => {
  const result = await check(
    site({
      before: { en: { "security.audit.title": OLD }, de: { "security.audit.title": "Kein unabhängiges Audit" }, "en-US": { "security.audit.title": OLD } },
      same: { de: { "security.audit.title": " " } },
    }),
  );
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("reason");
});

test("an exception that is no longer needed fails, so the list stays short", async () => {
  const result = await check(site({ same: { de: { "security.audit.title": "German already had the new wording" } } }));
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("held-same.json");
});
