// The Google Play badges are the owner's official "Get it on Google Play" files
// (owner, 20 November 2026), used unaltered: never the pre-register badges.
// sources.json records each file's original name and its SHA-256, so any edit
// to a badge, or a pre-register file in its place, fails here.
import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

const DIR = "src/assets/badges";
const files = readdirSync(`${DIR}/google-play`).filter((f) => f.endsWith(".svg"));
const sources = JSON.parse(readFileSync(`${DIR}/sources.json`, "utf8")) as Record<string, string>;
const alts = JSON.parse(readFileSync(`${DIR}/alt.json`, "utf8"))["google-play"] as Record<string, string>;
const { languages } = JSON.parse(readFileSync("src/i18n/languages.json", "utf8")) as { languages: { code: string }[] };

test("Google Play has an official English badge and no placeholder", () => {
  expect(files).toContain("en.svg");
  expect(files.filter((f) => f.includes(".placeholder."))).toEqual([]);
});

test("every Google Play badge is a Get it on Google Play file, unaltered", () => {
  for (const f of files) {
    const source = sources[`google-play/${f}`] ?? "";
    expect(source, f).toMatch(/^Badge_GetItOnGP_[a-z0-9]+_Digital_Fullcolor_GooglePlay\.svg /);
    expect(source, f).not.toMatch(/PreRegister/i);
    const sha = createHash("sha256").update(readFileSync(`${DIR}/google-play/${f}`)).digest("hex");
    expect(source, f).toContain(`sha256 ${sha}`);
  }
});

test("every Google Play badge is for a site language and has its own alt text", () => {
  const codes = languages.map((l) => l.code);
  for (const f of files) {
    const code = f.replace(/\.svg$/, "");
    expect(codes, f).toContain(code);
    expect(alts[code], f).toMatch(/Google Play/);
  }
  // A regional language may show its base language's file (en-US uses en.svg)
  for (const code of Object.keys(alts)) expect([`${code}.svg`, `${code.split("-")[0]}.svg`].some((f) => files.includes(f)), code).toBe(true);
});
