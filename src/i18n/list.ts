import type { Language } from "./index";

// Thai and Chinese put a space between their own script and a Latin name
// ("iPhone และ iPad", "iPhone 和 iPad"; copy-style.md), which Intl.ListFormat leaves out
const SCRIPT_THEN_LATIN = /([\u0E00-\u0E7F\u4E00-\u9FFF])(?=[A-Za-z0-9])|([A-Za-z0-9])(?=[\u0E00-\u0E7F\u4E00-\u9FFF])/g;

// US English differs from UK English only in spelling (copy-style.md), so its
// lists take no serial comma: "iPhone, iPad and Android"
const listLocale = (hreflang: string) => (hreflang.startsWith("en") ? "en-GB" : hreflang);

/** Joins items the way the language does: "Mac and Windows", "Mac und Windows"; with "disjunction", "App Store or Google Play" */
export const listOf = (lang: Language, items: string[], type: "conjunction" | "disjunction" = "conjunction") =>
  new Intl.ListFormat(listLocale(lang.hreflang), { type }).format(items).replace(SCRIPT_THEN_LATIN, "$1$2 ");
