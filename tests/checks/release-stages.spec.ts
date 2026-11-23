// The stores release 3.0 one by one (owner, 18 November 2026), so the site
// switches in stages, each worked out from src/data/release.json:
//   android     Android is on sale (Google Play)
//   mobileFree  a phone store on sale sells 3.0: free to download, with one in-app purchase
//   first3   the first store sells 3.0: the FAQs on new contact codes and older apps
//   all3     every store on sale sells 3.0: the new format's copy and the white paper
//   live3    3.0 is live: all3, and Android is on sale (the roadmap's 3.1 and 4.0)
// Until a stage is reached, its strings keep their earlier text (src/i18n/before/).
import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import english from "../../src/i18n/ui/en";
import { stageReached } from "../../src/data/stages";
import { gated } from "../../src/i18n/gated";

type Status = "available" | "coming";
const list = (status: Record<string, Status>) => Object.entries(status).map(([id, s]) => ({ id, status: s }));
const today = list({ ios: "available", android: "coming", mac: "available", windows: "available" });
const androidOnSale = list({ ios: "available", android: "available", mac: "available", windows: "available" });

test("no stage is reached before any store sells 3.0", () => {
  for (const stage of ["android", "first3", "all3"] as const) expect(stageReached(stage, today, []), stage).toBe(false);
});

test("one store with 3.0 reaches the first stage only", () => {
  expect(stageReached("first3", today, ["ios"])).toBe(true);
  expect(stageReached("all3", today, ["ios"])).toBe(false);
  expect(stageReached("android", today, ["ios"])).toBe(false);
});

test("Android on sale reaches the Android stage and, with its 3.0, the first stage", () => {
  expect(stageReached("android", androidOnSale, ["android"])).toBe(true);
  expect(stageReached("first3", androidOnSale, ["android"])).toBe(true);
  expect(stageReached("all3", androidOnSale, ["android"])).toBe(false);
});

test("the last stage needs every store on sale to sell 3.0", () => {
  expect(stageReached("all3", androidOnSale, ["ios", "android", "mac"])).toBe(false);
  expect(stageReached("all3", androidOnSale, ["ios", "android", "mac", "windows"])).toBe(true);
  // A platform that is still coming does not hold the stage back
  expect(stageReached("all3", today, ["ios", "mac", "windows"])).toBe(true);
});

test("3.0 is live only once every store on sale sells it and Android is on sale", () => {
  // Every store on sale sells 3.0, but Android is still coming
  expect(stageReached("all3", today, ["ios", "mac", "windows"])).toBe(true);
  expect(stageReached("live3", today, ["ios", "mac", "windows"])).toBe(false);
  expect(stageReached("live3", androidOnSale, ["ios", "android", "mac"])).toBe(false);
  expect(stageReached("live3", androidOnSale, ["ios", "android", "mac", "windows"])).toBe(true);
});

test("the mobile pricing stage follows the first phone store with 3.0, never a computer store", () => {
  expect(stageReached("mobileFree", today, [])).toBe(false);
  expect(stageReached("mobileFree", today, ["mac", "windows"])).toBe(false);
  expect(stageReached("mobileFree", today, ["ios"])).toBe(true);
  expect(stageReached("mobileFree", androidOnSale, ["android"])).toBe(true);
  // Android not on sale yet: its 3.0 alone does not count
  expect(stageReached("mobileFree", today, ["android"])).toBe(false);
});

test("the release data names only real platforms, and Android goes on sale with 3.0", () => {
  const release = JSON.parse(readFileSync("src/data/release.json", "utf8")) as { androidOnSale: boolean; storesWith3: string[] };
  expect(typeof release.androidOnSale).toBe("boolean");
  for (const id of release.storesWith3) expect(["ios", "android", "mac", "windows"]).toContain(id);
  if (release.androidOnSale) expect(release.storesWith3).toContain("android");
});

test("every gated key is an English key with a known stage", () => {
  const keys = Object.keys(gated as Record<string, string>);
  expect(keys.length).toBeGreaterThan(0);
  for (const [key, stage] of Object.entries(gated as Record<string, string>)) {
    expect(Object.keys(english), key).toContain(key);
    expect(["android", "mobileFree", "first3", "all3", "live3"], key).toContain(stage);
  }
});

// A gated key that already had text keeps it, in every language, until its
// stage; a gated key that is new has none, and the page leaves it out
test("every language keeps the earlier text of the same gated keys", () => {
  const read = (code: string) => JSON.parse(readFileSync(`src/i18n/before/${code}.json`, "utf8")) as Record<string, string>;
  const keys = Object.keys(read("en")).sort();
  expect(keys.length).toBeGreaterThan(0);
  for (const key of keys) expect(Object.keys(gated as Record<string, string>), key).toContain(key);
  for (const lang of languageData.languages.filter((l) => existsSync(`src/i18n/ui/${l.code}.ts`))) {
    const own = read(lang.code);
    expect(Object.keys(own).sort(), lang.code).toEqual(keys);
    for (const key of keys) expect(own[key]!.trim(), `${lang.code} ${key}`).not.toBe("");
  }
});
