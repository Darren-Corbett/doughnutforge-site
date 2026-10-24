// hreflang: the same page in every language that may be indexed. Shared by the
// <head> (SEO.astro) and the sitemap (astro.config.mjs), so the two always agree.
import languageData from "./languages.json";
import review from "./review.json";
import { issueLists, shownLists } from "../data/issues";

export type Alternate = { hreflang: string; href: string };

/** The pages that exist in every language, as paths without the language folder */
export const translatedPages = [
  "",
  "features/",
  "pricing/",
  "download/",
  "privacy/",
  "support/",
  "press/",
  "legal/",
  "roadmap/",
  "security/",
  // Answered questions and Known issues, once each has an issue in it
  ...shownLists.map((l) => issueLists[l].path),
];

const SITE = "https://doughnut-forge.app";
const reviewed = (code: string) => (review as Record<string, { status: string }>)[code]?.status === "reviewed";

// Plain language codes for readers in other regions, so they get the nearest
// language rather than English: an Australian gets UK English, an Argentinian
// Spanish (Spain), a reader in Portugal Portuguese (Brazil).
export const EXTRA_HREFLANG: Record<string, string> = { en: "en", es: "es", "pt-BR": "pt" };

/**
 * Every indexable version of a page, `page` being its path without the language
 * folder ("", "features/"). Empty for a page in a draft language (drafts are not
 * indexed) and for a page that exists in one language only, such as the blog.
 */
export const alternatesFor = (code: string, page: string): Alternate[] => {
  if (!reviewed(code) || !translatedPages.includes(page)) return [];
  const href = (path: string) => `${SITE}/${path ? `${path}/` : ""}${page}`;
  const list: Alternate[] = [];
  for (const l of languageData.languages.filter((l) => reviewed(l.code))) {
    const path = l.code === "en" ? "" : l.path;
    list.push({ hreflang: l.hreflang, href: href(path) });
    const extra = EXTRA_HREFLANG[l.code];
    if (extra) list.push({ hreflang: extra, href: href(path) });
  }
  list.push({ hreflang: "x-default", href: href("") });
  return list;
};
