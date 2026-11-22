import type { Language } from "./index";

// Thai and Chinese put a space between their own script and a Latin name
// ("iPhone และ iPad", "iPhone 和 iPad"; copy-style.md), which Intl.ListFormat leaves out
const SCRIPT_THEN_LATIN = /([\u0E00-\u0E7F\u4E00-\u9FFF])(?=[A-Za-z0-9])|([A-Za-z0-9])(?=[\u0E00-\u0E7F\u4E00-\u9FFF])/g;

/** Joins items the way the language does: "Mac and Windows", "Mac und Windows" */
export const listOf = (lang: Language, items: string[]) =>
  new Intl.ListFormat(lang.hreflang, { type: "conjunction" }).format(items).replace(SCRIPT_THEN_LATIN, "$1$2 ");
