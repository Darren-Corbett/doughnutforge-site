import languageData from "./languages.json";
import enUi from "./ui/en";
import enApp from "./app/en.json";
import enStore from "./store/en.json";

export type Language = (typeof languageData.languages)[number];
export type UiKey = keyof typeof enUi;
export type AppKey = Exclude<keyof typeof enApp, "_source">;

export const languages: Language[] = languageData.languages;
export const defaultLanguage = languages.find((l) => l.code === "en")!;

// Only English is built in Phase 1; Phase 3 adds every language here with the same keys.
const ui: Record<string, Record<UiKey, string>> = { en: enUi };
const app: Record<string, Record<AppKey, string>> = { en: enApp };
const store: Record<string, typeof enStore> = { en: enStore };

export const getLanguage = (code: string) => languages.find((l) => l.code === code) ?? defaultLanguage;

/** UI copy, app wording and store copy for one language. */
export const useStrings = (code: string) => ({
  t: (key: UiKey) => ui[code]?.[key] ?? enUi[key],
  app: (key: AppKey) => app[code]?.[key] ?? enApp[key],
  store: store[code] ?? enStore,
});

/** The URL of a page in a language: "/" for English, "/de/" and so on for the rest. */
export const localePath = (code: string, path = "/") => {
  const lang = getLanguage(code);
  const clean = path.replace(/^\/+/, "");
  return lang.code === defaultLanguage.code ? `/${clean}` : `/${lang.path}/${clean}`;
};
