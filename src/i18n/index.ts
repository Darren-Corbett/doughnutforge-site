import languageData from "./languages.json";
import review from "./review.json";
import enUi from "./ui/en";
import enApp from "./app/en.json";
import enStore from "./store/en.json";

export type Language = (typeof languageData.languages)[number];
export type UiKey = keyof typeof enUi;
export type AppKey = Exclude<keyof typeof enApp, "_source">;
export type StoreCopy = typeof enStore;

// Pages and strings that exist only in English: the blog (posts launch in English
// and are translated only after review) and the 404 page (GitHub Pages serves one
// 404.html for every address).
type EnglishOnlyKey = Extract<UiKey, `blog.${string}` | `meta.blog.${string}` | `notFound.${string}` | `meta.notFound.${string}` | "nav.blog">;
/** The keys every language's string file must have, no more and no fewer */
export type TranslatedKey = Exclude<UiKey, EnglishOnlyKey>;
export type Translation = Record<TranslatedKey, string>;

export const languages: Language[] = languageData.languages;
export const defaultLanguage = languages.find((l) => l.code === "en")!;

// Every language has a file in ui/, app/ and store/ with the same keys as English
const byCode = <T>(files: Record<string, T>) =>
  Object.fromEntries(Object.entries(files).map(([path, value]) => [path.replace(/^.*\/|\.(ts|json)$/g, ""), value]));
const ui = byCode(import.meta.glob<Translation>("./ui/*.ts", { eager: true, import: "default" }));
const app = byCode(import.meta.glob<Record<AppKey, string>>("./app/*.json", { eager: true, import: "default" }));
const store = byCode(import.meta.glob<StoreCopy>("./store/*.json", { eager: true, import: "default" }));

/** The languages with site copy: every app language once Phase 3 is complete */
export const builtLanguages = languages.filter((l) => ui[l.code] && app[l.code] && store[l.code]);

export const getLanguage = (code: string) => languages.find((l) => l.code === code) ?? defaultLanguage;

const englishOnly = (key: UiKey): key is EnglishOnlyKey => /^(blog|meta\.blog|notFound|meta\.notFound)\.|^nav\.blog$/.test(key);

/** UI copy, app wording and store copy for one language. */
export const useStrings = (code: string) => {
  const strings = ui[code];
  if (!strings || !app[code] || !store[code]) throw new Error(`No site copy for ${code}: add src/i18n/ui/${code}.ts and run npm run sync:app`);
  return {
    t: (key: UiKey) => (englishOnly(key) ? enUi[key] : strings[key]),
    app: (key: AppKey) => app[code]![key],
    store: store[code]!,
  };
};

/**
 * Whether a language's pages may be indexed. A language stays a draft (noindex,
 * left out of hreflang and the sitemap) until src/i18n/review.json marks it reviewed.
 */
export const isReviewed = (code: string) => (review as Record<string, { status: string }>)[code]?.status === "reviewed";

/** The URL of a page in a language: "/" for English, "/de/" and so on for the rest. */
export const localePath = (code: string, path = "/") => {
  const lang = getLanguage(code);
  const clean = path.replace(/^\/+/, "");
  return lang.code === defaultLanguage.code ? `/${clean}` : `/${lang.path}/${clean}`;
};

/** The pages that exist in every language, as paths without the language folder */
export const translatedPages = ["", "features/", "pricing/", "download/", "privacy/", "support/", "press/", "legal/"];

/** Splits a URL path into its language and the page path: "/de/features/" -> de, "features/" */
export const splitPath = (pathname: string) => {
  const [first = "", ...rest] = pathname.replace(/^\/+/, "").split("/");
  const lang = languages.find((l) => l.code !== defaultLanguage.code && l.path === first);
  return lang ? { lang, page: rest.join("/") } : { lang: defaultLanguage, page: pathname.replace(/^\/+/, "") };
};

/** getStaticPaths for a page in every language but English (English has its own route) */
export const otherLanguagePaths = () =>
  builtLanguages.filter((l) => l.code !== defaultLanguage.code).map((l) => ({ params: { lang: l.path }, props: { lang: l } }));

/** Joins items the way the language does: "Mac and Windows", "Mac und Windows" */
export const listOf = (lang: Language, items: string[]) =>
  new Intl.ListFormat(lang.hreflang, { type: "conjunction" }).format(items);

/** Fills the {name} slots in a string */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (slot, key: string) => (key in values ? String(values[key]) : slot));
