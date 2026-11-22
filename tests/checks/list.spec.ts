// Lists of platform names, as each language writes them (src/i18n/list.ts).
// Thai and Chinese put a space between their own script and a Latin name
// (copy-style.md, Voice in translation), but Intl.ListFormat joins them:
// "iPhoneและiPad", "iPhone和iPad". The list keeps that space.
import { expect, test } from "@playwright/test";
import { languages } from "../../src/i18n";
import { listOf } from "../../src/i18n/list";

const lang = (code: string) => languages.find((l) => l.code === code)!;

test("Thai and Chinese keep a space around Latin names", () => {
  expect(listOf(lang("th"), ["iPhone", "iPad"])).toBe("iPhone และ iPad");
  expect(listOf(lang("th"), ["Mac", "Windows"])).toBe("Mac และ Windows");
  expect(listOf(lang("zh-CN"), ["iPhone", "iPad"])).toBe("iPhone 和 iPad");
  expect(listOf(lang("zh-CN"), ["iPhone", "iPad", "Android"])).toBe("iPhone、iPad 和 Android");
  expect(listOf(lang("zh-TW"), ["Mac", "Windows"])).toBe("Mac 和 Windows");
});

test("other languages are left as Intl writes them", () => {
  expect(listOf(lang("de"), ["iPhone", "iPad", "Android"])).toBe("iPhone, iPad und Android");
  expect(listOf(lang("ja"), ["iPhone", "iPad", "Android"])).toBe("iPhone、iPad、Android");
  expect(listOf(lang("en"), ["Mac", "Windows"])).toBe("Mac and Windows");
});
