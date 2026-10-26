// The social preview images (scripts/make-og.mjs) are drawn with Noto fonts kept
// in the repo, in build-fonts/, on every machine: the deploy and the owner's Mac
// alike. Nothing is downloaded: on 26 October 2026 the deploy's apt download of
// the CJK fonts stalled three times and failed the deploy. The fonts are build
// tools only, never served by the site.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const FONTS = `${root}build-fonts`;
const FONT_FILE = /\.(ttf|otf|ttc|otc|woff2?)$/i;

const makeOg = async (args: string[]) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/make-og.mjs`, ...args], { maxBuffer: 64 * 1024 * 1024 });
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

test("build-fonts holds the Noto fonts the images need, each with its OFL licence", () => {
  const files = readdirSync(FONTS);
  for (const font of ["NotoSans-ExtraBold.ttf", "NotoSans-Black.ttf", "NotoSansCJK-Black.ttc", "NotoSansThai-Black.ttf", "NotoSansDevanagari-Black.ttf"])
    expect(files, font).toContain(font);
  const licences = files.filter((f) => /^OFL/.test(f));
  expect(licences.length, "an OFL licence file for each source").toBeGreaterThanOrEqual(4);
  for (const licence of licences) expect(readFileSync(join(FONTS, licence), "utf8"), licence).toContain("SIL Open Font License");
  expect(files, "fontconfig is told to use these fonts only").toContain("fonts.conf");
});

test("no font file is anywhere the site serves", () => {
  const served = (dir: string) => (existsSync(dir) ? readdirSync(dir, { recursive: true }).map(String).filter((f) => FONT_FILE.test(f)) : []);
  expect(served(`${root}public`), "public/").toEqual([]);
  expect(served(`${root}src`), "src/").toEqual([]);
  expect(served(`${root}dist`), "the built site").toEqual([]);
});

test("the deploy downloads no fonts", () => {
  const workflow = readFileSync(`${root}.github/workflows/deploy.yml`, "utf8");
  expect(workflow, "no apt-get").not.toMatch(/apt-get/);
  expect(workflow, "no font packages").not.toMatch(/fonts-noto/);
  expect(workflow, "no check of system fonts").not.toMatch(/fc-match/);
});

test("every language's preview images are drawn from build-fonts, with no missing glyphs", async () => {
  test.setTimeout(10 * 60_000);
  const out = mkdtempSync(join(tmpdir(), "og-"));
  const result = await makeOg(["--langs", "all", "--out", out]);
  expect(result.output).toContain("every title's characters are in build-fonts");
  expect(result.code, result.output.slice(-2000)).toBe(0);
  const { languages } = JSON.parse(readFileSync(`${root}src/i18n/languages.json`, "utf8")) as { languages: { code: string; path: string }[] };
  for (const lang of languages.filter((l) => l.code !== "en")) {
    const images = readdirSync(join(out, lang.path)).filter((f) => f.endsWith(".png"));
    expect(images.length, `${lang.code} images`).toBeGreaterThanOrEqual(10);
  }
});

test("a title with a character no build font has fails, naming the language and the character", async () => {
  // Without the Thai font, the Thai titles cannot be drawn: the run must stop, not draw empty boxes
  const fonts = mkdtempSync(join(tmpdir(), "fonts-"));
  cpSync(FONTS, fonts, { recursive: true });
  rmSync(join(fonts, "NotoSansThai-Black.ttf"));
  const result = await makeOg(["--langs", "th", "--out", mkdtempSync(join(tmpdir(), "og-")), "--fonts", fonts]);
  expect(result.code).toBe(1);
  expect(result.output).toContain("th");
  expect(result.output).toMatch(/missing/i);
  expect(result.output).toMatch(/[฀-๿]/);
});
