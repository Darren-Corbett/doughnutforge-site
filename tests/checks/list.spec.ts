// Lists of platform names, as each language writes them (src/i18n/list.ts).
// Thai and Chinese put a space between their own script and a Latin name
// (copy-style.md, Voice in translation), but Intl.ListFormat joins them:
// "iPhoneและiPad", "iPhone和iPad". The list keeps that space.
import { expect, test } from "@playwright/test";
import type { Language } from "../../src/i18n";
import { listOf } from "../../src/i18n/list";

// Only the language tag matters; the site index reads a JSON file the test runner cannot
const lang = (hreflang: string) => ({ hreflang }) as Language;

test("Thai and Chinese keep a space around Latin names", () => {
  expect(listOf(lang("th"), ["iPhone", "iPad"])).toBe("iPhone และ iPad");
  expect(listOf(lang("th"), ["Mac", "Windows"])).toBe("Mac และ Windows");
  expect(listOf(lang("zh-CN"), ["iPhone", "iPad"])).toBe("iPhone 和 iPad");
  expect(listOf(lang("zh-CN"), ["iPhone", "iPad", "Android"])).toBe("iPhone、iPad 和 Android");
  expect(listOf(lang("zh-TW"), ["Mac", "Windows"])).toBe("Mac 和 Windows");
});

// The store list ("App Store or Google Play") keeps the same spaces, Japanese too
test("store lists keep a space around Latin names", () => {
  const stores = ["App Store", "Google Play"];
  expect(listOf(lang("zh-CN"), stores, "disjunction")).toBe("App Store 或 Google Play");
  expect(listOf(lang("zh-TW"), stores, "disjunction")).toBe("App Store 或 Google Play");
  expect(listOf(lang("ja"), stores, "disjunction")).toBe("App Store または Google Play");
  expect(listOf(lang("th"), stores, "disjunction")).toBe("App Store หรือ Google Play");
  expect(listOf(lang("en-US"), stores, "disjunction")).toBe("App Store or Google Play");
});

// copy-style.md: en-US differs from en only in spelling, so no serial comma
test("US English lists match UK English", () => {
  expect(listOf(lang("en-US"), ["iPhone", "iPad", "Android"])).toBe("iPhone, iPad and Android");
  expect(listOf(lang("en-US"), ["Mac", "Windows"])).toBe("Mac and Windows");
});

test("other languages are left as Intl writes them", () => {
  expect(listOf(lang("de"), ["iPhone", "iPad", "Android"])).toBe("iPhone, iPad und Android");
  expect(listOf(lang("ja"), ["iPhone", "iPad", "Android"])).toBe("iPhone、iPad、Android");
  expect(listOf(lang("en-GB"), ["Mac", "Windows"])).toBe("Mac and Windows");
});
