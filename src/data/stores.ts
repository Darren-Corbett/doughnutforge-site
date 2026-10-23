import { listOf, type Language } from "../i18n";
import { placeholder } from "./placeholder";

// Where each platform is sold. Adding a store later is a data change here only:
// set the platform to "available" and give it a store and an ID.
//
// The apps are not sold in the EU yet, so links never name a country: each store
// sends the visitor to their own storefront and shows what is available there.

export type StoreId = "mac-app-store" | "app-store" | "microsoft-store" | "google-play";
export type PlatformId = "mac" | "windows" | "ios" | "linux" | "android";

export type Platform =
  | { id: PlatformId; status: "available"; store: StoreId; storeId: string }
  | { id: PlatformId; status: "coming" };

export const platforms: Platform[] = [
  { id: "mac", status: "available", store: "mac-app-store", storeId: placeholder("Mac App Store ID") },
  { id: "windows", status: "available", store: "microsoft-store", storeId: "9P25BS9L8LNB" },
  { id: "ios", status: "coming" },
  // Linux is planned for November 2026 and will be free; pages say "coming soon" until then.
  { id: "linux", status: "coming" },
  { id: "android", status: "coming" },
];

// Store and platform names are names: the same in every language.
export const storeNames: Record<StoreId, string> = {
  "mac-app-store": "Mac App Store",
  "app-store": "App Store",
  "microsoft-store": "Microsoft Store",
  "google-play": "Google Play",
};

/** A platform's name in a language: only "iPhone and iPad" needs the language's own "and" */
export const platformName = (lang: Language, id: PlatformId) =>
  id === "ios" ? listOf(lang, ["iPhone", "iPad"]) : { mac: "Mac", windows: "Windows", linux: "Linux", android: "Android" }[id];

/**
 * The store page for an app, in the visitor's language where the store allows it.
 * `hl` is the page language as a BCP 47 tag (en-GB, de, pt-BR...).
 */
export const storeUrl = (store: StoreId, storeId: string, hl: string) => {
  switch (store) {
    // Apple: no country code, so Apple picks the visitor's own storefront.
    // Never map a language to a country store.
    case "mac-app-store":
    case "app-store":
      return `https://apps.apple.com/app/id${storeId}`;
    case "microsoft-store":
      return `https://apps.microsoft.com/detail/${storeId}?hl=${hl}`;
    case "google-play":
      return `https://play.google.com/store/apps/details?id=${storeId}&hl=${hl}`;
  }
};
