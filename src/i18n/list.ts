import type { Language } from "./index";

/** Joins items the way the language does: "Mac and Windows", "Mac und Windows" */
export const listOf = (lang: Language, items: string[]) =>
  new Intl.ListFormat(lang.hreflang, { type: "conjunction" }).format(items);
