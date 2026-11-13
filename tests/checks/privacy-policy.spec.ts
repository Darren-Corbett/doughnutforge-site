// The privacy policy (src/content/legal/privacy/, the source of truth since
// 13 November 2026): every language has the same parts and links as English,
// the website has its own section, the opening is about the app, and the
// built pages say exactly what the files say (scripts/check-privacy-wording.mjs).
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const dir = `${root}src/content/legal/privacy/`;
type Policy = { links: Record<string, string>; strings: Record<string, string> };
const read = (code: string): Policy => JSON.parse(readFileSync(`${dir}${code}.json`, "utf8"));
const languages = JSON.parse(readFileSync(`${root}src/i18n/languages.json`, "utf8")).languages as { code: string; path: string }[];
const en = read("en");
const tokens = (s: string) => [...s.matchAll(/\[\[\/?(\w+)\]\]/g)].map((m) => m[0]).join("");
const ui = async (code: string, key: string): Promise<string> => {
  const own = (await import(`../../src/i18n/ui/${code}.ts`)).default as Record<string, string>;
  return own[key] ?? ((await import("../../src/i18n/ui/en.ts")).default as Record<string, string>)[key]!;
};

const WEBSITE = ["sec6Title", "sec6Counts", "sec6Never", "sec6Device", "sec6Processor", "sec6Basis", "sec6OptOut", "sec6Public", "sec6Hosting"];

test("every language has a policy file", () => {
  expect(readdirSync(dir).filter((f) => f.endsWith(".json")).sort()).toEqual(languages.map((l) => `${l.code}.json`).sort());
});

test("the English opening is about the app, and the website has its own section", () => {
  expect(en.strings.hero).toContain("The Doughnut Forge app");
  expect(en.strings.hero).not.toContain("we do not collect");
  for (const key of WEBSITE) expect(en.strings[key], key).toBeTruthy();
  expect(en.strings.sec6Title).toBe("6. This Website");
  expect(en.strings.effectiveDate).toBe("Effective Date: November 2026");
});

test("no English sentence still says the website does not track or count", () => {
  const all = Object.values(en.strings).join(" ");
  expect(all).not.toContain("We do not add any tracking or analytics");
  expect(all).not.toContain("because we do not track you");
  expect(en.strings.sec2Desc).toContain("The Doughnut Forge app contains no");
});

test("the website section states each fact", () => {
  const s = en.strings;
  expect(s.sec6Counts).toContain("daily totals only");
  for (const fact of ["pages viewed", "language", "two-letter code, never a city", "domain only", "taps on store buttons", "never stored together"]) expect(s.sec6Counts, fact).toContain(fact);
  for (const fact of ["IP addresses", "browser identity strings", "full addresses", "times", "links one visit to another", "no cookies"]) expect(s.sec6Never, fact).toContain(fact);
  for (const fact of ["The counter stores nothing on your device", "opt-out flag", "build number", "session storage"]) expect(s.sec6Device, fact).toContain(fact);
  for (const fact of ["Cloudflare", "Workers and D1", "Western Europe", "IP address", "never reads or stores it", "network error reporting", "[[cf]]"]) expect(s.sec6Processor, fact).toContain(fact);
  for (const fact of ["legitimate interest", "which pages help people", "13 months"]) expect(s.sec6Basis, fact).toContain(fact);
  for (const fact of ["Do Not Track", "Global Privacy Control", "JavaScript", "Content blockers"]) expect(s.sec6OptOut, fact).toContain(fact);
  for (const fact of ["[[stats]]", "analytics-worker/", "[[repo]]"]) expect(s.sec6Public, fact).toContain(fact);
});

for (const { code, path } of languages)
  test(`${code}: the same parts, links and link places as English`, async () => {
    const policy = read(code);
    expect(Object.keys(policy.strings).sort()).toEqual(Object.keys(en.strings).sort());
    expect(Object.keys(policy.links).sort()).toEqual(Object.keys(en.links).sort());
    for (const key of Object.keys(en.strings)) expect(tokens(policy.strings[key]!), `${code} ${key}`).toBe(tokens(en.strings[key]!));
    for (const key of Object.keys(en.links)) if (key !== "stats") expect(policy.links[key], `${code} ${key}`).toBe(en.links[key]);
    expect(policy.links.stats).toBe(path === "en" ? "/stats/" : `/${path}/stats/`);
    // The policy names the opt-out button by the words on it
    expect(policy.strings.sec6OptOut).toContain(await ui(code, "stats.optout.off"));
  });

test("the built privacy pages say exactly what the policy files say, in every language", async () => {
  const { stdout } = await promisify(execFile)(process.execPath, [`${root}scripts/check-privacy-wording.mjs`], { cwd: root });
  expect(stdout).toContain(`${languages.length} language(s)`);
  expect(stdout).toContain("0 differences from src/content/legal/privacy");
  expect(stdout).not.toContain("forge-privacy");
});
